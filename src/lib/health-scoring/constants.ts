// Industry benchmarks and scoring constants
export const INDUSTRY_BENCHMARKS = {
  // Gross margin thresholds by business category
  GROSS_MARGIN: {
    RESTAURANT: { poor: 0.15, average: 0.25, good: 0.35, excellent: 0.45 },
    RETAIL: { poor: 0.2, average: 0.3, good: 0.4, excellent: 0.5 },
    ECOMMERCE: { poor: 0.25, average: 0.35, good: 0.45, excellent: 0.6 },
    TECHNOLOGY: { poor: 0.4, average: 0.6, good: 0.75, excellent: 0.85 },
    MANUFACTURING: { poor: 0.15, average: 0.25, good: 0.35, excellent: 0.45 },
    SERVICES: { poor: 0.3, average: 0.45, good: 0.6, excellent: 0.75 },
    HEALTHCARE: { poor: 0.25, average: 0.35, good: 0.45, excellent: 0.6 },
    REAL_ESTATE: { poor: 0.2, average: 0.3, good: 0.45, excellent: 0.6 },
    AUTOMOTIVE: { poor: 0.15, average: 0.2, good: 0.3, excellent: 0.4 },
    ENTERTAINMENT: { poor: 0.2, average: 0.35, good: 0.5, excellent: 0.65 },
    EDUCATION: { poor: 0.25, average: 0.4, good: 0.55, excellent: 0.7 },
    OTHER: { poor: 0.2, average: 0.3, good: 0.4, excellent: 0.55 },
  },

  // Revenue growth expectations by business maturity (years in operation)
  REVENUE_GROWTH: {
    NEW_BUSINESS: { poor: 0.1, average: 0.25, good: 0.5, excellent: 1.0 }, // 0-2 years
    GROWING_BUSINESS: { poor: 0.05, average: 0.15, good: 0.3, excellent: 0.5 }, // 3-5 years
    MATURE_BUSINESS: { poor: 0.02, average: 0.05, good: 0.15, excellent: 0.25 }, // 6-10 years
    ESTABLISHED_BUSINESS: {
      poor: 0.0,
      average: 0.03,
      good: 0.08,
      excellent: 0.15,
    }, // 10+ years
  },

  // Employee efficiency ratios (revenue per employee in thousands)
  EMPLOYEE_EFFICIENCY: {
    RESTAURANT: { poor: 30, average: 50, good: 70, excellent: 100 },
    RETAIL: { poor: 80, average: 120, good: 160, excellent: 220 },
    ECOMMERCE: { poor: 150, average: 250, good: 400, excellent: 600 },
    TECHNOLOGY: { poor: 100, average: 200, good: 350, excellent: 500 },
    MANUFACTURING: { poor: 80, average: 150, good: 250, excellent: 400 },
    SERVICES: { poor: 60, average: 100, good: 150, excellent: 250 },
    HEALTHCARE: { poor: 100, average: 150, good: 200, excellent: 300 },
    REAL_ESTATE: { poor: 200, average: 350, good: 500, excellent: 750 },
    AUTOMOTIVE: { poor: 100, average: 180, good: 280, excellent: 400 },
    ENTERTAINMENT: { poor: 50, average: 100, good: 200, excellent: 350 },
    EDUCATION: { poor: 40, average: 70, good: 120, excellent: 200 },
    OTHER: { poor: 60, average: 120, good: 200, excellent: 300 },
  },
}

// Financial health scoring weights
export const FINANCIAL_WEIGHTS = {
  profitability: 0.4,
  liquidity: 0.3,
  efficiency: 0.3,
} as const

// Growth health scoring weights
export const GROWTH_WEIGHTS = {
  revenueGrowth: 0.5,
  marketExpansion: 0.3,
  scalability: 0.2,
} as const

// Operational health scoring weights
export const OPERATIONAL_WEIGHTS = {
  businessMaturity: 0.4,
  operationalEfficiency: 0.35,
  marketPositioning: 0.25,
} as const

// Sale readiness scoring weights
export const SALE_READINESS_WEIGHTS = {
  valuationReasonableness: 0.5,
  marketAttractiveness: 0.3,
  documentationQuality: 0.2,
} as const

// Data quality thresholds
export const DATA_QUALITY_THRESHOLDS = {
  MINIMUM_COMPLETENESS: 0.3, // Need at least 30% of data for basic scoring
  RELIABLE_COMPLETENESS: 0.7, // Need 70% for reliable scoring
  HIGH_CONFIDENCE_COMPLETENESS: 0.9, // Need 90% for high confidence

  // Required fields for each scoring dimension
  CRITICAL_FINANCIAL_FIELDS: ['revenue', 'profit'],
  CRITICAL_GROWTH_FIELDS: ['revenue', 'yearlyGrowth'],
  CRITICAL_OPERATIONAL_FIELDS: ['established', 'employees'],
  CRITICAL_SALE_FIELDS: ['askingPrice', 'revenue'],
}

// Scoring algorithm constants
export const ALGORITHM_CONSTANTS = {
  VERSION: '1.0.0',
  MAX_SCORE: 100,
  MIN_SCORE: 0,

  // Statistical bounds for outlier detection
  REVENUE_OUTLIER_MULTIPLIER: 10, // Flag if revenue > 10x industry average
  PROFIT_MARGIN_MAX: 0.95, // Maximum reasonable profit margin
  GROWTH_RATE_MAX: 5.0, // Maximum reasonable growth rate (500%)

  // Business maturity categories (years)
  MATURITY_THRESHOLDS: {
    NEW: 2,
    GROWING: 5,
    MATURE: 10,
  },

  // Confidence penalty factors
  MISSING_DATA_PENALTY: 0.1, // 10% confidence penalty per missing critical field
  INCONSISTENCY_PENALTY: 0.15, // 15% confidence penalty for data inconsistencies
  OUTLIER_PENALTY: 0.05, // 5% confidence penalty for statistical outliers
}

// Industry valuation multiples for sale readiness scoring
export const VALUATION_MULTIPLES = {
  RESTAURANT: { revenue: 0.5, ebitda: 2.5, sde: 2.0 },
  RETAIL: { revenue: 0.7, ebitda: 3.0, sde: 2.5 },
  ECOMMERCE: { revenue: 1.0, ebitda: 4.0, sde: 3.0 },
  TECHNOLOGY: { revenue: 2.0, ebitda: 6.0, sde: 4.0 },
  MANUFACTURING: { revenue: 0.8, ebitda: 3.5, sde: 2.8 },
  SERVICES: { revenue: 1.2, ebitda: 4.0, sde: 3.2 },
  HEALTHCARE: { revenue: 1.5, ebitda: 5.0, sde: 3.8 },
  REAL_ESTATE: { revenue: 1.8, ebitda: 6.0, sde: 4.5 },
  AUTOMOTIVE: { revenue: 0.6, ebitda: 2.8, sde: 2.2 },
  ENTERTAINMENT: { revenue: 1.0, ebitda: 3.5, sde: 2.8 },
  EDUCATION: { revenue: 1.3, ebitda: 4.2, sde: 3.5 },
  OTHER: { revenue: 0.8, ebitda: 3.0, sde: 2.5 },
}

// Overall health scoring weights
export const SCORING_WEIGHTS = {
  financial: 0.4,
  growth: 0.25,
  operational: 0.2,
  saleReadiness: 0.15,
} as const

// Trajectory classification thresholds
export const TRAJECTORY_THRESHOLDS = {
  IMPROVING: { minGrowth: 0.05, minTrend: 0.1 }, // 5% growth, positive trend
  STABLE: { maxVolatility: 0.15 }, // Less than 15% volatility
  DECLINING: { maxGrowth: -0.05, maxTrend: -0.1 }, // Negative growth/trend
  VOLATILE: { minVolatility: 0.25 }, // More than 25% volatility
}
