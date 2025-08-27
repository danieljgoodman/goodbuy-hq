import { IndustryData } from '@/types/valuation'

export const INDUSTRY_MULTIPLIERS: IndustryData = {
  'Technology - Software': {
    revenueMultiplier: { min: 4, max: 15, average: 8 },
    ebitdaMultiplier: { min: 15, max: 40, average: 25 },
    peRatio: { min: 20, max: 50, average: 30 },
  },
  'Technology - Hardware': {
    revenueMultiplier: { min: 2, max: 6, average: 4 },
    ebitdaMultiplier: { min: 10, max: 25, average: 15 },
    peRatio: { min: 15, max: 30, average: 20 },
  },
  'Healthcare - Services': {
    revenueMultiplier: { min: 3, max: 8, average: 5 },
    ebitdaMultiplier: { min: 12, max: 25, average: 18 },
    peRatio: { min: 18, max: 35, average: 25 },
  },
  'Healthcare - Pharmaceuticals': {
    revenueMultiplier: { min: 4, max: 12, average: 7 },
    ebitdaMultiplier: { min: 15, max: 30, average: 22 },
    peRatio: { min: 20, max: 40, average: 28 },
  },
  'Financial Services': {
    revenueMultiplier: { min: 2, max: 6, average: 3.5 },
    ebitdaMultiplier: { min: 8, max: 15, average: 12 },
    peRatio: { min: 10, max: 20, average: 15 },
  },
  'E-commerce': {
    revenueMultiplier: { min: 2, max: 8, average: 4.5 },
    ebitdaMultiplier: { min: 10, max: 30, average: 18 },
    peRatio: { min: 15, max: 35, average: 22 },
  },
  Manufacturing: {
    revenueMultiplier: { min: 1, max: 3, average: 2 },
    ebitdaMultiplier: { min: 6, max: 12, average: 9 },
    peRatio: { min: 10, max: 18, average: 14 },
  },
  Retail: {
    revenueMultiplier: { min: 0.5, max: 2, average: 1.2 },
    ebitdaMultiplier: { min: 5, max: 12, average: 8 },
    peRatio: { min: 8, max: 16, average: 12 },
  },
  'Food & Beverage': {
    revenueMultiplier: { min: 1, max: 4, average: 2.5 },
    ebitdaMultiplier: { min: 6, max: 15, average: 10 },
    peRatio: { min: 12, max: 20, average: 16 },
  },
  'Real Estate': {
    revenueMultiplier: { min: 2, max: 6, average: 4 },
    ebitdaMultiplier: { min: 8, max: 18, average: 12 },
    peRatio: { min: 12, max: 25, average: 18 },
  },
  Energy: {
    revenueMultiplier: { min: 1, max: 4, average: 2.5 },
    ebitdaMultiplier: { min: 5, max: 12, average: 8 },
    peRatio: { min: 8, max: 15, average: 11 },
  },
  Transportation: {
    revenueMultiplier: { min: 1, max: 3, average: 2 },
    ebitdaMultiplier: { min: 6, max: 14, average: 9 },
    peRatio: { min: 10, max: 18, average: 13 },
  },
  'Media & Entertainment': {
    revenueMultiplier: { min: 2, max: 8, average: 4.5 },
    ebitdaMultiplier: { min: 8, max: 20, average: 13 },
    peRatio: { min: 12, max: 25, average: 17 },
  },
  Education: {
    revenueMultiplier: { min: 2, max: 6, average: 3.5 },
    ebitdaMultiplier: { min: 8, max: 18, average: 12 },
    peRatio: { min: 15, max: 25, average: 19 },
  },
  Construction: {
    revenueMultiplier: { min: 0.5, max: 2, average: 1.2 },
    ebitdaMultiplier: { min: 4, max: 10, average: 7 },
    peRatio: { min: 8, max: 15, average: 11 },
  },
  Telecommunications: {
    revenueMultiplier: { min: 1.5, max: 4, average: 2.5 },
    ebitdaMultiplier: { min: 6, max: 12, average: 9 },
    peRatio: { min: 10, max: 18, average: 14 },
  },
  'Professional Services': {
    revenueMultiplier: { min: 2, max: 6, average: 3.5 },
    ebitdaMultiplier: { min: 8, max: 18, average: 12 },
    peRatio: { min: 12, max: 22, average: 16 },
  },
  'Restaurant & Hospitality': {
    revenueMultiplier: { min: 0.5, max: 2.5, average: 1.5 },
    ebitdaMultiplier: { min: 4, max: 10, average: 6 },
    peRatio: { min: 8, max: 16, average: 12 },
  },
  Automotive: {
    revenueMultiplier: { min: 0.3, max: 1.5, average: 0.8 },
    ebitdaMultiplier: { min: 4, max: 8, average: 6 },
    peRatio: { min: 6, max: 12, average: 9 },
  },
  Agriculture: {
    revenueMultiplier: { min: 0.5, max: 2, average: 1.2 },
    ebitdaMultiplier: { min: 5, max: 12, average: 8 },
    peRatio: { min: 8, max: 15, average: 11 },
  },
  Other: {
    revenueMultiplier: { min: 1, max: 4, average: 2.5 },
    ebitdaMultiplier: { min: 6, max: 15, average: 10 },
    peRatio: { min: 10, max: 20, average: 15 },
  },
}

export const INDUSTRY_OPTIONS = Object.keys(INDUSTRY_MULTIPLIERS)

export const COMPETITIVE_ADVANTAGES = [
  'Strong brand recognition',
  'Patent protection',
  'Proprietary technology',
  'Network effects',
  'Economies of scale',
  'First-mover advantage',
  'Exclusive partnerships',
  'High switching costs',
  'Regulatory barriers',
  'Superior customer service',
  'Cost leadership',
  'Product differentiation',
  'Distribution channels',
  'Data/AI advantage',
  'Skilled workforce',
]

export const RISK_FACTORS = [
  'High customer concentration',
  'Regulatory changes',
  'Technology disruption',
  'Competitive pressure',
  'Economic downturns',
  'Supply chain risks',
  'Key person dependency',
  'Cybersecurity threats',
  'Market saturation',
  'Currency fluctuations',
  'Interest rate sensitivity',
  'Environmental risks',
  'Legal/litigation risks',
  'Operational complexity',
  'Capital intensity',
]
