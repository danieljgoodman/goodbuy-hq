#!/usr/bin/env tsx

/**
 * Health Scoring Engine Test Script
 *
 * Creates test businesses with realistic financial data and validates
 * the health scoring algorithms work correctly end-to-end.
 */

import { PrismaClient } from '@prisma/client'
import {
  calculateHealthScores,
  prepareHealthMetricData,
  generateHealthInsights,
} from '../src/lib/health-scoring'

const prisma = new PrismaClient()

// Test business scenarios with realistic financial data
const testBusinesses = [
  {
    title: 'GreenTech Solutions LLC',
    description:
      'Sustainable technology consulting firm specializing in renewable energy solutions for small to medium businesses. Established client base with recurring revenue model.',
    industry: 'Technology',
    category: 'TECHNOLOGY',
    location: 'Austin, TX',
    established: new Date('2019-03-15'),
    employees: 12,

    // Financial Data - Healthy Tech Company
    askingPrice: 850000,
    revenue: 425000,
    profit: 85000,
    monthlyRevenue: 35416.67,
    cashFlow: 95000,
    ebitda: 110000,
    grossMargin: 0.68,
    netMargin: 0.2,
    yearlyGrowth: 0.15,
    totalAssets: 180000,
    liabilities: 45000,
    equipment: 25000,
    inventory: 5000,

    // Operational Data
    customerBase: 85,
    hoursOfOperation: 'Monday-Friday 8am-6pm',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    seasonality: 'Not seasonal - consistent year-round demand',
    competition:
      'Moderate competition from larger firms, but strong niche positioning',

    ownerId: 'test-owner-1',
  },
  {
    title: 'Main Street Bakery & Cafe',
    description:
      'Family-owned bakery and cafe serving fresh baked goods, specialty coffee, and light lunch items. Prime downtown location with strong local following.',
    industry: 'Food Service',
    category: 'RESTAURANT',
    location: 'Downtown Portland, OR',
    established: new Date('2015-08-01'),
    employees: 8,

    // Financial Data - Struggling Restaurant
    askingPrice: 275000,
    revenue: 185000,
    profit: 12000,
    monthlyRevenue: 15416.67,
    cashFlow: 8000,
    ebitda: 25000,
    grossMargin: 0.45,
    netMargin: 0.065,
    yearlyGrowth: -0.08,
    totalAssets: 95000,
    liabilities: 68000,
    equipment: 45000,
    inventory: 8000,
    realEstate: 0, // Renting

    // Operational Data
    customerBase: 450,
    hoursOfOperation: 'Tuesday-Sunday 6am-4pm',
    daysOpen: [
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    seasonality: 'Peak summer months, slower in winter',
    competition: 'High competition from chain stores and new cafes',

    ownerId: 'test-owner-2',
  },
  {
    title: 'Regional Logistics Services',
    description:
      'Mid-size logistics and warehousing company serving regional e-commerce businesses. Strong relationships with major shipping carriers and modern warehouse facilities.',
    industry: 'Logistics',
    category: 'SERVICES',
    location: 'Phoenix, AZ',
    established: new Date('2012-01-10'),
    employees: 45,

    // Financial Data - Strong Service Business
    askingPrice: 1800000,
    revenue: 920000,
    profit: 184000,
    monthlyRevenue: 76666.67,
    cashFlow: 195000,
    ebitda: 225000,
    grossMargin: 0.42,
    netMargin: 0.2,
    yearlyGrowth: 0.12,
    totalAssets: 580000,
    liabilities: 185000,
    equipment: 125000,
    inventory: 15000,
    realEstate: 340000,

    // Operational Data
    customerBase: 120,
    hoursOfOperation: '24/7 operations with shift coverage',
    daysOpen: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    seasonality: 'Peak during holiday seasons (Q4), steady year-round',
    competition:
      'Limited local competition, mostly compete with large national players',

    ownerId: 'test-owner-3',
  },
]

async function createTestUser(id: string, email: string, name: string) {
  return await prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      email,
      name,
      userType: 'SELLER',
      emailVerified: new Date(),
    },
  })
}

async function createTestBusiness(businessData: any) {
  const business = await prisma.business.upsert({
    where: {
      title: businessData.title,
    },
    update: businessData,
    create: {
      ...businessData,
      status: 'APPROVED',
      publishedAt: new Date(),
    },
  })

  console.log(
    `✅ Created test business: ${business.title} (ID: ${business.id})`
  )
  return business
}

async function testHealthScoring(businessId: string, businessTitle: string) {
  console.log(`\n🧮 Testing health scoring for: ${businessTitle}`)
  console.log('='.repeat(60))

  const startTime = Date.now()

  try {
    // Fetch the business data
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      throw new Error(`Business not found: ${businessId}`)
    }

    // Run health scoring calculation
    console.log('🔄 Calculating health scores...')
    const healthResult = await calculateHealthScores(business)

    const calculationTime = Date.now() - startTime
    console.log(`⏱️  Calculation completed in ${calculationTime}ms`)

    // Display results
    console.log('\n📊 HEALTH SCORES:')
    console.log(`Overall Score: ${healthResult.scores.overall}/100`)
    console.log(`Financial: ${healthResult.scores.financial}/100`)
    console.log(`Growth: ${healthResult.scores.growth}/100`)
    console.log(`Operational: ${healthResult.scores.operational}/100`)
    console.log(`Sale Readiness: ${healthResult.scores.saleReadiness}/100`)
    console.log(`Confidence: ${healthResult.scores.confidence}/100`)
    console.log(`Trajectory: ${healthResult.scores.trajectory}`)

    // Generate insights
    console.log('\n💡 AI INSIGHTS:')
    const insights = generateHealthInsights(healthResult)
    console.log(`Summary: ${insights.summary}`)
    console.log(`\nKey Strengths:`)
    insights.keyStrengths.forEach(strength => console.log(`  • ${strength}`))
    console.log(`\nKey Weaknesses:`)
    insights.keyWeaknesses.forEach(weakness => console.log(`  • ${weakness}`))
    console.log(`\nRecommendations:`)
    insights.recommendations.forEach(rec => console.log(`  • ${rec}`))

    // Test data persistence
    console.log('\n💾 Testing data persistence...')
    const healthMetricData = prepareHealthMetricData(businessId, healthResult)

    const savedMetric = await prisma.healthMetric.create({
      data: {
        ...healthMetricData,
        calculationMetadata: {
          ...healthMetricData.calculationMetadata,
          testRun: true,
          calculationDuration: `${calculationTime}ms`,
        },
      },
    })

    console.log(`✅ Health metric saved to database (ID: ${savedMetric.id})`)

    return {
      businessId,
      healthResult,
      calculationTime,
      insights,
      savedMetricId: savedMetric.id,
    }
  } catch (error) {
    console.error(`❌ Error testing ${businessTitle}:`, error)
    throw error
  }
}

async function validatePerformance(results: any[]) {
  console.log('\n🚀 PERFORMANCE VALIDATION')
  console.log('='.repeat(60))

  const avgTime =
    results.reduce((sum, r) => sum + r.calculationTime, 0) / results.length
  const maxTime = Math.max(...results.map(r => r.calculationTime))
  const minTime = Math.min(...results.map(r => r.calculationTime))

  console.log(`Average calculation time: ${avgTime.toFixed(0)}ms`)
  console.log(`Fastest calculation: ${minTime}ms`)
  console.log(`Slowest calculation: ${maxTime}ms`)

  const performanceTarget = 5000 // 5 seconds
  const passedPerformance = maxTime < performanceTarget

  console.log(`\n🎯 Performance Target: <${performanceTarget}ms`)
  console.log(
    `${passedPerformance ? '✅' : '❌'} ${passedPerformance ? 'PASSED' : 'FAILED'} - Max time: ${maxTime}ms`
  )

  return passedPerformance
}

async function validateScoreRanges(results: any[]) {
  console.log('\n📈 SCORE VALIDATION')
  console.log('='.repeat(60))

  let allValid = true

  for (const result of results) {
    const { healthResult, businessId } = result
    const scores = healthResult.scores

    // Check all scores are 0-100
    const scoreFields = [
      'overall',
      'financial',
      'growth',
      'operational',
      'saleReadiness',
      'confidence',
    ]
    for (const field of scoreFields) {
      const score = scores[field]
      if (score < 0 || score > 100 || isNaN(score)) {
        console.log(
          `❌ Invalid ${field} score: ${score} for business ${businessId}`
        )
        allValid = false
      }
    }

    // Check trajectory is valid
    const validTrajectories = ['IMPROVING', 'STABLE', 'DECLINING', 'VOLATILE']
    if (!validTrajectories.includes(scores.trajectory)) {
      console.log(
        `❌ Invalid trajectory: ${scores.trajectory} for business ${businessId}`
      )
      allValid = false
    }
  }

  console.log(
    `${allValid ? '✅' : '❌'} Score range validation: ${allValid ? 'PASSED' : 'FAILED'}`
  )
  return allValid
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')

  // Delete health metrics first (foreign key constraint)
  await prisma.healthMetric.deleteMany({
    where: {
      calculationMetadata: {
        path: ['testRun'],
        equals: true,
      },
    },
  })

  // Delete test businesses
  for (const testBiz of testBusinesses) {
    await prisma.business.deleteMany({
      where: { title: testBiz.title },
    })
  }

  // Delete test users
  await prisma.user.deleteMany({
    where: {
      id: { in: ['test-owner-1', 'test-owner-2', 'test-owner-3'] },
    },
  })

  console.log('✅ Test data cleaned up')
}

async function main() {
  console.log('🧪 HEALTH SCORING ENGINE TEST SUITE')
  console.log('=='.repeat(30))
  console.log(`Test started at: ${new Date().toISOString()}`)

  try {
    // Create test users
    console.log('\n👤 Creating test users...')
    await createTestUser('test-owner-1', 'test1@example.com', 'Test Owner 1')
    await createTestUser('test-owner-2', 'test2@example.com', 'Test Owner 2')
    await createTestUser('test-owner-3', 'test3@example.com', 'Test Owner 3')

    // Create test businesses
    console.log('\n🏢 Creating test businesses...')
    const businesses = []
    for (const testBiz of testBusinesses) {
      const business = await createTestBusiness(testBiz)
      businesses.push(business)
    }

    // Test health scoring for each business
    console.log('\n🧮 Running health scoring tests...')
    const results = []
    for (const business of businesses) {
      const result = await testHealthScoring(business.id, business.title)
      results.push(result)
    }

    // Validate results
    const performancePassed = await validatePerformance(results)
    const scoresPassed = await validateScoreRanges(results)

    // Final summary
    console.log('\n📋 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Businesses tested: ${results.length}`)
    console.log(
      `${performancePassed ? '✅' : '❌'} Performance requirement: ${performancePassed ? 'PASSED' : 'FAILED'}`
    )
    console.log(
      `${scoresPassed ? '✅' : '❌'} Score validation: ${scoresPassed ? 'PASSED' : 'FAILED'}`
    )

    const overallPassed = performancePassed && scoresPassed
    console.log(
      `\n🎯 OVERALL RESULT: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
    )

    if (!overallPassed) {
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error)
    process.exit(1)
  } finally {
    await cleanupTestData()
    await prisma.$disconnect()
  }
}

// Run the test suite
if (require.main === module) {
  main()
}
