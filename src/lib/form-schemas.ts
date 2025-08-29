import { z } from 'zod'
import { UserType } from '@prisma/client'

// Enhanced validation messages
const VALIDATION_MESSAGES = {
  email: {
    required: 'Email address is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters long',
    pattern:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  name: {
    required: 'This field is required',
    minLength: 'Must be at least 2 characters long',
    pattern: 'Only letters and spaces are allowed',
  },
  phone: {
    invalid: 'Please enter a valid phone number',
  },
  url: {
    invalid: 'Please enter a valid URL',
  },
  number: {
    invalid: 'Please enter a valid number',
    positive: 'Must be a positive number',
  },
}

// Custom validators
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
const nameRegex = /^[a-zA-Z\s]+$/

// Sign In Schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.email.required)
    .email(VALIDATION_MESSAGES.email.invalid),
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.password.required)
    .min(6, 'Password must be at least 6 characters'),
})

export type SignInFormData = z.infer<typeof signInSchema>

// Sign Up Schema
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, VALIDATION_MESSAGES.name.required)
      .min(2, VALIDATION_MESSAGES.name.minLength)
      .regex(nameRegex, VALIDATION_MESSAGES.name.pattern),
    lastName: z
      .string()
      .min(1, VALIDATION_MESSAGES.name.required)
      .min(2, VALIDATION_MESSAGES.name.minLength)
      .regex(nameRegex, VALIDATION_MESSAGES.name.pattern),
    email: z
      .string()
      .min(1, VALIDATION_MESSAGES.email.required)
      .email(VALIDATION_MESSAGES.email.invalid),
    password: z
      .string()
      .min(1, VALIDATION_MESSAGES.password.required)
      .min(8, VALIDATION_MESSAGES.password.minLength)
      .regex(strongPasswordRegex, VALIDATION_MESSAGES.password.pattern),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    userType: z.nativeEnum(UserType, {
      errorMap: () => ({ message: 'Please select a user type' }),
    }),
    company: z.string().optional(),
    position: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
    subscribeNewsletter: z.boolean().default(false),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Require company/position for business owners and brokers
      if (
        data.userType === UserType.BUSINESS_OWNER ||
        data.userType === UserType.BROKER
      ) {
        return data.company && data.company.length > 0
      }
      return true
    },
    {
      message: 'Company is required for business owners and brokers',
      path: ['company'],
    }
  )

export type SignUpFormData = z.infer<typeof signUpSchema>

// Business Listing Schema
export const businessListingSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, 'Business title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Business description is required')
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Please select a category'),
  listingType: z.string().min(1, 'Please select a listing type'),

  // Location
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().optional(),

  // Contact Information
  website: z
    .string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: VALIDATION_MESSAGES.url.invalid,
    }),
  phone: z
    .string()
    .optional()
    .refine(val => !val || phoneRegex.test(val), {
      message: VALIDATION_MESSAGES.phone.invalid,
    }),
  email: z
    .string()
    .optional()
    .refine(val => !val || z.string().email().safeParse(val).success, {
      message: VALIDATION_MESSAGES.email.invalid,
    }),

  // Financial Information
  askingPrice: z
    .string()
    .min(1, 'Asking price is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Please enter a valid asking price',
    }),
  revenue: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid revenue amount',
    }),
  profit: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid profit amount',
    }),
  cashFlow: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Number(val)), {
      message: 'Please enter a valid cash flow amount',
    }),
  ebitda: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Number(val)), {
      message: 'Please enter a valid EBITDA amount',
    }),
  monthlyRevenue: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid monthly revenue amount',
    }),
  grossMargin: z
    .string()
    .optional()
    .refine(
      val =>
        !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      {
        message: 'Gross margin must be between 0 and 100',
      }
    ),
  netMargin: z
    .string()
    .optional()
    .refine(
      val =>
        !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      {
        message: 'Net margin must be between 0 and 100',
      }
    ),

  // Business Details
  established: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true
        const year = Number(val)
        const currentYear = new Date().getFullYear()
        return !isNaN(year) && year >= 1800 && year <= currentYear
      },
      {
        message: 'Please enter a valid year',
      }
    ),
  employees: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid number of employees',
    }),
  customerBase: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid customer base size',
    }),

  // Operations
  hoursOfOperation: z.string().optional(),
  daysOpen: z.array(z.string()).optional(),
  seasonality: z
    .string()
    .max(500, 'Seasonality description must be less than 500 characters')
    .optional(),
  competition: z
    .string()
    .max(1000, 'Competition analysis must be less than 1000 characters')
    .optional(),

  // Sale Details
  reasonForSelling: z
    .string()
    .max(1000, 'Reason for selling must be less than 1000 characters')
    .optional(),
  timeframe: z.string().optional(),
  negotiations: z.string().optional(),
  financing: z
    .string()
    .max(1000, 'Financing options must be less than 1000 characters')
    .optional(),

  // Assets
  inventory: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid inventory value',
    }),
  equipment: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid equipment value',
    }),
  realEstate: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid real estate value',
    }),
  totalAssets: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid total assets value',
    }),
  liabilities: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Please enter a valid liabilities value',
    }),

  // Additional fields for validation
  yearlyGrowth: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Number(val)), {
      message: 'Please enter a valid growth percentage',
    }),
})

export type BusinessListingFormData = z.infer<typeof businessListingSchema>

// Business Evaluation Schema
export const businessEvaluationSchema = z.object({
  // Basic Info
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  businessType: z.string().min(1, 'Business type is required'),
  foundedYear: z
    .number()
    .min(1800, 'Please enter a valid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  employees: z
    .number()
    .min(0, 'Number of employees must be positive')
    .optional(),
  location: z.string().optional(),
  description: z.string().optional(),

  // Financial Data
  annualRevenue: z.number().min(0, 'Revenue must be positive'),
  grossProfit: z.number().min(0, 'Gross profit must be positive'),
  netIncome: z.number(),
  totalAssets: z.number().min(0, 'Total assets must be positive'),
  totalLiabilities: z
    .number()
    .min(0, 'Total liabilities must be positive')
    .optional(),
  operatingExpenses: z
    .number()
    .min(0, 'Operating expenses must be positive')
    .optional(),
  cashFlow: z.number().optional(),

  // Business Details
  marketPosition: z.string().min(1, 'Market position is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  competitiveAdvantages: z.array(z.string()).optional(),
  riskFactors: z.array(z.string()).optional(),
})

export type BusinessEvaluationFormData = z.infer<
  typeof businessEvaluationSchema
>

// Contact/Inquiry Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.name.required)
    .min(2, VALIDATION_MESSAGES.name.minLength),
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.email.required)
    .email(VALIDATION_MESSAGES.email.invalid),
  phone: z
    .string()
    .optional()
    .refine(val => !val || phoneRegex.test(val), {
      message: VALIDATION_MESSAGES.phone.invalid,
    }),
  company: z.string().optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  preferredContact: z.enum(['email', 'phone', 'both']).default('email'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
