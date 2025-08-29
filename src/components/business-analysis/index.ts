/**
 * Business Analysis Components
 * Export all business analysis UI components
 */

export { default as FinancialHealthCard } from './FinancialHealthCard'
export { default as ValuationSummary } from './ValuationSummary'
export { default as RiskMatrix } from './RiskMatrix'

export type { ComponentSpec } from '../../agents/ui-ux-design'

// Component prop types
export interface FinancialMetric {
  label: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
}

export interface ValuationMethod {
  name: string
  value: number
  weight: number
  confidence: number
}

export interface Risk {
  id: string
  category: string
  description: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  mitigation?: string
}
