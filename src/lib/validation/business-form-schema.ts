import { z } from 'zod'

// Enhanced business form validation schema with intelligent rules
export const businessFormSchema = z
  .object({
    // Basic Information - Enhanced validation
    title: z
      .string()
      .min(3, 'Business title must be at least 3 characters')
      .max(100, 'Business title cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9\s\-'&.()]+$/, 'Title contains invalid characters'),

    description: z
      .string()
      .min(50, 'Description must be at least 50 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),

    category: z.enum(
      [
        'RESTAURANT',
        'RETAIL',
        'ECOMMERCE',
        'TECHNOLOGY',
        'MANUFACTURING',
        'SERVICES',
        'HEALTHCARE',
        'REAL_ESTATE',
        'AUTOMOTIVE',
        'ENTERTAINMENT',
        'EDUCATION',
        'OTHER',
      ],
      { message: 'Please select a business category' }
    ),

    listingType: z.enum(
      ['BUSINESS_SALE', 'ASSET_SALE', 'FRANCHISE', 'PARTNERSHIP', 'INVESTMENT'],
      { message: 'Please select a listing type' }
    ),

    // Location - Enhanced validation
    address: z.string().optional(),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'City name contains invalid characters'),

    state: z
      .string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State name too long'),

    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
      .optional(),

    // Contact - Enhanced validation
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),

    phone: z
      .string()
      .regex(
        /^(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
        'Invalid phone number format'
      )
      .optional()
      .or(z.literal('')),

    email: z
      .string()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),

    // Financial Information - Enhanced with business logic validation
    askingPrice: z
      .string()
      .transform(val => val.replace(/[,$]/g, ''))
      .refine(val => !isNaN(Number(val)), 'Must be a valid number')
      .transform(val => Number(val))
      .refine(val => val >= 1000, 'Asking price must be at least $1,000')
      .refine(val => val <= 100000000, 'Asking price cannot exceed $100M'),

    revenue: z
      .string()
      .transform(val => val.replace(/[,$]/g, ''))
      .refine(val => !isNaN(Number(val)), 'Must be a valid number')
      .transform(val => Number(val))
      .refine(val => val >= 0, 'Revenue cannot be negative')
      .refine(val => val <= 500000000, 'Revenue cannot exceed $500M')
      .optional(),

    profit: z.string().optional(),

    cashFlow: z.string().optional(),

    ebitda: z.string().optional(),

    grossMargin: z.string().optional(),

    netMargin: z.string().optional(),

    // Business Details - Enhanced validation
    established: z.string().optional(),

    employees: z.string().optional(),

    monthlyRevenue: z.string().optional(),

    yearlyGrowth: z.string().optional(),

    customerBase: z.string().optional(),

    // Assets - Enhanced validation
    inventory: z.string().optional(),

    equipment: z.string().optional(),

    realEstate: z.string().optional(),

    totalAssets: z.string().optional(),

    liabilities: z.string().optional(),

    // Operations - Enhanced validation
    hoursOfOperation: z
      .string()
      .max(100, 'Hours description too long')
      .optional(),

    daysOpen: z
      .array(z.string())
      .max(7, 'Cannot be open more than 7 days per week'),

    seasonality: z
      .string()
      .max(1000, 'Seasonality description too long')
      .optional(),

    competition: z
      .string()
      .max(1000, 'Competition analysis too long')
      .optional(),

    // Sale Details - Enhanced validation
    reasonForSelling: z
      .string()
      .max(1000, 'Reason for selling too long')
      .optional(),

    timeframe: z
      .enum([
        'immediate',
        '1-3_months',
        '3-6_months',
        '6-12_months',
        'flexible',
      ])
      .optional(),

    negotiations: z
      .enum(['firm_price', 'negotiable', 'open_to_offers'])
      .optional(),

    financing: z
      .string()
      .max(1000, 'Financing description too long')
      .optional(),

    // Media
    images: z.array(z.any()).max(15, 'Cannot upload more than 15 images'),
    documents: z.array(z.any()).max(10, 'Cannot upload more than 10 documents'),
  })

  // Business logic validation rules - simplified for string inputs
  .refine(
    data => {
      if (data.revenue && data.monthlyRevenue) {
        const revenueNum =
          parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
        const monthlyNum =
          parseFloat(data.monthlyRevenue.toString().replace(/[,$]/g, '')) || 0
        const annualFromMonthly = monthlyNum * 12
        if (revenueNum > 0) {
          return Math.abs(annualFromMonthly - revenueNum) / revenueNum < 0.3 // Within 30%
        }
      }
      return true
    },
    {
      message: "Annual revenue and monthly revenue values don't align",
      path: ['monthlyRevenue'],
    }
  )

  .refine(
    data => {
      if (data.profit && data.revenue) {
        const profitNum =
          parseFloat(data.profit.toString().replace(/[,$]/g, '')) || 0
        const revenueNum =
          parseFloat(data.revenue.toString().replace(/[,$]/g, '')) || 0
        return profitNum <= revenueNum
      }
      return true
    },
    {
      message: 'Profit cannot exceed revenue',
      path: ['profit'],
    }
  )

  .refine(
    data => {
      if (data.totalAssets && data.liabilities) {
        const assetsNum =
          parseFloat(data.totalAssets.toString().replace(/[,$]/g, '')) || 0
        const liabilitiesNum =
          parseFloat(data.liabilities.toString().replace(/[,$]/g, '')) || 0
        return liabilitiesNum <= assetsNum * 5 // Reasonable debt-to-asset ratio
      }
      return true
    },
    {
      message: 'Liabilities seem disproportionately high compared to assets',
      path: ['liabilities'],
    }
  )

  .refine(
    data => {
      if (data.grossMargin && data.netMargin) {
        const grossNum = parseFloat(data.grossMargin.toString()) || 0
        const netNum = parseFloat(data.netMargin.toString()) || 0
        return netNum <= grossNum
      }
      return true
    },
    {
      message: 'Net margin cannot exceed gross margin',
      path: ['netMargin'],
    }
  )

export type BusinessFormData = z.infer<typeof businessFormSchema>

// Individual field validation for real-time feedback
export const validateField = (
  fieldName: keyof BusinessFormData,
  value: any
): string[] => {
  try {
    const fieldSchema = businessFormSchema.shape[fieldName]
    if (fieldSchema) {
      fieldSchema.parse(value)
    }
    return []
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map(err => err.message)
    }
    return ['Invalid value']
  }
}

// Step validation for progress tracking
export const validateStep = (
  step: number,
  data: Partial<BusinessFormData>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  try {
    switch (step) {
      case 1: // Basic Information
        businessFormSchema
          .pick({
            title: true,
            description: true,
            category: true,
            listingType: true,
          })
          .parse(data)
        break

      case 2: // Location & Contact
        businessFormSchema
          .pick({
            city: true,
            state: true,
            zipCode: true,
            website: true,
            phone: true,
            email: true,
          })
          .partial()
          .parse(data)
        break

      case 3: // Financial Details
        businessFormSchema
          .pick({
            askingPrice: true,
            revenue: true,
            profit: true,
            cashFlow: true,
            ebitda: true,
            grossMargin: true,
            netMargin: true,
            monthlyRevenue: true,
          })
          .partial()
          .parse(data)
        break

      case 4: // Business Operations
        businessFormSchema
          .pick({
            established: true,
            employees: true,
            yearlyGrowth: true,
            customerBase: true,
            inventory: true,
            equipment: true,
            realEstate: true,
            totalAssets: true,
            liabilities: true,
            hoursOfOperation: true,
            daysOpen: true,
            seasonality: true,
            competition: true,
          })
          .partial()
          .parse(data)
        break

      case 5: // Sale Information
        businessFormSchema
          .pick({
            reasonForSelling: true,
            timeframe: true,
            negotiations: true,
            financing: true,
          })
          .partial()
          .parse(data)
        break

      case 6: // Media & Documents
        businessFormSchema
          .pick({
            images: true,
            documents: true,
          })
          .parse(data)
        break
    }

    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => err.message),
      }
    }
    return { isValid: false, errors: ['Validation failed'] }
  }
}
