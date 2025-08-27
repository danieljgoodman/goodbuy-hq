// Business Evaluation Calculator Types

export interface BusinessInfo {
  companyName: string
  industry: string
  businessType: 'B2B' | 'B2C' | 'B2B2C'
  foundedYear: number
  employeeCount: number
  location: string
  description: string
}

export interface FinancialData {
  annualRevenue: number
  grossProfit: number
  netIncome: number
  totalAssets: number
  totalLiabilities: number
  monthlyRecurringRevenue?: number
  cashFlow: number
  previousYearRevenue: number
  debtToEquity: number
  currentRatio: number
}

export interface BusinessDetails {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche'
  growthStage: 'startup' | 'growth' | 'mature' | 'decline'
  competitiveAdvantage: string[]
  riskFactors: string[]
  customerConcentration: 'low' | 'medium' | 'high'
  technologyDependence: 'low' | 'medium' | 'high'
  regulatoryRisk: 'low' | 'medium' | 'high'
  marketSize: 'small' | 'medium' | 'large' | 'massive'
  geographicDiversification: 'local' | 'regional' | 'national' | 'international'
}

export interface ValuationMultipliers {
  revenueMultiplier: {
    min: number
    max: number
    average: number
  }
  ebitdaMultiplier: {
    min: number
    max: number
    average: number
  }
  peRatio: {
    min: number
    max: number
    average: number
  }
}

export interface IndustryData {
  [industry: string]: ValuationMultipliers
}

export interface ValuationMethod {
  name: string
  value: number
  confidence: number
  description: string
}

export interface ValuationResult {
  companyName: string
  evaluationDate: string
  overallValuation: number
  confidenceScore: number
  methods: ValuationMethod[]
  adjustmentFactors: {
    growthAdjustment: number
    riskAdjustment: number
    marketPositionAdjustment: number
    sizeAdjustment: number
  }
  keyMetrics: {
    revenueMultiple: number
    profitMargin: number
    returnOnAssets: number
    debtToEquity: number
    growthRate: number
  }
  recommendations: string[]
  riskFactors: string[]
}

export interface EvaluationFormData {
  basicInfo: BusinessInfo
  financialData: FinancialData
  businessDetails: BusinessDetails
}

export type FormStep = 'basic-info' | 'financial-data' | 'business-details' | 'results'

export interface FormState {
  currentStep: FormStep
  data: Partial<EvaluationFormData>
  isValid: boolean
  errors: Record<string, string>
}