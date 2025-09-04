import { BusinessFormData } from '@/lib/validation/business-form-schema'

export interface FileUploadSession {
  id: string
  businessId?: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  status:
    | 'uploading'
    | 'processing'
    | 'mapping'
    | 'validating'
    | 'importing'
    | 'completed'
    | 'failed'
  uploadedAt: Date
  processedAt?: Date
  completedAt?: Date
  mappingConfig?: ColumnMapping[]
  validationResults?: ValidationResult[]
  importResults?: ImportResult
  progressPercentage: number
  errorMessage?: string
  previewData?: any[][]
  detectedColumns?: DetectedColumn[]
  userId: string
}

export interface DetectedColumn {
  index: number
  name: string
  dataType: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean'
  samples: string[]
  confidence: number
  suggestedMapping?: keyof BusinessFormData
  isRequired: boolean
  nullCount: number
  uniqueCount: number
  pattern?: string
}

export interface ColumnMapping {
  sourceColumn: string
  sourceIndex: number
  targetField: keyof BusinessFormData | null
  dataType: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean'
  transformations: FieldTransformation[]
  validationRules: ValidationRule[]
  confidence: number
  isRequired: boolean
  skipColumn: boolean
}

export interface FieldTransformation {
  type:
    | 'currency_parse'
    | 'percentage_parse'
    | 'date_parse'
    | 'number_parse'
    | 'text_clean'
    | 'boolean_parse'
  config?: Record<string, any>
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'range' | 'custom'
  value?: any
  message: string
}

export interface ValidationResult {
  row: number
  column: string
  field?: keyof BusinessFormData
  type: 'error' | 'warning' | 'info'
  message: string
  suggestedFix?: string
  originalValue?: any
  transformedValue?: any
}

export interface ImportResult {
  totalRows: number
  processedRows: number
  successfulRows: number
  failedRows: number
  warnings: number
  errors: ValidationResult[]
  warnings_list: ValidationResult[]
  importedData: Partial<BusinessFormData>
  skippedColumns: string[]
  timestamp: Date
}

export interface FileParsingOptions {
  delimiter?: string
  hasHeader: boolean
  skipRows: number
  maxRows?: number
  encoding: 'utf-8' | 'latin1' | 'ascii'
  dateFormat?: string
  currencySymbol?: string
  decimalSeparator?: string
  thousandsSeparator?: string
}

export interface UploadProgress {
  stage: 'upload' | 'parse' | 'analyze' | 'map' | 'validate' | 'import'
  percentage: number
  message: string
  details?: string
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'text/csv': '.csv',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/tab-separated-values': '.tsv',
} as const

export type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES

// File size limits
export const FILE_SIZE_LIMITS = {
  max: 25 * 1024 * 1024, // 25MB
  recommended: 10 * 1024 * 1024, // 10MB
}

// Business data field mapping templates
export const FIELD_MAPPING_TEMPLATES = {
  financial: [
    'revenue',
    'profit',
    'cashFlow',
    'ebitda',
    'grossMargin',
    'netMargin',
    'monthlyRevenue',
    'askingPrice',
  ],
  operational: [
    'title',
    'description',
    'category',
    'established',
    'employees',
    'customerBase',
    'hoursOfOperation',
  ],
  location: ['address', 'city', 'state', 'zipCode'],
  contact: ['website', 'phone', 'email'],
  assets: [
    'inventory',
    'equipment',
    'realEstate',
    'totalAssets',
    'liabilities',
  ],
} as const

// Column name patterns for automatic detection
export const COLUMN_PATTERNS = {
  revenue: [
    /^(annual[_\s]?)?revenue$/i,
    /^sales$/i,
    /^income$/i,
    /^gross[_\s]?sales$/i,
  ],
  profit: [/^(net[_\s]?)?profit$/i, /^earnings$/i, /^net[_\s]?income$/i],
  askingPrice: [
    /^(asking[_\s]?)?price$/i,
    /^list[_\s]?price$/i,
    /^value$/i,
    /^valuation$/i,
  ],
  title: [/^(business[_\s]?)?name$/i, /^title$/i, /^company[_\s]?name$/i],
  description: [/^description$/i, /^summary$/i, /^overview$/i, /^details$/i],
  city: [/^city$/i, /^location$/i, /^municipality$/i],
  state: [/^state$/i, /^province$/i, /^region$/i],
  employees: [
    /^employees?$/i,
    /^staff$/i,
    /^workforce$/i,
    /^head[_\s]?count$/i,
  ],
} as const

// Data type detection patterns
export const DATA_TYPE_PATTERNS = {
  currency: [
    /^\$[\d,]+\.?\d*$/,
    /^[\d,]+\.?\d*\s*(?:USD|$|dollars?)$/i,
    /^(?:USD|$|dollars?)\s*[\d,]+\.?\d*$/i,
  ],
  percentage: [/^\d+\.?\d*%$/, /^\d+\.?\d*\s*(?:percent|pct)$/i],
  date: [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}-\d{1,2}-\d{2,4}$/,
  ],
  number: [/^\d+\.?\d*$/, /^[\d,]+\.?\d*$/],
  boolean: [/^(true|false)$/i, /^(yes|no)$/i, /^(y|n)$/i, /^(1|0)$/],
} as const
