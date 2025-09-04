import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { FileParserService, ParsedFileData } from '../../../src/lib/upload/file-parser'

// Mock Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn()
}))

// Mock XLSX
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}))

describe('FileParserService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('parseFile', () => {
    it('should handle CSV files correctly', async () => {
      const Papa = require('papaparse')
      const mockCsvData = [
        ['Business Name', 'Revenue', 'Category'],
        ['Test Restaurant', '500000', 'RESTAURANT'],
        ['Test Store', '200000', 'RETAIL']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({
          data: mockCsvData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      expect(result.headers).toEqual(['Business Name', 'Revenue', 'Category'])
      expect(result.rows).toHaveLength(2)
      expect(result.detectedColumns).toHaveLength(3)
      expect(result.metadata.filename).toBe('test.csv')
    })

    it('should handle files without headers', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Test Restaurant', '500000', 'RESTAURANT'],
        ['Test Store', '200000', 'RETAIL']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({
          data: mockData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile, { hasHeader: false })

      expect(result.headers).toEqual(['Column 1', 'Column 2', 'Column 3'])
      expect(result.rows).toHaveLength(2)
    })

    it('should detect column data types correctly', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Business Name', 'Revenue', 'Margin', 'Established', 'Active'],
        ['Test Restaurant', '$500,000', '12.5%', '2015', 'true'],
        ['Test Store', '$200,000.00', '8.2%', '2020', 'false']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({
          data: mockData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const revenueColumn = result.detectedColumns.find(col => col.name === 'Revenue')
      const marginColumn = result.detectedColumns.find(col => col.name === 'Margin')
      const establishedColumn = result.detectedColumns.find(col => col.name === 'Established')
      const activeColumn = result.detectedColumns.find(col => col.name === 'Active')

      expect(revenueColumn?.dataType).toBe('currency')
      expect(marginColumn?.dataType).toBe('percentage')
      expect(establishedColumn?.dataType).toBe('number')
      expect(activeColumn?.dataType).toBe('boolean')
    })

    it('should suggest field mappings based on column names', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Business Name', 'Annual Revenue', 'Net Profit', 'City', 'State'],
        ['Test Restaurant', '500000', '45000', 'Seattle', 'WA']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({
          data: mockData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const nameColumn = result.detectedColumns.find(col => col.name === 'Business Name')
      const revenueColumn = result.detectedColumns.find(col => col.name === 'Annual Revenue')
      const profitColumn = result.detectedColumns.find(col => col.name === 'Net Profit')
      const cityColumn = result.detectedColumns.find(col => col.name === 'City')
      const stateColumn = result.detectedColumns.find(col => col.name === 'State')

      expect(nameColumn?.suggestedMapping).toBe('title')
      expect(revenueColumn?.suggestedMapping).toBe('revenue')
      expect(profitColumn?.suggestedMapping).toBe('profit')
      expect(cityColumn?.suggestedMapping).toBe('city')
      expect(stateColumn?.suggestedMapping).toBe('state')
    })

    it('should calculate confidence scores correctly', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Business Name', 'Revenue', 'Random Data'],
        ['Test Restaurant', '$500,000', 'xyz123'],
        ['Test Store', '$200,000', 'abc456']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({
          data: mockData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const nameColumn = result.detectedColumns.find(col => col.name === 'Business Name')
      const revenueColumn = result.detectedColumns.find(col => col.name === 'Revenue')
      const randomColumn = result.detectedColumns.find(col => col.name === 'Random Data')

      // Name column should have high confidence (good mapping + consistent data)
      expect(nameColumn?.confidence).toBeGreaterThan(0.5)
      
      // Revenue column should have high confidence (good mapping + currency format)
      expect(revenueColumn?.confidence).toBeGreaterThan(0.5)
      
      // Random column should have low confidence (no mapping + inconsistent data)
      expect(randomColumn?.confidence).toBeLessThan(0.5)
    })

    it('should handle Excel files', async () => {
      const XLSX = require('xlsx')
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      }

      const mockSheetData = [
        ['Business Name', 'Revenue'],
        ['Test Business', 500000]
      ]

      XLSX.read.mockReturnValue(mockWorkbook)
      XLSX.utils.sheet_to_json.mockReturnValue(mockSheetData)

      const mockFile = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })

      const result = await FileParserService.parseFile(mockFile)

      expect(result.headers).toEqual(['Business Name', 'Revenue'])
      expect(result.rows).toHaveLength(1)
      expect(XLSX.read).toHaveBeenCalled()
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalled()
    })

    it('should handle parsing errors gracefully', async () => {
      const Papa = require('papaparse')
      Papa.parse.mockImplementation((file, options) => {
        options.error(new Error('Parse error'))
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })

      await expect(FileParserService.parseFile(mockFile)).rejects.toThrow('Failed to parse file')
    })

    it('should limit rows when maxRows option is provided', async () => {
      const Papa = require('papaparse')
      const mockData = Array.from({ length: 1000 }, (_, i) => 
        i === 0 ? ['Name', 'Value'] : [`Business ${i}`, `${i * 1000}`]
      )

      Papa.parse.mockImplementation((file, options) => {
        // Simulate preview behavior
        const previewData = options.preview ? mockData.slice(0, options.preview) : mockData
        options.complete({
          data: previewData,
          errors: []
        })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile, { maxRows: 100 })

      expect(result.rows.length).toBeLessThanOrEqual(100)
    })
  })

  describe('transformValue', () => {
    it('should transform currency values correctly', () => {
      expect(FileParserService.transformValue('$1,500.00', 'currency')).toBe(1500)
      expect(FileParserService.transformValue('$1,500,000', 'currency')).toBe(1500000)
      expect(FileParserService.transformValue('invalid', 'currency')).toBeNull()
    })

    it('should transform percentage values correctly', () => {
      expect(FileParserService.transformValue('15.5%', 'percentage')).toBe(15.5)
      expect(FileParserService.transformValue('100%', 'percentage')).toBe(100)
      expect(FileParserService.transformValue('invalid', 'percentage')).toBeNull()
    })

    it('should transform number values correctly', () => {
      expect(FileParserService.transformValue('1,500', 'number')).toBe(1500)
      expect(FileParserService.transformValue('1500.50', 'number')).toBe(1500.50)
      expect(FileParserService.transformValue('invalid', 'number')).toBeNull()
    })

    it('should transform boolean values correctly', () => {
      expect(FileParserService.transformValue('true', 'boolean')).toBe(true)
      expect(FileParserService.transformValue('false', 'boolean')).toBe(false)
      expect(FileParserService.transformValue('yes', 'boolean')).toBe(true)
      expect(FileParserService.transformValue('no', 'boolean')).toBe(false)
      expect(FileParserService.transformValue('1', 'boolean')).toBe(true)
      expect(FileParserService.transformValue('0', 'boolean')).toBe(false)
    })

    it('should transform date values correctly', () => {
      const result = FileParserService.transformValue('2023-12-25', 'date')
      expect(result).toBe('2023-12-25')
      
      const result2 = FileParserService.transformValue('12/25/2023', 'date')
      expect(result2).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      expect(FileParserService.transformValue('invalid date', 'date')).toBeNull()
    })

    it('should handle null and empty values', () => {
      expect(FileParserService.transformValue(null, 'currency')).toBeNull()
      expect(FileParserService.transformValue('', 'currency')).toBeNull()
      expect(FileParserService.transformValue(undefined, 'currency')).toBeNull()
    })

    it('should return string values unchanged for string type', () => {
      expect(FileParserService.transformValue('Test Business', 'string')).toBe('Test Business')
      expect(FileParserService.transformValue('  Trimmed  ', 'string')).toBe('Trimmed')
    })
  })

  describe('data type detection', () => {
    it('should detect currency patterns correctly', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Price'],
        ['$1,500.00'],
        ['$500,000'],
        ['$25.50']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({ data: mockData, errors: [] })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const priceColumn = result.detectedColumns.find(col => col.name === 'Price')
      expect(priceColumn?.dataType).toBe('currency')
    })

    it('should detect percentage patterns correctly', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Margin'],
        ['15.5%'],
        ['8%'],
        ['22.75%']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({ data: mockData, errors: [] })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const marginColumn = result.detectedColumns.find(col => col.name === 'Margin')
      expect(marginColumn?.dataType).toBe('percentage')
    })

    it('should default to string for mixed or unknown data', async () => {
      const Papa = require('papaparse')
      const mockData = [
        ['Mixed Data'],
        ['Some text'],
        ['123'],
        ['$500'],
        ['More text']
      ]

      Papa.parse.mockImplementation((file, options) => {
        options.complete({ data: mockData, errors: [] })
      })

      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const result = await FileParserService.parseFile(mockFile)

      const mixedColumn = result.detectedColumns.find(col => col.name === 'Mixed Data')
      expect(mixedColumn?.dataType).toBe('string')
    })
  })
})