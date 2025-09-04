import { BusinessFormData } from '@/lib/validation/business-form-schema'

export interface BusinessSuggestion {
  field: keyof BusinessFormData
  value: string | number
  confidence: number // 0-1
  reason: string
  source: 'industry_average' | 'similar_business' | 'user_history' | 'algorithm'
}

export interface SuggestionContext {
  category?: string
  location?: {
    city?: string
    state?: string
  }
  businessSize?: 'small' | 'medium' | 'large'
  listingType?: string
}

// Mock industry data - in production this would come from a database/API
const INDUSTRY_BENCHMARKS = {
  RESTAURANT: {
    grossMargin: { min: 55, max: 70, average: 62 },
    netMargin: { min: 3, max: 15, average: 8 },
    revenue_per_employee: 65000,
    typical_hours: '8:00 AM - 10:00 PM',
    common_days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    price_to_revenue: { min: 0.8, max: 2.5, average: 1.4 },
  },
  RETAIL: {
    grossMargin: { min: 45, max: 65, average: 55 },
    netMargin: { min: 2, max: 12, average: 7 },
    revenue_per_employee: 45000,
    typical_hours: '9:00 AM - 9:00 PM',
    common_days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    price_to_revenue: { min: 0.5, max: 2.0, average: 1.2 },
  },
  ECOMMERCE: {
    grossMargin: { min: 40, max: 80, average: 60 },
    netMargin: { min: 5, max: 25, average: 15 },
    revenue_per_employee: 120000,
    typical_hours: '24/7 (Online)',
    common_days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    price_to_revenue: { min: 1.5, max: 5.0, average: 2.8 },
  },
  TECHNOLOGY: {
    grossMargin: { min: 65, max: 85, average: 75 },
    netMargin: { min: 10, max: 30, average: 18 },
    revenue_per_employee: 200000,
    typical_hours: '9:00 AM - 5:00 PM',
    common_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    price_to_revenue: { min: 2.0, max: 8.0, average: 4.5 },
  },
  SERVICES: {
    grossMargin: { min: 50, max: 75, average: 62 },
    netMargin: { min: 8, max: 20, average: 14 },
    revenue_per_employee: 85000,
    typical_hours: '9:00 AM - 5:00 PM',
    common_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    price_to_revenue: { min: 1.0, max: 3.5, average: 2.2 },
  },
} as const

export class BusinessSuggestionsService {
  // Generate suggestions based on form context
  static generateSuggestions(
    currentData: Partial<BusinessFormData>,
    context: SuggestionContext
  ): BusinessSuggestion[] {
    const suggestions: BusinessSuggestion[] = []

    // Category-based suggestions
    if (context.category && context.category in INDUSTRY_BENCHMARKS) {
      const industry =
        INDUSTRY_BENCHMARKS[
          context.category as keyof typeof INDUSTRY_BENCHMARKS
        ]

      // Margin suggestions
      if (!currentData.grossMargin && currentData.revenue) {
        suggestions.push({
          field: 'grossMargin',
          value: industry.grossMargin.average,
          confidence: 0.7,
          reason: `Average gross margin for ${context.category.toLowerCase()} businesses is ${industry.grossMargin.average}%`,
          source: 'industry_average',
        })
      }

      if (!currentData.netMargin && currentData.revenue) {
        suggestions.push({
          field: 'netMargin',
          value: industry.netMargin.average,
          confidence: 0.7,
          reason: `Average net margin for ${context.category.toLowerCase()} businesses is ${industry.netMargin.average}%`,
          source: 'industry_average',
        })
      }

      // Hours of operation suggestions
      if (!currentData.hoursOfOperation) {
        suggestions.push({
          field: 'hoursOfOperation',
          value: industry.typical_hours,
          confidence: 0.6,
          reason: `Typical hours for ${context.category.toLowerCase()} businesses`,
          source: 'industry_average',
        })
      }

      // Days open suggestions
      if (!currentData.daysOpen || currentData.daysOpen.length === 0) {
        suggestions.push({
          field: 'daysOpen',
          value: industry.common_days.join(','),
          confidence: 0.6,
          reason: `Most ${context.category.toLowerCase()} businesses operate these days`,
          source: 'industry_average',
        })
      }

      // Asking price suggestion based on revenue
      if (!currentData.askingPrice && currentData.revenue) {
        const suggestedPrice = Math.round(
          (currentData.revenue as number) * industry.price_to_revenue.average
        )
        suggestions.push({
          field: 'askingPrice',
          value: suggestedPrice,
          confidence: 0.5,
          reason: `Based on ${industry.price_to_revenue.average}x revenue multiple typical for ${context.category.toLowerCase()}`,
          source: 'industry_average',
        })
      }
    }

    // Financial calculation suggestions
    suggestions.push(...this.generateFinancialSuggestions(currentData))

    // Location-based suggestions
    suggestions.push(...this.generateLocationSuggestions(currentData, context))

    // Smart field completion suggestions
    suggestions.push(...this.generateCompletionSuggestions(currentData))

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  // Generate suggestions for calculated financial fields
  private static generateFinancialSuggestions(
    data: Partial<BusinessFormData>
  ): BusinessSuggestion[] {
    const suggestions: BusinessSuggestion[] = []

    // Calculate profit from revenue and margins
    if (data.revenue && data.netMargin && !data.profit) {
      const revenueNum =
        parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
      const marginNum = parseFloat(data.netMargin.toString()) || 0
      const calculatedProfit = (revenueNum * marginNum) / 100
      suggestions.push({
        field: 'profit',
        value: Math.round(calculatedProfit),
        confidence: 0.9,
        reason: `Calculated from revenue (${data.revenue}) × net margin (${data.netMargin}%)`,
        source: 'algorithm',
      })
    }

    // Calculate monthly revenue from annual
    if (data.revenue && !data.monthlyRevenue) {
      const revenueNum =
        parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
      const monthly = Math.round(revenueNum / 12)
      suggestions.push({
        field: 'monthlyRevenue',
        value: monthly,
        confidence: 0.8,
        reason: `Calculated from annual revenue ÷ 12 months`,
        source: 'algorithm',
      })
    }

    // Calculate EBITDA estimate
    if (data.revenue && data.netMargin && !data.ebitda) {
      const revenueNum =
        parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
      const netMarginNum = parseFloat(data.netMargin.toString()) || 0
      // Rough EBITDA estimate (Net Margin + typical D&A + Interest + Taxes)
      const ebitdaEstimate = Math.round((revenueNum * (netMarginNum + 5)) / 100)
      suggestions.push({
        field: 'ebitda',
        value: ebitdaEstimate,
        confidence: 0.6,
        reason: `Estimated EBITDA based on revenue and net margin (rough calculation)`,
        source: 'algorithm',
      })
    }

    // Cash flow suggestion based on profit
    if (data.profit && !data.cashFlow) {
      const profitNum =
        parseFloat(data.profit.toString().replace(/[,$]/g, '')) || 0
      // Cash flow is typically 80-120% of profit
      const estimatedCashFlow = Math.round(profitNum * 1.1)
      suggestions.push({
        field: 'cashFlow',
        value: estimatedCashFlow,
        confidence: 0.6,
        reason: `Estimated cash flow based on profit (typically similar to net profit)`,
        source: 'algorithm',
      })
    }

    return suggestions
  }

  // Generate location-specific suggestions
  private static generateLocationSuggestions(
    data: Partial<BusinessFormData>,
    context: SuggestionContext
  ): BusinessSuggestion[] {
    const suggestions: BusinessSuggestion[] = []

    // State-based suggestions (simplified examples)
    if (context.location?.state) {
      const state = context.location.state.toUpperCase()

      // High-cost states might have higher valuations
      const highCostStates = ['CA', 'NY', 'MA', 'CT', 'NJ', 'WA']
      if (highCostStates.includes(state) && data.revenue && !data.askingPrice) {
        const premium = 1.2 // 20% premium for high-cost areas
        const baseMultiple = 1.5 // Base revenue multiple
        const suggestedPrice = Math.round(
          (data.revenue as number) * baseMultiple * premium
        )

        suggestions.push({
          field: 'askingPrice',
          value: suggestedPrice,
          confidence: 0.4,
          reason: `Higher valuation multiple suggested for ${state} market conditions`,
          source: 'algorithm',
        })
      }
    }

    return suggestions
  }

  // Generate smart completion suggestions
  private static generateCompletionSuggestions(
    data: Partial<BusinessFormData>
  ): BusinessSuggestion[] {
    const suggestions: BusinessSuggestion[] = []

    // Employee count based on revenue
    if (data.revenue && !data.employees) {
      const revenuePerEmployee = 75000 // Average across industries
      const estimatedEmployees = Math.max(
        1,
        Math.round((data.revenue as number) / revenuePerEmployee)
      )

      suggestions.push({
        field: 'employees',
        value: estimatedEmployees,
        confidence: 0.4,
        reason: `Estimated based on average revenue per employee (~$75K)`,
        source: 'algorithm',
      })
    }

    // Customer base estimation
    if (data.revenue && !data.customerBase) {
      // Very rough estimate: assume average customer value of $500-2000
      const avgCustomerValue = 1000
      const estimatedCustomers = Math.round(
        (data.revenue as number) / avgCustomerValue
      )

      suggestions.push({
        field: 'customerBase',
        value: estimatedCustomers,
        confidence: 0.3,
        reason: `Rough estimate based on assumed average customer value`,
        source: 'algorithm',
      })
    }

    // Establishment year suggestion for mature businesses
    if (
      data.revenue &&
      (data.revenue as number) > 1000000 &&
      !data.established
    ) {
      const currentYear = new Date().getFullYear()
      const estimatedAge = Math.min(
        15,
        Math.max(3, Math.floor((data.revenue as number) / 500000))
      )
      const establishedYear = currentYear - estimatedAge

      suggestions.push({
        field: 'established',
        value: establishedYear.toString(),
        confidence: 0.3,
        reason: `Estimated establishment year based on business maturity`,
        source: 'algorithm',
      })
    }

    return suggestions
  }

  // Get suggestions for a specific field
  static getFieldSuggestions(
    field: keyof BusinessFormData,
    currentData: Partial<BusinessFormData>,
    context: SuggestionContext
  ): BusinessSuggestion[] {
    const allSuggestions = this.generateSuggestions(currentData, context)
    return allSuggestions.filter(s => s.field === field)
  }

  // Format suggestion value for display
  static formatSuggestionValue(suggestion: BusinessSuggestion): string {
    const { field, value } = suggestion

    // Currency fields
    if (
      [
        'askingPrice',
        'revenue',
        'profit',
        'cashFlow',
        'ebitda',
        'monthlyRevenue',
        'inventory',
        'equipment',
        'realEstate',
        'totalAssets',
        'liabilities',
      ].includes(field)
    ) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value as number)
    }

    // Percentage fields
    if (['grossMargin', 'netMargin', 'yearlyGrowth'].includes(field)) {
      return `${value}%`
    }

    // Array fields
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return String(value)
  }
}
