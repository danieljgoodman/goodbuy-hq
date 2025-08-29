// Chart Data Types and Interfaces
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
  color?: string
}

export interface BusinessMetricData {
  id: string
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  category: 'revenue' | 'growth' | 'efficiency' | 'market'
  data: ChartDataPoint[]
}

export interface FinancialPerformanceData {
  period: string
  revenue: number
  profit: number
  expenses: number
  growth: number
  margin: number
}

export interface MarketTrendData {
  date: string
  marketValue: number
  industry: string
  region: string
  businesses: number
  avgPrice: number
}

export interface GeographicData {
  region: string
  businesses: number
  totalValue: number
  avgValuation: number
  growth: number
  coordinates?: [number, number]
}

export interface ValuationData {
  businessId: string
  businessName: string
  industry: string
  currentValue: number
  projectedValue: number
  confidence: number
  factors: {
    financial: number
    market: number
    operational: number
    strategic: number
  }
}

export interface ChartConfig {
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'combo' | 'map'
  data: any[]
  colors: string[]
  xAxis: string
  yAxis: string | string[]
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  responsive?: boolean
  height?: number
  width?: number
  exportable?: boolean
  realTime?: boolean
  updateInterval?: number
}

export interface InteractiveFeatures {
  zoom?: boolean
  brush?: boolean
  crossfilter?: boolean
  drill?: boolean
  tooltip?: {
    enabled: boolean
    custom?: boolean
    formatter?: (data: any) => string
  }
  legend?: {
    position: 'top' | 'bottom' | 'left' | 'right'
    interactive: boolean
  }
  annotations?: {
    enabled: boolean
    markers?: Array<{
      x: string | number
      y: number
      label: string
      type: 'line' | 'point' | 'area'
    }>
  }
}

export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'csv' | 'excel'
  filename?: string
  quality?: number
  width?: number
  height?: number
}

export interface RealTimeChartData {
  enabled: boolean
  source: 'websocket' | 'polling' | 'sse'
  endpoint?: string
  interval?: number
  maxDataPoints?: number
  autoUpdate?: boolean
}

// Business Color Palette
export const BUSINESS_COLORS = {
  primary: '#3B82F6', // Blue
  secondary: '#6366F1', // Indigo
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  info: '#06B6D4', // Cyan
  dark: '#1F2937', // Gray-800
  light: '#F8FAFC', // Slate-50
} as const

export const CHART_PALETTES = {
  business: [
    '#3B82F6',
    '#6366F1',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#8B5CF6',
    '#EC4899',
  ],
  financial: [
    '#059669',
    '#DC2626',
    '#D97706',
    '#7C3AED',
    '#DB2777',
    '#0891B2',
    '#4338CA',
    '#C2410C',
  ],
  neutral: [
    '#64748B',
    '#475569',
    '#334155',
    '#1E293B',
    '#0F172A',
    '#94A3B8',
    '#CBD5E1',
    '#E2E8F0',
  ],
  gradient: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ],
} as const

export const DEFAULT_CHART_CONFIG: Partial<ChartConfig> = {
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  responsive: true,
  height: 400,
  exportable: true,
  colors: [...CHART_PALETTES.business],
}

export const DEFAULT_INTERACTIVE_FEATURES: InteractiveFeatures = {
  zoom: true,
  tooltip: {
    enabled: true,
    custom: false,
  },
  legend: {
    position: 'bottom',
    interactive: true,
  },
  annotations: {
    enabled: false,
  },
}
