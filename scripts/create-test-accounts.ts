import { PrismaClient, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestAccounts() {
  try {
    console.log('🧪 Creating Test Accounts for Communication System...\n')

    // Test accounts data
    const testAccounts = [
      {
        email: 'seller@goodbuyhq.com',
        name: 'Sarah Business Owner',
        firstName: 'Sarah',
        lastName: 'Johnson',
        userType: UserType.BUSINESS_OWNER,
        company: 'Johnson Tech Solutions',
        position: 'CEO & Founder',
        bio: 'Successful tech entrepreneur with 15 years of experience. Looking to sell my profitable SaaS business.',
        password: 'Seller123!',
      },
      {
        email: 'buyer@goodbuyhq.com',
        name: 'Michael Investor',
        firstName: 'Michael',
        lastName: 'Chen',
        userType: UserType.BUYER,
        company: 'Chen Ventures',
        position: 'Principal Investor',
        bio: 'Investment professional specializing in technology acquisitions. Looking for established businesses.',
        password: 'Buyer123!',
      },
      {
        email: 'broker@goodbuyhq.com',
        name: 'Emily Broker',
        firstName: 'Emily',
        lastName: 'Martinez',
        userType: UserType.BROKER,
        company: 'Elite Business Brokerage',
        position: 'Senior Business Broker',
        bio: 'Certified business broker with expertise in middle-market transactions.',
        password: 'Broker123!',
      },
    ]

    const createdAccounts = []

    for (const account of testAccounts) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      })

      if (existingUser) {
        console.log(`✅ ${account.name} (${account.email}) already exists`)
        createdAccounts.push(existingUser)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: account.email,
          name: account.name,
          firstName: account.firstName,
          lastName: account.lastName,
          hashedPassword,
          userType: account.userType,
          status: 'ACTIVE',
          emailVerified: new Date(),
          company: account.company,
          position: account.position,
          bio: account.bio,
        },
      })

      // Create communication preferences
      await prisma.communicationPreferences.create({
        data: {
          userId: user.id,
          emailNewMessages: true,
          emailMeetingInvites: true,
          emailDocumentShares: true,
          emailDigest: true,
          digestFrequency: 'daily',
          showReadReceipts: true,
          showOnlineStatus: true,
          allowDirectMessages: true,
        },
      })

      console.log(
        `✅ Created ${account.name} (${account.email}) - ${account.userType}`
      )
      createdAccounts.push(user)
    }

    // Create a sample business listing
    const seller = createdAccounts.find(
      u => u.userType === UserType.BUSINESS_OWNER
    )
    if (seller) {
      const existingBusiness = await prisma.business.findFirst({
        where: { ownerId: seller.id },
      })

      if (!existingBusiness) {
        const business = await prisma.business.create({
          data: {
            title: 'TechFlow SaaS Platform',
            description:
              'Profitable B2B SaaS platform serving 500+ enterprise clients with $2M ARR. Fully automated operations with strong recurring revenue model.',
            industry: 'Technology',
            location: 'Austin, TX',
            website: 'https://techflow-saas.example.com',
            askingPrice: 8000000, // $8M
            revenue: 2000000, // $2M ARR
            profit: 800000, // $800K profit
            established: new Date('2019-01-01'),
            employees: 12,
            status: 'ACTIVE',
            featured: true,
            ownerId: seller.id,
            slug: 'techflow-saas-platform',
            metaTitle:
              'TechFlow SaaS Platform - Profitable B2B Software Business',
            metaDescription:
              'Established B2B SaaS platform with $2M ARR and 500+ enterprise clients. Fully automated operations.',
          },
        })

        console.log(`✅ Created sample business listing: ${business.title}`)
      }
    }

    console.log('\n🎉 Test Accounts Setup Complete!')
    console.log('\n📋 Test Account Credentials:')
    console.log(
      '┌─────────────────────┬──────────────────────────┬─────────────────┬─────────────────┐'
    )
    console.log(
      '│ Role                │ Email                    │ Password        │ User Type       │'
    )
    console.log(
      '├─────────────────────┼──────────────────────────┼─────────────────┼─────────────────┤'
    )
    console.log(
      '│ Business Owner      │ seller@goodbuyhq.com     │ Seller123!      │ BUSINESS_OWNER  │'
    )
    console.log(
      '│ Buyer/Investor      │ buyer@goodbuyhq.com      │ Buyer123!       │ BUYER           │'
    )
    console.log(
      '│ Business Broker     │ broker@goodbuyhq.com     │ Broker123!      │ BROKER          │'
    )
    console.log(
      '│ System Admin        │ test@goodbuyhq.com       │ Test123456!     │ ADMIN           │'
    )
    console.log(
      '└─────────────────────┴──────────────────────────┴─────────────────┴─────────────────┘'
    )

    console.log('\n🔗 Access URLs:')
    console.log('• Main Application: http://localhost:3000')
    console.log('• Sign In: http://localhost:3000/auth/signin')
    console.log('• Messaging: http://localhost:3000/messages')
    console.log('• Dashboard: http://localhost:3000/dashboard')

    console.log('\n📱 Testing Scenarios:')
    console.log('1. Login as buyer → Start conversation about business')
    console.log('2. Login as seller → Respond and share documents')
    console.log('3. Schedule meeting between buyer and seller')
    console.log('4. Test real-time messaging in two browser windows')
    console.log('5. Test mobile interface on phone browser')
  } catch (error) {
    console.error('❌ Error creating test accounts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Create sample conversation data
async function createSampleConversation() {
  try {
    console.log('\n💬 Creating Sample Conversation...')

    const seller = await prisma.user.findUnique({
      where: { email: 'seller@goodbuyhq.com' },
    })
    const buyer = await prisma.user.findUnique({
      where: { email: 'buyer@goodbuyhq.com' },
    })
    const business = await prisma.business.findFirst()

    if (!seller || !buyer || !business) {
      console.log(
        '⚠️ Skipping sample conversation - missing accounts or business'
      )
      return
    }

    // Check if conversation already exists
    const existingThread = await prisma.communicationThread.findFirst({
      where: {
        businessId: business.id,
        participants: {
          some: { userId: seller.id },
        },
      },
    })

    if (existingThread) {
      console.log('✅ Sample conversation already exists')
      return
    }

    // Create conversation thread
    const thread = await prisma.communicationThread.create({
      data: {
        subject: `Inquiry about ${business.title}`,
        businessId: business.id,
      },
    })

    // Add participants
    await prisma.threadParticipant.createMany({
      data: [
        {
          threadId: thread.id,
          userId: buyer.id,
          isAdmin: true,
        },
        {
          threadId: thread.id,
          userId: seller.id,
          isAdmin: false,
        },
      ],
    })

    // Create sample messages
    const messages = [
      {
        content: `Hi Sarah, I'm very interested in your TechFlow SaaS platform. The $2M ARR and 500+ enterprise clients look impressive. Could you share more details about the revenue breakdown and customer retention rates?`,
        senderId: buyer.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        content: `Hello Michael! Thank you for your interest. I'd be happy to share those details. Our revenue is 85% from annual contracts with a 95% retention rate. The customer base spans manufacturing, logistics, and professional services. Would you like to schedule a call to discuss further?`,
        senderId: seller.id,
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      },
      {
        content: `That's excellent retention! Yes, I'd love to schedule a call. I'm also interested in seeing the financial statements and customer contracts if possible. What's your availability this week?`,
        senderId: buyer.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ]

    for (const msg of messages) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          senderId: msg.senderId,
          content: msg.content,
          status: 'SENT',
          createdAt: msg.createdAt,
        },
      })
    }

    // Update thread lastMessageAt
    await prisma.communicationThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: messages[messages.length - 1].createdAt },
    })

    console.log('✅ Sample conversation created with 3 messages')
  } catch (error) {
    console.error('❌ Error creating sample conversation:', error)
  }
}

// Run if called directly
if (require.main === module) {
  createTestAccounts()
    .then(() => createSampleConversation())
    .then(() => {
      console.log(
        '\n🚀 Ready for testing! Login with any of the accounts above.'
      )
      process.exit(0)
    })
    .catch(error => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}

export { createTestAccounts, createSampleConversation }
