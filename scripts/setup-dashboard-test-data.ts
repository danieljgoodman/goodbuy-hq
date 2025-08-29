import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDashboardTestData() {
  console.log('Setting up dashboard test data...')

  try {
    // Get our test users
    const testOwner = await prisma.user.findUnique({
      where: { email: 'testowner@goodbuyhq.com' },
    })

    const testBuyer = await prisma.user.findUnique({
      where: { email: 'testbuyer@goodbuyhq.com' },
    })

    const testBroker = await prisma.user.findUnique({
      where: { email: 'testbroker@goodbuyhq.com' },
    })

    if (!testOwner || !testBuyer || !testBroker) {
      console.log(
        '❌ Test users not found. Please run create-test-users.ts first.'
      )
      return
    }

    // Get some existing businesses to work with
    const existingBusinesses = await prisma.business.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
    })

    if (existingBusinesses.length === 0) {
      console.log(
        '❌ No businesses found. Please run create-sample-businesses.ts first.'
      )
      return
    }

    // Assign first 3 businesses to test business owner
    const ownerBusinessIds = existingBusinesses.slice(0, 3).map(b => b.id)
    await prisma.business.updateMany({
      where: { id: { in: ownerBusinessIds } },
      data: { ownerId: testOwner.id, status: 'ACTIVE' },
    })
    console.log(
      `✅ Assigned ${ownerBusinessIds.length} businesses to test business owner`
    )

    // Assign next 2 businesses to test broker
    const brokerBusinessIds = existingBusinesses.slice(3, 5).map(b => b.id)
    await prisma.business.updateMany({
      where: { id: { in: brokerBusinessIds } },
      data: { ownerId: testBroker.id, status: 'ACTIVE' },
    })
    console.log(
      `✅ Assigned ${brokerBusinessIds.length} businesses to test broker`
    )

    // Create some favorites for the test buyer
    for (const business of existingBusinesses.slice(0, 4)) {
      await prisma.favorite.upsert({
        where: {
          userId_businessId: {
            userId: testBuyer.id,
            businessId: business.id,
          },
        },
        update: {},
        create: {
          userId: testBuyer.id,
          businessId: business.id,
        },
      })
    }
    console.log('✅ Created favorites for test buyer')

    // Create some inquiries
    for (const business of existingBusinesses.slice(0, 3)) {
      await prisma.inquiry.create({
        data: {
          businessId: business.id,
          userId: testBuyer.id,
          subject: `Inquiry about ${business.title}`,
          message: `I'm interested in learning more about this ${business.category?.toLowerCase() || 'business'} opportunity. Could you please provide more details about the financial performance and growth potential?`,
          contactName: `${testBuyer.firstName} ${testBuyer.lastName}`,
          contactEmail: testBuyer.email,
          contactPhone: '555-0123',
          isRead: Math.random() > 0.5, // Random read status
        },
      })
    }
    console.log('✅ Created inquiries from test buyer')

    // Create some business views
    for (const business of existingBusinesses) {
      const viewCount = Math.floor(Math.random() * 50) + 10
      for (let i = 0; i < viewCount; i++) {
        await prisma.businessView.create({
          data: {
            businessId: business.id,
            userId: Math.random() > 0.5 ? testBuyer.id : undefined,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Test Browser)',
            duration: Math.floor(Math.random() * 300) + 30,
            createdAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ),
          },
        })
      }
    }
    console.log('✅ Created business views for analytics')

    // Create some evaluations for the broker
    for (const business of brokerBusinessIds.slice(0, 2)) {
      await prisma.evaluation.create({
        data: {
          businessId: business,
          evaluatorId: testBroker.id,
          title: `Professional Evaluation - ${existingBusinesses.find(b => b.id === business)?.title}`,
          summary:
            'Comprehensive business evaluation focusing on financial performance, market position, and growth potential.',
          financialScore: Math.floor(Math.random() * 30) + 70,
          operationalScore: Math.floor(Math.random() * 30) + 70,
          marketScore: Math.floor(Math.random() * 30) + 70,
          overallScore: Math.floor(Math.random() * 20) + 75,
          strengths: [
            'Strong market position',
            'Experienced management',
            'Growing revenue',
          ],
          weaknesses: ['Limited online presence', 'Seasonal fluctuations'],
          opportunities: ['Digital transformation', 'Market expansion'],
          threats: ['Increasing competition', 'Economic uncertainty'],
          recommendations:
            'Focus on digital marketing and operational efficiency improvements.',
          estimatedValue: Math.floor(Math.random() * 500000) + 1000000,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }
    console.log('✅ Created evaluations for test broker')

    // Create a saved search for the buyer
    await prisma.savedSearch.create({
      data: {
        userId: testBuyer.id,
        name: 'Tech Businesses Under $2M',
        query: {
          category: 'TECHNOLOGY',
          maxPrice: 2000000,
          location: 'California',
        },
        emailAlerts: true,
      },
    })
    console.log('✅ Created saved search for test buyer')

    console.log('\n🎉 Dashboard test data setup complete!')
    console.log('\nYou can now test:')
    console.log('• Business Owner Dashboard with real listings and analytics')
    console.log(
      '• Buyer Dashboard with favorites, inquiries, and saved searches'
    )
    console.log('• Broker Dashboard with client listings and evaluations')
    console.log('• Admin Dashboard with system overview and user management')
  } catch (error) {
    console.error('Error setting up test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDashboardTestData()
