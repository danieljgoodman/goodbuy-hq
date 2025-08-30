/**
 * Financial data formatting utilities
 */

export class FinancialFormatter {
  /**
   * Format currency with proper locale and notation
   */
  static formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US',
    notation: 'standard' | 'compact' | 'scientific' | 'engineering' = 'compact'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation,
      maximumFractionDigits: notation === 'compact' ? 1 : 2,
    }).format(amount)
  }

  /**
   * Format percentage with proper decimal places
   */
  static formatPercentage(
    value: number,
    decimals: number = 1,
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100)
  }

  /**
   * Format ratio with proper decimal places
   */
  static formatRatio(value: number, decimals: number = 2): string {
    return value.toFixed(decimals)
  }

  /**
   * Format large numbers with appropriate suffixes
   */
  static formatCompactNumber(value: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  /**
   * Format trend change with color coding information
   */
  static formatTrendChange(
    changePercent: number,
    includeSign: boolean = true
  ): {
    formatted: string
    colorClass: string
    trend: 'positive' | 'negative' | 'neutral'
  } {
    const sign = includeSign && changePercent > 0 ? '+' : ''
    const formatted = `${sign}${changePercent.toFixed(1)}%`

    let colorClass: string
    let trend: 'positive' | 'negative' | 'neutral'

    if (Math.abs(changePercent) < 1) {
      colorClass = 'text-muted-foreground'
      trend = 'neutral'
    } else if (changePercent > 0) {
      colorClass = 'text-success'
      trend = 'positive'
    } else {
      colorClass = 'text-destructive'
      trend = 'negative'
    }

    return { formatted, colorClass, trend }
  }

  /**
   * Format financial metric with appropriate units
   */
  static formatFinancialMetric(
    value: number,
    type: 'currency' | 'percentage' | 'ratio' | 'days' | 'times',
    currency: string = 'USD'
  ): string {
    switch (type) {
      case 'currency':
        return this.formatCurrency(value, currency)
      case 'percentage':
        return this.formatPercentage(value)
      case 'ratio':
        return this.formatRatio(value)
      case 'days':
        return `${Math.round(value)} days`
      case 'times':
        return `${this.formatRatio(value)}x`
      default:
        return value.toString()
    }
  }

  /**
   * Get appropriate color class for financial health score
   */
  static getHealthScoreColor(score: number): string {
    if (score >= 80) return 'text-success bg-success/10'
    if (score >= 60) return 'text-warning bg-warning/10'
    if (score >= 40) return 'text-primary bg-primary/10'
    return 'text-destructive bg-destructive/10'
  }

  /**
   * Get appropriate color class for risk level
   */
  static getRiskLevelColor(
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  ): string {
    switch (riskLevel) {
      case 'Low':
        return 'text-success bg-success/10 border-success/20'
      case 'Medium':
        return 'text-warning bg-warning/10 border-warning/20'
      case 'High':
        return 'text-primary bg-primary/10 border-primary/20'
      case 'Critical':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      default:
        return 'text-muted-foreground bg-muted border-muted-foreground/20'
    }
  }

  /**
   * Format financial period display
   */
  static formatPeriod(period: string, date?: Date): string {
    if (date) {
      const year = date.getFullYear()
      if (period === 'Annual') return `${year}`
      return `${period} ${year}`
    }
    return period
  }

  /**
   * Format days to a more readable format
   */
  static formatDays(days: number): string {
    if (days < 30) return `${Math.round(days)} days`
    if (days < 365) return `${Math.round(days / 30)} months`
    return `${Math.round((days / 365) * 10) / 10} years`
  }
}

export default FinancialFormatter
