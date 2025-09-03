#!/usr/bin/env tsx

/**
 * Health Scoring Algorithm Test Script
 *
 * Tests the health scoring algorithms directly without database dependencies.
 * Validates scoring logic, performance, and edge cases.
 */

import {
  calculateHealthScores,
  generateHealthInsights,
} from '../src/lib/health-scoring'
import type { Business, BusinessCategory } from '@prisma/client'

// Mock Business objects for testing
const testBusinesses = [
  {
    id: 'test-tech-1',
    title: 'GreenTech Solutions LLC',
    description:
      'Sustainable technology consulting firm specializing in renewable energy solutions for small to medium businesses. Established client base with recurring revenue model.',
    industry: 'Technology',
    category: 'TECHNOLOGY' as BusinessCategory,
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

    // Required fields for Business type
    status: 'APPROVED' as const,
    featured: false,
    images: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'test-owner-1',
    inquiryCount: 0,
    viewCount: 0,
    priority: 0,
    country: 'US',
    listingType: 'BUSINESS_SALE' as const,
  },
  {
    id: 'test-restaurant-1',
    title: 'Main Street Bakery & Cafe',
    description:
      'Family-owned bakery and cafe serving fresh baked goods, specialty coffee, and light lunch items. Prime downtown location with strong local following.',
    industry: 'Food Service',
    category: 'RESTAURANT' as BusinessCategory,
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
    realEstate: null,

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

    // Required fields
    status: 'APPROVED' as const,
    featured: false,
    images: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'test-owner-2',
    inquiryCount: 0,
    viewCount: 0,
    priority: 0,
    country: 'US',
    listingType: 'BUSINESS_SALE' as const,
  },
  {
    id: 'test-services-1',
    title: 'Regional Logistics Services',
    description:
      'Mid-size logistics and warehousing company serving regional e-commerce businesses. Strong relationships with major shipping carriers and modern warehouse facilities.',
    industry: 'Logistics',
    category: 'SERVICES' as BusinessCategory,
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

    // Required fields
    status: 'APPROVED' as const,
    featured: false,
    images: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'test-owner-3',
    inquiryCount: 0,
    viewCount: 0,
    priority: 0,
    country: 'US',
    listingType: 'BUSINESS_SALE' as const,
  },
] as Business[]

async function testHealthScoring(business: Business) {
  console.log(`\n🧮 Testing health scoring for: ${business.title}`)
  console.log('='.repeat(60))

  const startTime = Date.now()

  try {
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

    // Display breakdown
    console.log('\n🔍 SCORE BREAKDOWN:')
    console.log(`Financial Breakdown:`)
    console.log(`  Score: ${healthResult.breakdown.financial.score}`)
    console.log(
      `  Factors: ${healthResult.breakdown.financial.factors.slice(0, 3).join('; ')}`
    )

    console.log(`\nGrowth Breakdown:`)
    console.log(`  Score: ${healthResult.breakdown.growth.score}`)
    console.log(
      `  Factors: ${healthResult.breakdown.growth.factors.slice(0, 3).join('; ')}`
    )

    // Generate insights
    console.log('\n💡 AI INSIGHTS:')
    const insights = generateHealthInsights(healthResult)
    console.log(`Summary: ${insights.summary}`)
    console.log(`\nKey Strengths (${insights.keyStrengths.length}):`)
    insights.keyStrengths
      .slice(0, 2)
      .forEach(strength => console.log(`  • ${strength}`))
    console.log(`\nKey Weaknesses (${insights.keyWeaknesses.length}):`)
    insights.keyWeaknesses
      .slice(0, 2)
      .forEach(weakness => console.log(`  • ${weakness}`))

    return {
      businessId: business.id,
      businessTitle: business.title,
      healthResult,
      calculationTime,
      insights,
    }
  } catch (error) {
    console.error(`❌ Error testing ${business.title}:`, error)
    throw error
  }
}

function validateScoreRanges(results: any[]) {
  console.log('\n📈 SCORE VALIDATION')
  console.log('='.repeat(60))

  let allValid = true
  const issues: string[] = []

  for (const result of results) {
    const { healthResult, businessTitle } = result
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
        issues.push(`Invalid ${field} score: ${score} for ${businessTitle}`)
        allValid = false
      }
    }

    // Check trajectory is valid
    const validTrajectories = ['IMPROVING', 'STABLE', 'DECLINING', 'VOLATILE']
    if (!validTrajectories.includes(scores.trajectory)) {
      issues.push(
        `Invalid trajectory: ${scores.trajectory} for ${businessTitle}`
      )
      allValid = false
    }

    // Check that financial scores make logical sense
    if (scores.financial > 80 && scores.overall < 50) {
      issues.push(
        `Suspicious: High financial score (${scores.financial}) but low overall (${scores.overall}) for ${businessTitle}`
      )
    }
  }

  if (issues.length > 0) {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  • ${issue}`))
  }

  console.log(
    `${allValid ? '✅' : '❌'} Score range validation: ${allValid ? 'PASSED' : 'FAILED'}`
  )
  return allValid
}

function validatePerformance(results: any[]) {
  console.log('\n🚀 PERFORMANCE VALIDATION')
  console.log('='.repeat(60))

  const times = results.map(r => r.calculationTime)
  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
  const maxTime = Math.max(...times)
  const minTime = Math.min(...times)

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

function validateBusinessLogic(results: any[]) {
  console.log('\n🧠 BUSINESS LOGIC VALIDATION')
  console.log('='.repeat(60))

  let logicValid = true
  const observations: string[] = []

  // Find tech company (should have higher scores generally)
  const techResult = results.find(r => r.businessTitle.includes('GreenTech'))
  const restaurantResult = results.find(r => r.businessTitle.includes('Bakery'))
  const servicesResult = results.find(r =>
    r.businessTitle.includes('Logistics')
  )

  if (techResult && restaurantResult) {
    // Tech company with good metrics should score higher than struggling restaurant
    if (
      techResult.healthResult.scores.overall <=
      restaurantResult.healthResult.scores.overall
    ) {
      observations.push(
        "⚠️  Tech company doesn't score higher than struggling restaurant - check weights"
      )
    } else {
      observations.push(
        '✅ Tech company appropriately scores higher than struggling restaurant'
      )
    }

    // Financial scores should reflect the data
    if (restaurantResult.healthResult.scores.financial > 60) {
      observations.push(
        '⚠️  Struggling restaurant has high financial score - check thresholds'
      )
      logicValid = false
    }
  }

  if (servicesResult) {
    // Strong service business should have good operational scores
    if (servicesResult.healthResult.scores.operational < 60) {
      observations.push(
        '⚠️  Strong logistics company has low operational score - check calculation'
      )
      logicValid = false
    } else {
      observations.push(
        '✅ Strong logistics company has appropriate operational score'
      )
    }
  }

  observations.forEach(obs => console.log(obs))

  console.log(
    `\n${logicValid ? '✅' : '❌'} Business logic validation: ${logicValid ? 'PASSED' : 'FAILED'}`
  )
  return logicValid
}

function displayScoreComparison(results: any[]) {
  console.log('\n📊 SCORE COMPARISON')
  console.log('='.repeat(80))

  console.log(
    'Business'.padEnd(25) +
      'Overall'.padEnd(10) +
      'Financial'.padEnd(12) +
      'Growth'.padEnd(10) +
      'Operational'.padEnd(14) +
      'Sale Ready'
  )
  console.log('-'.repeat(80))

  for (const result of results) {
    const scores = result.healthResult.scores
    const name = result.businessTitle.substring(0, 24)
    console.log(
      name.padEnd(25) +
        scores.overall.toString().padEnd(10) +
        scores.financial.toString().padEnd(12) +
        scores.growth.toString().padEnd(10) +
        scores.operational.toString().padEnd(14) +
        scores.saleReadiness.toString()
    )
  }
}

async function main() {
  console.log('🧪 HEALTH SCORING ALGORITHM TEST SUITE')
  console.log('=='.repeat(35))
  console.log(`Test started at: ${new Date().toISOString()}`)

  try {
    // Test health scoring for each business
    console.log(`\n🏢 Testing ${testBusinesses.length} business scenarios...`)
    const results = []

    for (const business of testBusinesses) {
      const result = await testHealthScoring(business)
      results.push(result)
    }

    // Display comparison
    displayScoreComparison(results)

    // Run validations
    const performancePassed = validatePerformance(results)
    const scoresPassed = validateScoreRanges(results)
    const logicPassed = validateBusinessLogic(results)

    // Final summary
    console.log('\n📋 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Businesses tested: ${results.length}`)
    console.log(
      `${performancePassed ? '✅' : '❌'} Performance (<5s): ${performancePassed ? 'PASSED' : 'FAILED'}`
    )
    console.log(
      `${scoresPassed ? '✅' : '❌'} Score validation: ${scoresPassed ? 'PASSED' : 'FAILED'}`
    )
    console.log(
      `${logicPassed ? '✅' : '❌'} Business logic: ${logicPassed ? 'PASSED' : 'FAILED'}`
    )

    const overallPassed = performancePassed && scoresPassed && logicPassed
    console.log(
      `\n🎯 OVERALL RESULT: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
    )

    if (overallPassed) {
      console.log('\n🎉 Health scoring engine is working correctly!')
      console.log('✅ Ready for integration testing and UI development')
    }

    return overallPassed ? 0 : 1
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error)
    return 1
  }
}

// Run the test suite
if (require.main === module) {
  main().then(exitCode => {
    process.exit(exitCode)
  })
}
