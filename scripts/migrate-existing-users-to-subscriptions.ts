import {
  PrismaClient,
  SubscriptionTier,
  SubscriptionStatus,
} from '@prisma/client'
import { SUBSCRIPTION_TIERS } from '../src/lib/subscription/subscription-tiers'

const prisma = new PrismaClient()

interface UserAnalysis {
  id: string
  email: string
  userType: string
  createdAt: Date
  businessCount: number
  evaluationCount: number
  lastLoginAt: Date | null
  recommendedTier: SubscriptionTier
  reason: string
}

async function analyzeExistingUsers(): Promise<UserAnalysis[]> {
  console.log('🔍 Analyzing existing users...')

  const users = await prisma.user.findMany({
    include: {
      businesses: true,
      evaluations: true,
      _count: {
        select: {
          businesses: true,
          evaluations: true,
          inquiries: true,
        },
      },
    },
    where: {
      subscription: null, // Only users without existing subscriptions
    },
  })

  const analyses: UserAnalysis[] = users.map(user => {
    const businessCount = user._count.businesses
    const evaluationCount = user._count.evaluations
    const inquiryCount = user._count.inquiries

    // Analysis logic to determine appropriate tier
    let recommendedTier: SubscriptionTier = SubscriptionTier.FREE
    let reason = 'Default free tier for new users'

    // Business activity analysis
    if (businessCount >= 5 || evaluationCount >= 10) {
      recommendedTier = SubscriptionTier.PROFESSIONAL
      reason = `High activity: ${businessCount} businesses, ${evaluationCount} evaluations`
    } else if (
      businessCount >= 10 ||
      evaluationCount >= 25 ||
      inquiryCount >= 50
    ) {
      recommendedTier = SubscriptionTier.ENTERPRISE
      reason = `Very high activity: ${businessCount} businesses, ${evaluationCount} evaluations, ${inquiryCount} inquiries`
    }

    // User type considerations
    if (user.userType === 'BROKER' && businessCount > 0) {
      recommendedTier =
        businessCount >= 5
          ? SubscriptionTier.ENTERPRISE
          : SubscriptionTier.PROFESSIONAL
      reason = `Broker with ${businessCount} businesses - professional needs`
    } else if (user.userType === 'ADMIN') {
      recommendedTier = SubscriptionTier.ENTERPRISE
      reason = 'Admin user - full access required'
    }

    // Recent activity bonus
    const daysSinceLastLogin = user.lastLoginAt
      ? Math.floor(
          (Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999

    if (
      daysSinceLastLogin <= 30 &&
      recommendedTier === SubscriptionTier.FREE &&
      businessCount > 0
    ) {
      recommendedTier = SubscriptionTier.PROFESSIONAL
      reason = `Recent activity (${daysSinceLastLogin} days) with business data`
    }

    return {
      id: user.id,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt,
      businessCount,
      evaluationCount,
      lastLoginAt: user.lastLoginAt,
      recommendedTier,
      reason,
    }
  })

  return analyses
}

async function createSubscriptionsForUsers(
  analyses: UserAnalysis[]
): Promise<void> {
  console.log('📝 Creating subscriptions for analyzed users...')

  let created = 0
  let errors = 0

  for (const analysis of analyses) {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[analysis.recommendedTier]

      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: analysis.id,
          tier: analysis.recommendedTier,
          status: SubscriptionStatus.ACTIVE,
          aiAnalysesPerMonthLimit:
            tierConfig.limits.aiAnalysesPerMonth === -1
              ? 999999
              : tierConfig.limits.aiAnalysesPerMonth,
          portfolioSizeLimit:
            tierConfig.limits.portfolioSize === -1
              ? 999999
              : tierConfig.limits.portfolioSize,
          reportGenerationLimit:
            tierConfig.limits.reportGeneration === -1
              ? 999999
              : tierConfig.limits.reportGeneration,
          currentAIAnalysesUsed: 0,
          currentReportsGenerated: 0,
          metadata: {
            migrationReason: analysis.reason,
            migratedAt: new Date().toISOString(),
            originalUserType: analysis.userType,
          },
        },
      })

      // Update user with subscription info
      await prisma.user.update({
        where: { id: analysis.id },
        data: {
          subscriptionTier: analysis.recommendedTier,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
      })

      console.log(
        `✅ Created ${analysis.recommendedTier} subscription for ${analysis.email} (${analysis.reason})`
      )
      created++
    } catch (error) {
      console.error(
        `❌ Failed to create subscription for ${analysis.email}:`,
        error
      )
      errors++
    }
  }

  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successfully created: ${created}`)
  console.log(`   ❌ Errors: ${errors}`)
}

async function sendNotificationEmails(analyses: UserAnalysis[]): Promise<void> {
  console.log('📧 Creating notification records for users...')

  for (const analysis of analyses) {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[analysis.recommendedTier]

      await prisma.notification.create({
        data: {
          userId: analysis.id,
          type: 'SYSTEM_ALERT',
          status: 'PENDING',
          title: 'Welcome to Your New Subscription Tier!',
          message: `Great news! Based on your usage, we've enrolled you in our ${tierConfig.name} tier (${tierConfig.priceMonthly > 0 ? 'FREE for existing users' : 'FREE'}). Enjoy ${tierConfig.limits.aiAnalysesPerMonth === -1 ? 'unlimited' : tierConfig.limits.aiAnalysesPerMonth} AI analyses per month and more!`,
          actionUrl: '/dashboard/subscription',
          priority: 'normal',
          channel: ['email', 'in_app'],
          data: {
            tier: analysis.recommendedTier,
            reason: analysis.reason,
          },
        },
      })
    } catch (error) {
      console.error(
        `Failed to create notification for ${analysis.email}:`,
        error
      )
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting user migration to subscription system...\n')

    // Step 1: Analyze existing users
    const analyses = await analyzeExistingUsers()

    if (analyses.length === 0) {
      console.log('✨ No users found that need migration!')
      return
    }

    console.log(`\n📋 Analysis Results (${analyses.length} users):`)
    const tierCounts = analyses.reduce(
      (acc, a) => {
        acc[a.recommendedTier] = (acc[a.recommendedTier] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} users`)
    })

    // Show some examples
    console.log(`\n🔍 Sample assignments:`)
    analyses.slice(0, 5).forEach(a => {
      console.log(`   ${a.email}: ${a.recommendedTier} (${a.reason})`)
    })

    // Step 2: Create subscriptions
    await createSubscriptionsForUsers(analyses)

    // Step 3: Send notifications
    await sendNotificationEmails(analyses)

    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run only if called directly
if (require.main === module) {
  main()
}

export { analyzeExistingUsers, createSubscriptionsForUsers }
