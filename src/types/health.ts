import { HealthTrajectory, ForecastType } from '@prisma/client'

// Health Metrics Interfaces
export interface HealthMetricResponse {
  success: boolean
  data: {
    id: string
    overallScore: number
    growthScore: number
    operationalScore: number
    financialScore: number
    saleReadinessScore: number
    confidenceLevel: number
    trajectory: HealthTrajectory
    calculatedAt: string
    dataSources?: Record<string, boolean>
    calculationMetadata?: Record<string, any>
    createdAt: string
    updatedAt: string
  }
}

export interface HealthMetricData {
  id: string
  overallScore: number
  growthScore: number
  operationalScore: number
  financialScore: number
  saleReadinessScore: number
  confidenceLevel: number
  trajectory: HealthTrajectory
  calculatedAt: Date
  dataSources?: Record<string, boolean>
  calculationMetadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Forecast Interfaces
export interface ForecastResponse {
  success: boolean
  data: {
    forecasts: Record<string, ForecastData[]>
    totalCount: number
    filters: {
      type: string
      period: string
    }
  }
}

export interface ForecastData {
  id: string
  forecastType: ForecastType
  forecastPeriod: number
  predictedValue: number
  confidenceIntervalLower: number
  confidenceIntervalUpper: number
  confidenceScore: number
  modelUsed: string
  actualValue?: number
  createdAt: Date
  updatedAt: Date
}

// Health Calculation Interfaces
export interface CalculationRequest {
  businessId: string
  forceRecalculation?: boolean
}

export interface CalculationResponse {
  success: boolean
  message: string
  data: {
    calculationId: string
    healthMetric?: HealthMetricData
    calculatedAt: string
    forceRecalculation: boolean
    skipReason?: string
  }
}

// Error Response Interface
export interface APIErrorResponse {
  error: string
  details?: Array<{
    code: string
    expected?: any
    received?: any
    path: (string | number)[]
    message: string
  }>
}

// Rate Limiting Headers
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}

// Query Parameters for Forecasts
export interface ForecastQueryParams {
  type?: ForecastType
  period?: number
}

// Health Score Categories
export type HealthScoreType =
  | 'overall'
  | 'growth'
  | 'operational'
  | 'financial'
  | 'saleReadiness'

// Health Score Range
export interface HealthScoreRange {
  min: number
  max: number
  category: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'
  color: string
}

// Calculation Metadata Structure
export interface CalculationMetadata {
  calculationMethod: string
  dataPoints: number
  calculationDuration: string
  warnings: string[]
  lastUpdated?: string
  version?: string
}

// Data Sources Structure
export interface DataSources {
  financialData: boolean
  operationalData: boolean
  marketData: boolean
  quickbooks: boolean
  manual?: boolean
}
