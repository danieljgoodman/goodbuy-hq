export interface BusinessData {
  businessName: string
  industry: string
  description?: string
  annualRevenue?: number
  monthlyExpenses?: number
  employees?: number
  yearsInOperation?: number
  location?: string
  businessType?: string
  assets?: number
  liabilities?: number
  monthlyProfit?: number
  customerBase?: number
  marketShare?: string
  competitors?: string[]
  uniqueSellingPoints?: string[]
  challenges?: string[]
  growthPlans?: string
  targetMarket?: string
  slug?: string
  askingPrice?: number
  featured?: boolean
  images?: string[]
  tags?: string[]
  broker?: {
    id: string
    name: string
    company: string
    phone: string
    email: string
  }
}

export interface BusinessAnalysisRequest {
  businessData: BusinessData
  analysisType?: 'comprehensive' | 'financial' | 'market' | 'growth' | 'risk'
  options?: {
    includeRecommendations?: boolean
    detailedInsights?: boolean
    competitorAnalysis?: boolean
  }
}

export interface BusinessMetrics {
  revenueGrowthRate?: number
  profitMargin?: number
  customerAcquisitionCost?: number
  customerLifetimeValue?: number
  burnRate?: number
  runwayMonths?: number
  debtToEquityRatio?: number
  currentRatio?: number
  returnOnInvestment?: number
}

export interface MarketAnalysis {
  marketSize: string
  growthRate: string
  competitiveIntensity: 'low' | 'medium' | 'high'
  barrierToEntry: 'low' | 'medium' | 'high'
  seasonality: boolean
  cyclicality: boolean
  trendDirection: 'growing' | 'stable' | 'declining'
}

export interface CompetitorInfo {
  name: string
  marketShare?: string
  strengths: string[]
  weaknesses: string[]
  positioning: string
}

export interface BusinessInsight {
  category: 'financial' | 'operational' | 'strategic' | 'market'
  priority: 'high' | 'medium' | 'low'
  insight: string
  recommendation?: string
  impact: string
  timeline?: string
}

// Business Listing Table Types
export interface BusinessListing {
  id: string
  businessName: string
  industry: string
  location: string
  askingPrice: number
  annualRevenue: number
  monthlyProfit: number
  yearsInOperation: number
  employees: number
  businessType: string
  listingDate: Date
  status: 'active' | 'pending' | 'sold' | 'expired'
  featured: boolean
  images?: string[]
  description: string
  broker?: {
    id: string
    name: string
    company: string
    phone: string
    email: string
  }
  metrics: {
    revenueMultiple: number
    profitMargin: number
    roi: number
    paybackPeriod: number
  }
  tags: string[]
  lastUpdated: Date
}

// Dashboard Activity Types
export interface DashboardActivity {
  id: string
  userId: string
  type: 'view' | 'inquiry' | 'evaluation' | 'save' | 'share' | 'contact'
  entityType: 'business' | 'valuation' | 'report'
  entityId: string
  entityName: string
  timestamp: Date
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Business Evaluation Table Types
export interface BusinessEvaluation {
  id: string
  userId: string
  businessId?: string
  businessName: string
  industry: string
  evaluationType: 'quick' | 'detailed' | 'comprehensive'
  status: 'draft' | 'completed' | 'archived'
  createdAt: Date
  completedAt?: Date
  inputs: BusinessData
  results: {
    estimatedValue: number
    valueRange: {
      low: number
      high: number
    }
    confidence: number
    methodology: string[]
    keyFactors: string[]
    risks: string[]
    opportunities: string[]
  }
  metrics: BusinessMetrics
  marketAnalysis?: MarketAnalysis
  insights: BusinessInsight[]
  reportGenerated: boolean
  reportUrl?: string
  tags: string[]
}

// Search Results Types
export interface SearchFilters {
  industry?: string[]
  location?: string[]
  priceRange?: {
    min: number
    max: number
  }
  revenueRange?: {
    min: number
    max: number
  }
  employeeRange?: {
    min: number
    max: number
  }
  businessType?: string[]
  yearsInOperation?: {
    min: number
    max: number
  }
  status?: string[]
  featured?: boolean
  keywords?: string
  sortBy?: 'price' | 'revenue' | 'profit' | 'date' | 'relevance'
  sortOrder?: 'asc' | 'desc'
}

// Analytics Data Types
export interface AnalyticsData {
  id: string
  metric: string
  value: number | string
  previousValue?: number | string
  change?: number
  changePercent?: number
  period: string
  category: 'traffic' | 'engagement' | 'conversion' | 'revenue' | 'user'
  timestamp: Date
  dimensions?: Record<string, string>
}

export interface UserEngagement {
  userId: string
  sessionId: string
  pageViews: number
  timeOnSite: number
  businessesViewed: number
  inquiriesMade: number
  evaluationsCompleted: number
  reportsDownloaded: number
  lastActivity: Date
  deviceType: 'desktop' | 'tablet' | 'mobile'
  referralSource: string
  location?: {
    country: string
    region: string
    city: string
  }
}

// Export Data Types
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  columns: string[]
  filters?: SearchFilters
  includeImages?: boolean
  includeMetrics?: boolean
  includeAnalysis?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
  fileName?: string
}

export interface BulkActionConfig {
  action: 'delete' | 'update' | 'archive' | 'export' | 'duplicate'
  selectedItems: string[]
  updateData?: Partial<BusinessListing | BusinessEvaluation>
  confirmRequired?: boolean
  batchSize?: number
}
