import {
  BusinessInfo,
  FinancialData,
  BusinessDetails,
  EvaluationFormData,
} from '@/types/valuation'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class FormValidator {
  static validateBasicInfo(data: Partial<BusinessInfo>): ValidationResult {
    const errors: ValidationError[] = []

    if (!data.companyName?.trim()) {
      errors.push({ field: 'companyName', message: 'Company name is required' })
    } else if (data.companyName.length < 2) {
      errors.push({
        field: 'companyName',
        message: 'Company name must be at least 2 characters',
      })
    }

    if (!data.industry) {
      errors.push({ field: 'industry', message: 'Please select an industry' })
    }

    if (!data.businessType) {
      errors.push({
        field: 'businessType',
        message: 'Please select a business type',
      })
    }

    if (!data.foundedYear) {
      errors.push({ field: 'foundedYear', message: 'Founded year is required' })
    } else {
      const currentYear = new Date().getFullYear()
      if (data.foundedYear < 1800 || data.foundedYear > currentYear) {
        errors.push({
          field: 'foundedYear',
          message: `Founded year must be between 1800 and ${currentYear}`,
        })
      }
    }

    if (data.employeeCount && data.employeeCount < 1) {
      errors.push({
        field: 'employeeCount',
        message: 'Employee count must be at least 1',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateFinancialData(data: Partial<FinancialData>): ValidationResult {
    const errors: ValidationError[] = []

    // Required fields
    if (!data.annualRevenue || data.annualRevenue <= 0) {
      errors.push({
        field: 'annualRevenue',
        message: 'Annual revenue must be greater than 0',
      })
    }

    if (!data.grossProfit || data.grossProfit < 0) {
      errors.push({
        field: 'grossProfit',
        message: 'Gross profit cannot be negative',
      })
    }

    if (data.netIncome === undefined || data.netIncome === null) {
      errors.push({ field: 'netIncome', message: 'Net income is required' })
    }

    if (!data.totalAssets || data.totalAssets <= 0) {
      errors.push({
        field: 'totalAssets',
        message: 'Total assets must be greater than 0',
      })
    }

    // Logical validations
    if (
      data.annualRevenue &&
      data.grossProfit &&
      data.grossProfit > data.annualRevenue
    ) {
      errors.push({
        field: 'grossProfit',
        message: 'Gross profit cannot exceed annual revenue',
      })
    }

    if (
      data.grossProfit &&
      data.netIncome &&
      data.netIncome > data.grossProfit
    ) {
      errors.push({
        field: 'netIncome',
        message: 'Net income cannot exceed gross profit',
      })
    }

    if (
      data.totalAssets &&
      data.totalLiabilities &&
      data.totalLiabilities > data.totalAssets
    ) {
      errors.push({
        field: 'totalLiabilities',
        message: 'Total liabilities cannot exceed total assets',
      })
    }

    if (data.previousYearRevenue && data.previousYearRevenue < 0) {
      errors.push({
        field: 'previousYearRevenue',
        message: 'Previous year revenue cannot be negative',
      })
    }

    if (data.debtToEquity && data.debtToEquity < 0) {
      errors.push({
        field: 'debtToEquity',
        message: 'Debt-to-equity ratio cannot be negative',
      })
    }

    if (data.currentRatio && data.currentRatio <= 0) {
      errors.push({
        field: 'currentRatio',
        message: 'Current ratio must be greater than 0',
      })
    }

    // Warning validations (not blocking)
    if (data.annualRevenue && data.grossProfit) {
      const grossMargin = (data.grossProfit / data.annualRevenue) * 100
      if (grossMargin > 95) {
        errors.push({
          field: 'grossProfit',
          message:
            'Warning: Gross margin above 95% seems unusually high. Please verify.',
        })
      }
    }

    if (data.debtToEquity && data.debtToEquity > 5) {
      errors.push({
        field: 'debtToEquity',
        message:
          'Warning: Very high debt-to-equity ratio may affect valuation significantly.',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateBusinessDetails(
    data: Partial<BusinessDetails>
  ): ValidationResult {
    const errors: ValidationError[] = []

    if (!data.marketPosition) {
      errors.push({
        field: 'marketPosition',
        message: 'Please select your market position',
      })
    }

    if (!data.growthStage) {
      errors.push({
        field: 'growthStage',
        message: 'Please select your growth stage',
      })
    }

    if (!data.customerConcentration) {
      errors.push({
        field: 'customerConcentration',
        message: 'Please select customer concentration level',
      })
    }

    if (!data.technologyDependence) {
      errors.push({
        field: 'technologyDependence',
        message: 'Please select technology dependence level',
      })
    }

    if (!data.regulatoryRisk) {
      errors.push({
        field: 'regulatoryRisk',
        message: 'Please select regulatory risk level',
      })
    }

    if (!data.marketSize) {
      errors.push({ field: 'marketSize', message: 'Please select market size' })
    }

    if (!data.geographicDiversification) {
      errors.push({
        field: 'geographicDiversification',
        message: 'Please select geographic reach',
      })
    }

    // Optional but recommended warnings
    if (!data.competitiveAdvantage || data.competitiveAdvantage.length === 0) {
      errors.push({
        field: 'competitiveAdvantage',
        message:
          'Consider selecting competitive advantages to improve valuation accuracy',
      })
    }

    if (data.riskFactors && data.riskFactors.length > 5) {
      errors.push({
        field: 'riskFactors',
        message:
          'Warning: High number of risk factors may significantly impact valuation',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateCompleteForm(data: EvaluationFormData): ValidationResult {
    const basicInfoValidation = this.validateBasicInfo(data.basicInfo)
    const financialDataValidation = this.validateFinancialData(
      data.financialData
    )
    const businessDetailsValidation = this.validateBusinessDetails(
      data.businessDetails
    )

    const allErrors = [
      ...basicInfoValidation.errors,
      ...financialDataValidation.errors,
      ...businessDetailsValidation.errors,
    ]

    // Cross-section validations
    const crossErrors = this.validateCrossSections(data)
    allErrors.push(...crossErrors)

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    }
  }

  private static validateCrossSections(
    data: EvaluationFormData
  ): ValidationError[] {
    const errors: ValidationError[] = []

    // Industry and financial data consistency
    if (
      data.basicInfo.industry === 'Technology - Software' &&
      data.financialData.totalAssets > 0 &&
      data.financialData.annualRevenue > 0
    ) {
      const assetTurnover =
        data.financialData.annualRevenue / data.financialData.totalAssets
      if (assetTurnover < 0.5) {
        errors.push({
          field: 'general',
          message:
            'Warning: Low asset turnover for software company. Please verify financial data.',
        })
      }
    }

    // Growth stage and financial performance
    if (
      data.businessDetails.growthStage === 'growth' &&
      data.financialData.previousYearRevenue > 0 &&
      data.financialData.annualRevenue > 0
    ) {
      const growthRate =
        ((data.financialData.annualRevenue -
          data.financialData.previousYearRevenue) /
          data.financialData.previousYearRevenue) *
        100
      if (growthRate < 10) {
        errors.push({
          field: 'general',
          message:
            'Warning: Growth stage companies typically show higher revenue growth rates.',
        })
      }
    }

    // Market position and company size
    if (
      data.businessDetails.marketPosition === 'leader' &&
      data.financialData.annualRevenue < 10000000
    ) {
      errors.push({
        field: 'general',
        message:
          'Warning: Market leaders typically have higher revenues. Consider reviewing market position or revenue figures.',
      })
    }

    return errors
  }
}

export function getErrorsForField(
  errors: ValidationError[],
  fieldName: string
): string[] {
  return errors
    .filter(error => error.field === fieldName || error.field === 'general')
    .map(error => error.message)
}
