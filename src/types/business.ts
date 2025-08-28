export interface BusinessData {
  businessName: string;
  industry: string;
  description?: string;
  annualRevenue?: number;
  monthlyExpenses?: number;
  employees?: number;
  yearsInOperation?: number;
  location?: string;
  businessType?: string;
  assets?: number;
  liabilities?: number;
  monthlyProfit?: number;
  customerBase?: number;
  marketShare?: string;
  competitors?: string[];
  uniqueSellingPoints?: string[];
  challenges?: string[];
  growthPlans?: string;
  targetMarket?: string;
}

export interface BusinessAnalysisRequest {
  businessData: BusinessData;
  analysisType?: 'comprehensive' | 'financial' | 'market' | 'growth' | 'risk';
  options?: {
    includeRecommendations?: boolean;
    detailedInsights?: boolean;
    competitorAnalysis?: boolean;
  };
}

export interface BusinessMetrics {
  revenueGrowthRate?: number;
  profitMargin?: number;
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  burnRate?: number;
  runwayMonths?: number;
  debtToEquityRatio?: number;
  currentRatio?: number;
  returnOnInvestment?: number;
}

export interface MarketAnalysis {
  marketSize: string;
  growthRate: string;
  competitiveIntensity: 'low' | 'medium' | 'high';
  barrierToEntry: 'low' | 'medium' | 'high';
  seasonality: boolean;
  cyclicality: boolean;
  trendDirection: 'growing' | 'stable' | 'declining';
}

export interface CompetitorInfo {
  name: string;
  marketShare?: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
}

export interface BusinessInsight {
  category: 'financial' | 'operational' | 'strategic' | 'market';
  priority: 'high' | 'medium' | 'low';
  insight: string;
  recommendation?: string;
  impact: string;
  timeline?: string;
}