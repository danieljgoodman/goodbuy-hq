import { PrismaClient, BusinessCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function addTechCorpSample() {
  console.log(
    'Adding TechCorp Solutions sample business for Financial Health Dashboard testing...'
  )

  try {
    // Get the test business owner
    const testOwner = await prisma.user.findUnique({
      where: { email: 'testowner@goodbuyhq.com' },
    })

    if (!testOwner) {
      console.log(
        '❌ Test business owner not found. Please run create-test-users.ts first.'
      )
      return
    }

    // Check if TechCorp Solutions already exists
    const existingBusiness = await prisma.business.findFirst({
      where: { title: 'TechCorp Solutions' },
    })

    if (existingBusiness) {
      console.log(
        '✅ TechCorp Solutions already exists with ID:',
        existingBusiness.id
      )

      // Update it with complete financial data if needed
      await prisma.business.update({
        where: { id: existingBusiness.id },
        data: {
          ownerId: testOwner.id, // Ensure it's owned by test owner
          status: 'ACTIVE',
          revenue: 500000,
          profit: 125000,
          monthlyRevenue: 41667,
          cashFlow: 150000,
          ebitda: 175000,
          employees: 12,
          customerBase: 250,
        },
      })

      console.log('✅ Updated TechCorp Solutions with complete financial data')
    } else {
      // Create TechCorp Solutions with the specified data
      const business = await prisma.business.create({
        data: {
          title: 'TechCorp Solutions',
          description:
            'A leading software development company specializing in enterprise solutions and custom applications. TechCorp Solutions has established itself as a trusted partner for businesses looking to modernize their operations through innovative technology.',
          category: BusinessCategory.TECHNOLOGY,
          industry: 'Software Development',
          location: 'San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          website: 'https://techcorpsolutions.com',
          phone: '(415) 555-0100',
          email: 'info@techcorpsolutions.com',
          askingPrice: 1250000, // 2.5x revenue multiple
          revenue: 500000,
          profit: 125000,
          monthlyRevenue: 41667,
          cashFlow: 150000,
          ebitda: 175000,
          grossMargin: 75.0, // Typical for software companies
          netMargin: 25.0, // 125k profit / 500k revenue
          yearlyGrowth: 15.5, // Healthy growth rate
          established: new Date('2018-01-01'),
          employees: 12,
          customerBase: 250,
          status: 'ACTIVE',
          ownerId: testOwner.id,
          publishedAt: new Date(),
          slug: `techcorp-solutions-${Date.now().toString(36)}`,
          featured: true,
          priority: 10,
          viewCount: 0,
          inquiryCount: 0,
          listingType: 'BUSINESS_SALE',
          hoursOfOperation: '9:00 AM - 6:00 PM',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          reasonForSelling: 'Founder wants to start a new venture',
          timeframe: '3-6_months',
          negotiations: 'negotiable',
          financing:
            'SBA financing available, seller financing for qualified buyers',
        },
      })

      console.log(
        '✅ Created TechCorp Solutions business with ID:',
        business.id
      )

      // Create some sample business images
      const imageData = [
        {
          businessId: business.id,
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
          alt: 'TechCorp Solutions Office Building',
          isPrimary: true,
          orderIndex: 0,
          size: 180000,
          width: 800,
          height: 600,
          format: 'jpeg',
        },
        {
          businessId: business.id,
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
          alt: 'TechCorp Solutions Team Meeting',
          isPrimary: false,
          orderIndex: 1,
          size: 165000,
          width: 800,
          height: 600,
          format: 'jpeg',
        },
        {
          businessId: business.id,
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
          alt: 'TechCorp Solutions Development Team',
          isPrimary: false,
          orderIndex: 2,
          size: 175000,
          width: 800,
          height: 600,
          format: 'jpeg',
        },
      ]

      await prisma.businessImage.createMany({
        data: imageData,
      })

      console.log('✅ Added sample images for TechCorp Solutions')
    }

    // Now create comprehensive health metrics for the business
    const business = await prisma.business.findFirst({
      where: { title: 'TechCorp Solutions' },
    })

    if (business) {
      // Check if health metrics already exist
      const existingMetrics = await prisma.healthMetric.findFirst({
        where: { businessId: business.id },
      })

      if (!existingMetrics) {
        // Create health metrics based on the financial data
        await prisma.healthMetric.create({
          data: {
            businessId: business.id,
            overallScore: 82, // Good overall score
            growthScore: 85, // Strong growth (15.5% yearly)
            operationalScore: 78, // Good operational efficiency
            financialScore: 88, // Strong financial performance (25% profit margin)
            saleReadinessScore: 75, // Good documentation and presentation
            confidenceLevel: 90, // High confidence due to complete data
            trajectory: 'IMPROVING',
            dataSources: {
              revenue: 'financial_statements',
              profit: 'tax_returns',
              employees: 'payroll_records',
              growth: 'historical_data',
            },
            calculationMetadata: {
              revenueGrowth: 15.5,
              profitMargin: 25.0,
              cashFlowRatio: 1.2,
              employeeProductivity: 41667, // Revenue per employee
              industryBenchmark: 'above_average',
              riskFactors: ['market_competition', 'talent_retention'],
              strengths: [
                'strong_margins',
                'consistent_growth',
                'skilled_team',
              ],
            },
          },
        })

        console.log('✅ Created health metrics for TechCorp Solutions')
      } else {
        console.log('✅ Health metrics already exist for TechCorp Solutions')
      }

      // Create some forecast results
      const existingForecasts = await prisma.forecastResult.findFirst({
        where: { businessId: business.id },
      })

      if (!existingForecasts) {
        const forecastData = [
          {
            businessId: business.id,
            forecastType: 'REVENUE',
            forecastPeriod: 12, // 12 months
            predictedValue: 575000, // 15% growth
            confidenceIntervalLower: 550000,
            confidenceIntervalUpper: 600000,
            confidenceScore: 85,
            modelUsed: 'linear_regression',
          },
          {
            businessId: business.id,
            forecastType: 'PROFIT',
            forecastPeriod: 12,
            predictedValue: 143750, // Maintaining 25% margin
            confidenceIntervalLower: 135000,
            confidenceIntervalUpper: 152500,
            confidenceScore: 82,
            modelUsed: 'linear_regression',
          },
          {
            businessId: business.id,
            forecastType: 'CASH_FLOW',
            forecastPeriod: 12,
            predictedValue: 172500,
            confidenceIntervalLower: 165000,
            confidenceIntervalUpper: 180000,
            confidenceScore: 80,
            modelUsed: 'arima',
          },
        ]

        await prisma.forecastResult.createMany({
          data: forecastData,
        })

        console.log('✅ Created forecast results for TechCorp Solutions')
      } else {
        console.log('✅ Forecast results already exist for TechCorp Solutions')
      }
    }

    console.log('\n🎉 TechCorp Solutions sample business setup complete!')
    console.log('\nBusiness Details:')
    console.log('• Name: TechCorp Solutions')
    console.log('• Category: Technology / Software Development')
    console.log('• Revenue: $500,000')
    console.log('• Profit: $125,000 (25% margin)')
    console.log('• Cash Flow: $150,000')
    console.log('• EBITDA: $175,000')
    console.log('• Employees: 12')
    console.log('• Established: 2018')
    console.log('• Customer Base: 250')
    console.log('• Overall Health Score: 82/100')
    console.log(
      '\n✅ The business is now available for Financial Health Dashboard testing!'
    )
  } catch (error) {
    console.error('Error adding TechCorp Solutions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTechCorpSample().catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})
