import { Business, HealthTrajectory } from '@prisma/client'

// Core scoring interfaces
export interface HealthScores {
  overall: number
  financial: number
  growth: number
  operational: number
  saleReadiness: number
  confidence: number
  trajectory: HealthTrajectory
}

export interface ScoreBreakdown {
  score: number
  components: Record<string, number>
  factors: string[]
  recommendations?: string[]
}

export interface HealthCalculationResult {
  scores: HealthScores
  breakdown: {
    financial: ScoreBreakdown
    growth: ScoreBreakdown
    operational: ScoreBreakdown
    saleReadiness: ScoreBreakdown
  }
  confidence: {
    overall: number
    dataCompleteness: number
    dataQuality: number
    factors: string[]
  }
  metadata: {
    calculatedAt: Date
    dataVersion: string
    algorithmVersion: string
  }
}

// Input data interfaces
export interface BusinessFinancialData {
  revenue?: number
  profit?: number
  cashFlow?: number
  ebitda?: number
  grossMargin?: number
  netMargin?: number
  monthlyRevenue?: number
  yearlyGrowth?: number
  askingPrice?: number
  totalAssets?: number
  liabilities?: number
  inventory?: number
  equipment?: number
  realEstate?: number
}

export interface BusinessOperationalData {
  established?: Date
  employees?: number
  customerBase?: number
  hoursOfOperation?: string
  daysOpen?: string[]
  seasonality?: string
  competition?: string
  category?: string
  description?: string
}

export interface HealthScoringInput {
  business: Business
  financialData: BusinessFinancialData
  operationalData: BusinessOperationalData
}

// Scoring component interfaces
export interface FinancialHealthComponents {
  profitability: number
  liquidity: number
  efficiency: number
}

export interface GrowthHealthComponents {
  revenueGrowth: number
  marketExpansion: number
  scalability: number
}

export interface OperationalHealthComponents {
  businessMaturity: number
  operationalEfficiency: number
  marketPositioning: number
}

export interface SaleReadinessComponents {
  valuationReasonableness: number
  marketAttractiveness: number
  documentationQuality: number
}

// Confidence scoring
export interface DataQualityAssessment {
  completeness: number
  consistency: number
  reasonableness: number
  recency: number
}

// Note: SCORING_WEIGHTS moved to constants.ts to avoid circular dependency

export const SCORE_THRESHOLDS = {
  POOR: { min: 0, max: 30 },
  BELOW_AVERAGE: { min: 31, max: 50 },
  AVERAGE: { min: 51, max: 70 },
  GOOD: { min: 71, max: 85 },
  EXCELLENT: { min: 86, max: 100 },
} as const

export const CONFIDENCE_LEVELS = {
  LOW: { min: 0, max: 49 },
  MEDIUM: { min: 50, max: 75 },
  HIGH: { min: 76, max: 90 },
  VERY_HIGH: { min: 91, max: 100 },
} as const

// Error types
export class HealthScoringError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'HealthScoringError'
  }
}
