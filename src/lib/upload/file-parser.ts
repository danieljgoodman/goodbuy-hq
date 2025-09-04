import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import {
  FileParsingOptions,
  DetectedColumn,
  COLUMN_PATTERNS,
  DATA_TYPE_PATTERNS,
  SupportedMimeType,
} from '@/types/upload'
import { BusinessFormData } from '@/lib/validation/business-form-schema'

export interface ParsedFileData {
  headers: string[]
  rows: any[][]
  totalRows: number
  detectedColumns: DetectedColumn[]
  parseOptions: FileParsingOptions
  metadata: {
    filename: string
    size: number
    mimeType: string
    encoding: string
    delimiter?: string
    hasHeader: boolean
  }
}

export interface ParseProgress {
  stage: 'reading' | 'parsing' | 'analyzing' | 'complete'
  percentage: number
  message: string
}

export class FileParserService {
  private static progressCallback: ((progress: ParseProgress) => void) | null =
    null

  static setProgressCallback(callback: (progress: ParseProgress) => void) {
    this.progressCallback = callback
  }

  private static updateProgress(
    stage: ParseProgress['stage'],
    percentage: number,
    message: string
  ) {
    if (this.progressCallback) {
      this.progressCallback({ stage, percentage, message })
    }
  }

  // Main parsing function
  static async parseFile(
    file: File,
    options: Partial<FileParsingOptions> = {}
  ): Promise<ParsedFileData> {
    this.updateProgress('reading', 0, 'Reading file...')

    const defaultOptions: FileParsingOptions = {
      hasHeader: true,
      skipRows: 0,
      maxRows: 1000, // Limit for analysis
      encoding: 'utf-8',
      delimiter: ',',
      dateFormat: 'auto',
      currencySymbol: '$',
      decimalSeparator: '.',
      thousandsSeparator: ',',
    }

    const parseOptions = { ...defaultOptions, ...options }

    try {
      let parsedData: { headers: string[]; rows: any[][] }

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parsedData = await this.parseCSV(file, parseOptions)
      } else if (
        file.type.includes('spreadsheet') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        parsedData = await this.parseExcel(file, parseOptions)
      } else if (
        file.type === 'text/tab-separated-values' ||
        file.name.endsWith('.tsv')
      ) {
        parsedData = await this.parseCSV(file, {
          ...parseOptions,
          delimiter: '\t',
        })
      } else {
        throw new Error('Unsupported file format')
      }

      this.updateProgress('analyzing', 70, 'Analyzing data structure...')

      // Detect column types and patterns
      const detectedColumns = this.analyzeColumns(
        parsedData.headers,
        parsedData.rows
      )

      this.updateProgress('complete', 100, 'File parsing complete')

      return {
        ...parsedData,
        totalRows: parsedData.rows.length,
        detectedColumns,
        parseOptions,
        metadata: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          encoding: parseOptions.encoding,
          delimiter: parseOptions.delimiter,
          hasHeader: parseOptions.hasHeader,
        },
      }
    } catch (error) {
      console.error('File parsing error:', error)
      throw new Error(
        `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Parse CSV files
  private static parseCSV(
    file: File,
    options: FileParsingOptions
  ): Promise<{ headers: string[]; rows: any[][] }> {
    return new Promise((resolve, reject) => {
      this.updateProgress('parsing', 20, 'Parsing CSV data...')

      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        delimiter: options.delimiter,
        encoding: options.encoding,
        preview: options.maxRows
          ? options.maxRows + (options.hasHeader ? 1 : 0)
          : 0,
        complete: results => {
          try {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors)
            }

            let rows = results.data as string[][]

            // Skip initial rows if specified
            if (options.skipRows > 0) {
              rows = rows.slice(options.skipRows)
            }

            let headers: string[] = []
            let dataRows: any[][] = []

            if (options.hasHeader && rows.length > 0) {
              headers = rows[0].map(
                (h, i) => h?.toString().trim() || `Column ${i + 1}`
              )
              dataRows = rows.slice(1)
            } else {
              // Generate headers
              headers = rows[0]?.map((_, i) => `Column ${i + 1}`) || []
              dataRows = rows
            }

            this.updateProgress('parsing', 50, 'Processing data rows...')

            resolve({ headers, rows: dataRows })
          } catch (error) {
            reject(error)
          }
        },
        error: error => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        },
      })
    })
  }

  // Parse Excel files
  private static async parseExcel(
    file: File,
    options: FileParsingOptions
  ): Promise<{ headers: string[]; rows: any[][] }> {
    return new Promise((resolve, reject) => {
      this.updateProgress('parsing', 20, 'Parsing Excel data...')

      const reader = new FileReader()

      reader.onload = e => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })

          // Use first worksheet
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]

          // Convert to array format
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            range: options.maxRows
              ? { s: { r: 0, c: 0 }, e: { r: options.maxRows, c: -1 } }
              : undefined,
          }) as any[][]

          let rows = jsonData.filter(row =>
            row.some(cell => cell !== '' && cell !== null && cell !== undefined)
          )

          // Skip initial rows if specified
          if (options.skipRows > 0) {
            rows = rows.slice(options.skipRows)
          }

          let headers: string[] = []
          let dataRows: any[][] = []

          if (options.hasHeader && rows.length > 0) {
            headers = rows[0].map((h, i) =>
              String(h || `Column ${i + 1}`).trim()
            )
            dataRows = rows.slice(1)
          } else {
            // Generate headers
            headers = rows[0]?.map((_, i) => `Column ${i + 1}`) || []
            dataRows = rows
          }

          this.updateProgress('parsing', 50, 'Processing Excel data...')

          resolve({ headers, rows: dataRows })
        } catch (error) {
          reject(
            new Error(
              `Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          )
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  // Analyze columns to detect data types and suggest mappings
  private static analyzeColumns(
    headers: string[],
    rows: any[][]
  ): DetectedColumn[] {
    const detectedColumns: DetectedColumn[] = []

    headers.forEach((header, index) => {
      const columnData = rows
        .map(row => row[index])
        .filter(val => val !== undefined && val !== null && val !== '')

      const samples = columnData.slice(0, 10).map(val => String(val))
      const uniqueValues = new Set(columnData)

      const column: DetectedColumn = {
        index,
        name: header,
        dataType: this.detectDataType(columnData),
        samples,
        confidence: 0,
        suggestedMapping: this.suggestFieldMapping(header),
        isRequired: false,
        nullCount: rows.length - columnData.length,
        uniqueCount: uniqueValues.size,
        pattern: this.detectPattern(columnData),
      }

      // Calculate confidence based on pattern matching and data consistency
      column.confidence = this.calculateConfidence(column, columnData)

      detectedColumns.push(column)
    })

    return detectedColumns
  }

  // Detect data type based on sample values
  private static detectDataType(values: any[]): DetectedColumn['dataType'] {
    if (values.length === 0) return 'string'

    const sampleSize = Math.min(values.length, 20)
    const samples = values.slice(0, sampleSize).map(v => String(v).trim())

    let currencyCount = 0
    let percentageCount = 0
    let dateCount = 0
    let numberCount = 0
    let booleanCount = 0

    samples.forEach(sample => {
      // Check currency
      if (DATA_TYPE_PATTERNS.currency.some(pattern => pattern.test(sample))) {
        currencyCount++
        return
      }

      // Check percentage
      if (DATA_TYPE_PATTERNS.percentage.some(pattern => pattern.test(sample))) {
        percentageCount++
        return
      }

      // Check date
      if (DATA_TYPE_PATTERNS.date.some(pattern => pattern.test(sample))) {
        dateCount++
        return
      }

      // Check boolean
      if (DATA_TYPE_PATTERNS.boolean.some(pattern => pattern.test(sample))) {
        booleanCount++
        return
      }

      // Check number
      if (DATA_TYPE_PATTERNS.number.some(pattern => pattern.test(sample))) {
        numberCount++
        return
      }
    })

    const threshold = sampleSize * 0.7 // 70% threshold

    if (currencyCount >= threshold) return 'currency'
    if (percentageCount >= threshold) return 'percentage'
    if (dateCount >= threshold) return 'date'
    if (booleanCount >= threshold) return 'boolean'
    if (numberCount >= threshold) return 'number'

    return 'string'
  }

  // Suggest field mapping based on column name
  private static suggestFieldMapping(
    columnName: string
  ): keyof BusinessFormData | undefined {
    const normalizedName = columnName.toLowerCase().trim()

    for (const [fieldName, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(normalizedName))) {
        return fieldName as keyof BusinessFormData
      }
    }

    return undefined
  }

  // Detect common patterns in the data
  private static detectPattern(values: any[]): string | undefined {
    if (values.length === 0) return undefined

    const samples = values.slice(0, 10).map(v => String(v).trim())

    // Check for common patterns
    const patterns = {
      currency: /^\$[\d,]+\.?\d*$/,
      percentage: /^\d+\.?\d*%$/,
      phone: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      zipCode: /^\d{5}(-\d{4})?$/,
    }

    for (const [patternName, pattern] of Object.entries(patterns)) {
      if (samples.some(sample => pattern.test(sample))) {
        return patternName
      }
    }

    return undefined
  }

  // Calculate confidence score for column detection
  private static calculateConfidence(
    column: DetectedColumn,
    values: any[]
  ): number {
    let confidence = 0

    // Base confidence from data type consistency
    const typeConsistent = this.checkTypeConsistency(column.dataType, values)
    confidence += typeConsistent * 0.4

    // Confidence from field mapping
    if (column.suggestedMapping) {
      confidence += 0.3
    }

    // Confidence from pattern detection
    if (column.pattern) {
      confidence += 0.2
    }

    // Confidence from data completeness
    const completeness =
      1 - column.nullCount / (values.length + column.nullCount)
    confidence += completeness * 0.1

    return Math.min(1, Math.max(0, confidence))
  }

  // Check consistency of data type across values
  private static checkTypeConsistency(
    dataType: DetectedColumn['dataType'],
    values: any[]
  ): number {
    if (values.length === 0) return 0

    const samples = values.slice(0, 20).map(v => String(v).trim())
    let consistentCount = 0

    samples.forEach(sample => {
      let isConsistent = false

      switch (dataType) {
        case 'currency':
          isConsistent = DATA_TYPE_PATTERNS.currency.some(pattern =>
            pattern.test(sample)
          )
          break
        case 'percentage':
          isConsistent = DATA_TYPE_PATTERNS.percentage.some(pattern =>
            pattern.test(sample)
          )
          break
        case 'date':
          isConsistent = DATA_TYPE_PATTERNS.date.some(pattern =>
            pattern.test(sample)
          )
          break
        case 'number':
          isConsistent = DATA_TYPE_PATTERNS.number.some(pattern =>
            pattern.test(sample)
          )
          break
        case 'boolean':
          isConsistent = DATA_TYPE_PATTERNS.boolean.some(pattern =>
            pattern.test(sample)
          )
          break
        case 'string':
          isConsistent = true // Strings are always consistent
          break
      }

      if (isConsistent) {
        consistentCount++
      }
    })

    return consistentCount / samples.length
  }

  // Transform raw value based on detected data type
  static transformValue(
    value: any,
    dataType: DetectedColumn['dataType'],
    options?: FileParsingOptions
  ): any {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const stringValue = String(value).trim()

    try {
      switch (dataType) {
        case 'currency':
          // Remove currency symbols and parse as number
          const currencyValue = stringValue.replace(/[\$,\s]/g, '')
          return parseFloat(currencyValue) || null

        case 'percentage':
          // Remove % symbol and convert to decimal
          const percentValue = stringValue.replace(/%/g, '')
          return parseFloat(percentValue) || null

        case 'number':
          // Parse as number, handling thousands separators
          const numberValue = stringValue.replace(/[,\s]/g, '')
          return parseFloat(numberValue) || null

        case 'date':
          const dateValue = new Date(stringValue)
          return isNaN(dateValue.getTime())
            ? null
            : dateValue.toISOString().split('T')[0]

        case 'boolean':
          const lowerValue = stringValue.toLowerCase()
          return ['true', 'yes', 'y', '1'].includes(lowerValue)

        default:
          return stringValue
      }
    } catch (error) {
      console.warn(
        `Failed to transform value "${value}" as ${dataType}:`,
        error
      )
      return stringValue
    }
  }
}
