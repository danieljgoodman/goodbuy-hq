import React, { useState, useCallback, useMemo } from 'react'
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  Settings,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DetectedColumn,
  ColumnMapping,
  ValidationResult,
  FIELD_MAPPING_TEMPLATES,
} from '@/types/upload'
import { BusinessFormData } from '@/lib/validation/business-form-schema'

interface DataMappingInterfaceProps {
  detectedColumns: DetectedColumn[]
  previewData: any[][]
  onMappingChange: (mappings: ColumnMapping[]) => void
  onValidationComplete: (results: ValidationResult[]) => void
  initialMappings?: ColumnMapping[]
  className?: string
}

interface MappingState {
  mappings: ColumnMapping[]
  validationResults: ValidationResult[]
  previewMode: boolean
  showAdvanced: boolean
  selectedTemplate?: keyof typeof FIELD_MAPPING_TEMPLATES
}

const BUSINESS_FIELDS: Array<{
  key: keyof BusinessFormData
  label: string
  description: string
  category: string
  required?: boolean
}> = [
  // Basic Information
  {
    key: 'title',
    label: 'Business Name',
    description: 'Name of the business',
    category: 'Basic',
    required: true,
  },
  {
    key: 'description',
    label: 'Description',
    description: 'Business description',
    category: 'Basic',
    required: true,
  },
  {
    key: 'category',
    label: 'Category',
    description: 'Business category',
    category: 'Basic',
    required: true,
  },
  {
    key: 'listingType',
    label: 'Listing Type',
    description: 'Type of business listing',
    category: 'Basic',
  },

  // Financial
  {
    key: 'askingPrice',
    label: 'Asking Price',
    description: 'Price asking for business',
    category: 'Financial',
    required: true,
  },
  {
    key: 'revenue',
    label: 'Annual Revenue',
    description: 'Annual business revenue',
    category: 'Financial',
  },
  {
    key: 'profit',
    label: 'Net Profit',
    description: 'Annual net profit',
    category: 'Financial',
  },
  {
    key: 'cashFlow',
    label: 'Cash Flow',
    description: 'Monthly cash flow',
    category: 'Financial',
  },
  {
    key: 'ebitda',
    label: 'EBITDA',
    description:
      'Earnings before interest, taxes, depreciation, and amortization',
    category: 'Financial',
  },
  {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    description: 'Average monthly revenue',
    category: 'Financial',
  },
  {
    key: 'grossMargin',
    label: 'Gross Margin %',
    description: 'Gross profit margin percentage',
    category: 'Financial',
  },
  {
    key: 'netMargin',
    label: 'Net Margin %',
    description: 'Net profit margin percentage',
    category: 'Financial',
  },

  // Operations
  {
    key: 'established',
    label: 'Year Established',
    description: 'Year business was established',
    category: 'Operations',
  },
  {
    key: 'employees',
    label: 'Employees',
    description: 'Number of employees',
    category: 'Operations',
  },
  {
    key: 'customerBase',
    label: 'Customer Base',
    description: 'Number of customers',
    category: 'Operations',
  },
  {
    key: 'yearlyGrowth',
    label: 'Yearly Growth %',
    description: 'Annual growth rate',
    category: 'Operations',
  },
  {
    key: 'hoursOfOperation',
    label: 'Hours of Operation',
    description: 'Business operating hours',
    category: 'Operations',
  },

  // Location & Contact
  {
    key: 'address',
    label: 'Address',
    description: 'Business address',
    category: 'Location',
  },
  {
    key: 'city',
    label: 'City',
    description: 'City location',
    category: 'Location',
    required: true,
  },
  {
    key: 'state',
    label: 'State',
    description: 'State location',
    category: 'Location',
    required: true,
  },
  {
    key: 'zipCode',
    label: 'ZIP Code',
    description: 'Postal code',
    category: 'Location',
  },
  {
    key: 'website',
    label: 'Website',
    description: 'Business website URL',
    category: 'Contact',
  },
  {
    key: 'phone',
    label: 'Phone',
    description: 'Business phone number',
    category: 'Contact',
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Contact email address',
    category: 'Contact',
  },

  // Assets
  {
    key: 'inventory',
    label: 'Inventory Value',
    description: 'Value of business inventory',
    category: 'Assets',
  },
  {
    key: 'equipment',
    label: 'Equipment Value',
    description: 'Value of business equipment',
    category: 'Assets',
  },
  {
    key: 'realEstate',
    label: 'Real Estate Value',
    description: 'Value of real estate assets',
    category: 'Assets',
  },
  {
    key: 'totalAssets',
    label: 'Total Assets',
    description: 'Total business assets',
    category: 'Assets',
  },
  {
    key: 'liabilities',
    label: 'Liabilities',
    description: 'Total business liabilities',
    category: 'Assets',
  },
]

export const DataMappingInterface: React.FC<DataMappingInterfaceProps> = ({
  detectedColumns,
  previewData,
  onMappingChange,
  onValidationComplete,
  initialMappings = [],
  className,
}) => {
  const [state, setState] = useState<MappingState>({
    mappings:
      initialMappings.length > 0
        ? initialMappings
        : generateInitialMappings(detectedColumns),
    validationResults: [],
    previewMode: false,
    showAdvanced: false,
  })

  // Generate initial mappings based on detected columns
  function generateInitialMappings(columns: DetectedColumn[]): ColumnMapping[] {
    return columns.map(column => ({
      sourceColumn: column.name,
      sourceIndex: column.index,
      targetField: column.suggestedMapping || null,
      dataType: column.dataType,
      transformations: [],
      validationRules: [],
      confidence: column.confidence,
      isRequired: column.suggestedMapping
        ? BUSINESS_FIELDS.find(f => f.key === column.suggestedMapping)
            ?.required || false
        : false,
      skipColumn: !column.suggestedMapping,
    }))
  }

  // Group business fields by category
  const fieldsByCategory = useMemo(() => {
    return BUSINESS_FIELDS.reduce(
      (acc, field) => {
        if (!acc[field.category]) {
          acc[field.category] = []
        }
        acc[field.category].push(field)
        return acc
      },
      {} as Record<string, typeof BUSINESS_FIELDS>
    )
  }, [])

  // Update mapping for a specific column
  const updateMapping = useCallback(
    (sourceIndex: number, updates: Partial<ColumnMapping>) => {
      setState(prev => ({
        ...prev,
        mappings: prev.mappings.map(mapping =>
          mapping.sourceIndex === sourceIndex
            ? { ...mapping, ...updates }
            : mapping
        ),
      }))
    },
    []
  )

  // Apply template mapping
  const applyTemplate = useCallback(
    (template: keyof typeof FIELD_MAPPING_TEMPLATES) => {
      const templateFields = FIELD_MAPPING_TEMPLATES[template]

      setState(prev => ({
        ...prev,
        mappings: prev.mappings.map(mapping => {
          // Find best match for this column in the template
          const bestMatch = templateFields.find(field => {
            const fieldInfo = BUSINESS_FIELDS.find(f => f.key === field)
            if (!fieldInfo) return false

            // Check if column name matches field
            const columnName = mapping.sourceColumn.toLowerCase()
            const fieldName = fieldInfo.label.toLowerCase()
            return (
              columnName.includes(fieldName) || fieldName.includes(columnName)
            )
          })

          if (bestMatch) {
            return {
              ...mapping,
              targetField: bestMatch,
              skipColumn: false,
              confidence: Math.min(1, mapping.confidence + 0.2),
            }
          }

          return mapping
        }),
        selectedTemplate: template,
      }))
    },
    []
  )

  // Validate mappings
  const validateMappings = useCallback(() => {
    const results: ValidationResult[] = []
    const usedFields = new Set<keyof BusinessFormData>()

    state.mappings.forEach((mapping, index) => {
      if (mapping.skipColumn) return

      // Check for duplicate mappings
      if (mapping.targetField && usedFields.has(mapping.targetField)) {
        results.push({
          row: -1,
          column: mapping.sourceColumn,
          field: mapping.targetField,
          type: 'error',
          message: `Field "${mapping.targetField}" is mapped to multiple columns`,
          originalValue: mapping.sourceColumn,
        })
      }

      if (mapping.targetField) {
        usedFields.add(mapping.targetField)
      }

      // Check required fields
      if (mapping.isRequired && !mapping.targetField) {
        results.push({
          row: -1,
          column: mapping.sourceColumn,
          type: 'warning',
          message: 'This appears to be a required field but is not mapped',
          originalValue: mapping.sourceColumn,
        })
      }

      // Check data type compatibility
      const targetFieldInfo = BUSINESS_FIELDS.find(
        f => f.key === mapping.targetField
      )
      if (targetFieldInfo && mapping.dataType && mapping.targetField) {
        const isCompatible = checkDataTypeCompatibility(
          mapping.dataType,
          mapping.targetField
        )
        if (!isCompatible) {
          results.push({
            row: -1,
            column: mapping.sourceColumn,
            field: mapping.targetField,
            type: 'warning',
            message: `Data type "${mapping.dataType}" may not be compatible with field "${targetFieldInfo.label}"`,
            originalValue: mapping.dataType,
          })
        }
      }
    })

    // Check for missing required fields
    const requiredFields = BUSINESS_FIELDS.filter(f => f.required).map(
      f => f.key
    )
    const mappedFields = Array.from(usedFields)

    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        const fieldInfo = BUSINESS_FIELDS.find(f => f.key === field)
        results.push({
          row: -1,
          column: '',
          field: field,
          type: 'error',
          message: `Required field "${fieldInfo?.label}" is not mapped to any column`,
          originalValue: field,
        })
      }
    })

    setState(prev => ({ ...prev, validationResults: results }))
    onValidationComplete(results)

    return results.length === 0
  }, [state.mappings, onValidationComplete])

  // Check if data type is compatible with target field
  function checkDataTypeCompatibility(
    dataType: DetectedColumn['dataType'],
    targetField: keyof BusinessFormData
  ): boolean {
    const financialFields = [
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
    ]
    const percentageFields = ['grossMargin', 'netMargin', 'yearlyGrowth']
    const numberFields = ['established', 'employees', 'customerBase']
    const dateFields: string[] = [] // No direct date fields in business form
    const textFields = [
      'title',
      'description',
      'address',
      'city',
      'state',
      'zipCode',
      'website',
      'phone',
      'email',
      'hoursOfOperation',
      'category',
      'listingType',
    ]

    switch (dataType) {
      case 'currency':
        return financialFields.includes(targetField)
      case 'percentage':
        return percentageFields.includes(targetField)
      case 'number':
        return [
          ...numberFields,
          ...financialFields,
          ...percentageFields,
        ].includes(targetField)
      case 'date':
        return dateFields.includes(targetField)
      case 'string':
        return textFields.includes(targetField)
      default:
        return true // Allow any for unknown types
    }
  }

  // Auto-map columns based on confidence
  const autoMap = useCallback(() => {
    setState(prev => ({
      ...prev,
      mappings: prev.mappings.map(mapping => {
        const column = detectedColumns.find(
          col => col.index === mapping.sourceIndex
        )
        if (column && column.suggestedMapping && column.confidence > 0.6) {
          return {
            ...mapping,
            targetField: column.suggestedMapping,
            skipColumn: false,
            confidence: column.confidence,
          }
        }
        return mapping
      }),
    }))
  }, [detectedColumns])

  // Update parent when mappings change
  React.useEffect(() => {
    onMappingChange(state.mappings)
  }, [state.mappings, onMappingChange])

  const renderColumnMapping = (
    mapping: ColumnMapping,
    column: DetectedColumn
  ) => {
    const hasError = state.validationResults.some(
      r => r.column === mapping.sourceColumn && r.type === 'error'
    )
    const hasWarning = state.validationResults.some(
      r => r.column === mapping.sourceColumn && r.type === 'warning'
    )

    return (
      <div
        key={mapping.sourceIndex}
        className={cn(
          'grid grid-cols-12 gap-4 p-4 bg-white border rounded-lg items-center',
          hasError && 'border-red-300 bg-red-50',
          hasWarning && 'border-yellow-300 bg-yellow-50'
        )}
      >
        {/* Source Column Info */}
        <div className="col-span-4">
          <div className="flex items-center space-x-2">
            <div>
              <h4 className="font-medium text-gray-900">{column.name}</h4>
              <p className="text-sm text-gray-500">
                {column.dataType} • {column.samples.length} samples
              </p>
              {state.previewMode && (
                <div className="text-xs text-gray-400 mt-1">
                  {column.samples.slice(0, 3).join(', ')}...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mapping Arrow */}
        <div className="col-span-1 flex justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Target Field Selection */}
        <div className="col-span-5">
          <select
            value={mapping.targetField || ''}
            onChange={e => {
              const value = e.target.value as keyof BusinessFormData | ''
              updateMapping(mapping.sourceIndex, {
                targetField: value || null,
                skipColumn: !value,
                isRequired: value
                  ? BUSINESS_FIELDS.find(f => f.key === value)?.required ||
                    false
                  : false,
              })
            }}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              hasError
                ? 'border-red-300'
                : hasWarning
                  ? 'border-yellow-300'
                  : 'border-gray-300'
            )}
          >
            <option value="">Skip this column</option>
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <optgroup key={category} label={category}>
                {fields.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label} {field.required && '*'}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {mapping.targetField && (
            <div className="text-xs text-gray-500 mt-1">
              {
                BUSINESS_FIELDS.find(f => f.key === mapping.targetField)
                  ?.description
              }
            </div>
          )}
        </div>

        {/* Confidence & Actions */}
        <div className="col-span-2 flex items-center justify-end space-x-2">
          <div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              mapping.confidence > 0.7
                ? 'bg-green-100 text-green-800'
                : mapping.confidence > 0.4
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            )}
          >
            {Math.round(mapping.confidence * 100)}%
          </div>

          <button
            onClick={() =>
              updateMapping(mapping.sourceIndex, {
                skipColumn: !mapping.skipColumn,
              })
            }
            className={cn(
              'p-1 rounded hover:bg-gray-100',
              mapping.skipColumn ? 'text-gray-400' : 'text-green-600'
            )}
            title={mapping.skipColumn ? 'Include column' : 'Skip column'}
          >
            {mapping.skipColumn ? (
              <X className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  const errorCount = state.validationResults.filter(
    r => r.type === 'error'
  ).length
  const warningCount = state.validationResults.filter(
    r => r.type === 'warning'
  ).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Map Your Data</h3>
          <p className="text-sm text-gray-600">
            Match columns from your file to business data fields
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setState(prev => ({ ...prev, previewMode: !prev.previewMode }))
            }
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            {state.previewMode ? 'Hide' : 'Show'} Preview
          </button>

          <button
            onClick={autoMap}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Auto Map
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-blue-900">Quick Templates</h4>
          <button
            onClick={() =>
              setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))
            }
            className="text-blue-600 hover:text-blue-800"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(FIELD_MAPPING_TEMPLATES).map(template => (
            <button
              key={template}
              onClick={() =>
                applyTemplate(template as keyof typeof FIELD_MAPPING_TEMPLATES)
              }
              className={cn(
                'px-3 py-1 text-sm font-medium rounded border transition-colors',
                state.selectedTemplate === template
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              )}
            >
              {template.charAt(0).toUpperCase() + template.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Summary */}
      {(errorCount > 0 || warningCount > 0) && (
        <div
          className={cn(
            'p-4 rounded-lg border',
            errorCount > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          )}
        >
          <div className="flex items-center">
            {errorCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            ) : (
              <Info className="w-5 h-5 text-yellow-600 mr-2" />
            )}
            <div>
              <p className="text-sm font-medium">
                {errorCount > 0 ? 'Mapping Errors Found' : 'Mapping Warnings'}
              </p>
              <p className="text-xs mt-1">
                {errorCount > 0 && `${errorCount} errors`}
                {errorCount > 0 && warningCount > 0 && ', '}
                {warningCount > 0 && `${warningCount} warnings`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Column Mappings */}
      <div className="space-y-3">
        {state.mappings.map(mapping => {
          const column = detectedColumns.find(
            col => col.index === mapping.sourceIndex
          )
          if (!column) return null
          return renderColumnMapping(mapping, column)
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {state.mappings.filter(m => !m.skipColumn).length} of{' '}
          {state.mappings.length} columns mapped
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={validateMappings}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Validate Mapping
          </button>

          <button
            onClick={() => onMappingChange(state.mappings)}
            disabled={errorCount > 0}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded',
              errorCount > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Continue Import
          </button>
        </div>
      </div>
    </div>
  )
}
