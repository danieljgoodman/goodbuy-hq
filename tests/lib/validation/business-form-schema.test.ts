import { describe, it, expect } from '@jest/globals'
import { 
  businessFormSchema, 
  validateField, 
  validateStep, 
  BusinessFormData 
} from '../../../src/lib/validation/business-form-schema'

describe('BusinessFormSchema', () => {
  describe('validateField', () => {
    it('should validate required title field', () => {
      expect(validateField('title', '')).toContain('Business title is required')
      expect(validateField('title', 'A')).toContain('Business title must be at least 3 characters')
      expect(validateField('title', 'Valid Business Name')).toEqual([])
    })

    it('should validate description field', () => {
      expect(validateField('description', '')).toContain('Business description is required')
      expect(validateField('description', 'Short')).toContain('Description must be at least 50 characters')
      expect(validateField('description', 'This is a valid business description that meets the minimum character requirement.')).toEqual([])
    })

    it('should validate email format', () => {
      expect(validateField('email', 'invalid-email')).toContain('Invalid email format')
      expect(validateField('email', 'valid@email.com')).toEqual([])
      expect(validateField('email', '')).toEqual([]) // Optional field
    })

    it('should validate phone format', () => {
      expect(validateField('phone', '123')).toContain('Invalid phone format')
      expect(validateField('phone', '(555) 123-4567')).toEqual([])
      expect(validateField('phone', '555-123-4567')).toEqual([])
      expect(validateField('phone', '')).toEqual([]) // Optional field
    })

    it('should validate financial fields', () => {
      expect(validateField('askingPrice', '500')).toContain('Asking price must be at least $1,000')
      expect(validateField('askingPrice', '50000')).toEqual([])
      expect(validateField('revenue', '-1000')).toContain('Revenue cannot be negative')
      expect(validateField('grossMargin', '150')).toContain('Gross margin cannot exceed 100%')
    })
  })

  describe('validateStep', () => {
    it('should validate step 1 (Basic Information)', () => {
      const invalidData = { title: '', description: '', category: '' }
      const result = validateStep(1, invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      const validData = {
        title: 'Test Business',
        description: 'This is a comprehensive test description that meets all the minimum requirements.',
        category: 'RESTAURANT'
      }
      const validResult = validateStep(1, validData)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual([])
    })

    it('should validate step 2 (Location & Contact)', () => {
      const data = { city: 'Seattle', state: 'WA' }
      const result = validateStep(2, data)
      expect(result.isValid).toBe(true)

      const invalidData = { city: '', state: '' }
      const invalidResult = validateStep(2, invalidData)
      expect(invalidResult.isValid).toBe(false)
    })

    it('should validate step 3 (Financial Details)', () => {
      const data = { askingPrice: '100000' }
      const result = validateStep(3, data)
      expect(result.isValid).toBe(true)

      const emptyData = {}
      const emptyResult = validateStep(3, emptyData)
      expect(emptyResult.isValid).toBe(false)
    })
  })

  describe('business logic validation', () => {
    it('should validate revenue and monthly revenue alignment', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        revenue: '120000',
        monthlyRevenue: '5000' // Should be ~$10k for $120k annual
      }

      expect(() => businessFormSchema.parse(data)).toThrow()
    })

    it('should validate profit not exceeding revenue', () => {
      const data = {
        title: 'Test Business', 
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        revenue: '100000',
        profit: '150000' // Profit exceeds revenue
      }

      expect(() => businessFormSchema.parse(data)).toThrow()
    })

    it('should validate net margin not exceeding gross margin', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        grossMargin: '30',
        netMargin: '50' // Net margin exceeds gross margin
      }

      expect(() => businessFormSchema.parse(data)).toThrow()
    })

    it('should validate reasonable asset to liability ratio', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        totalAssets: '100000',
        liabilities: '600000' // 6x assets - should fail
      }

      expect(() => businessFormSchema.parse(data)).toThrow()
    })
  })

  describe('data transformation', () => {
    it('should transform currency strings to numbers', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        askingPrice: '$100,000.00',
        revenue: '50,000'
      }

      const result = businessFormSchema.parse(data)
      expect(result.askingPrice).toBe(100000)
      expect(result.revenue).toBe(50000)
    })

    it('should transform percentage strings to numbers', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        grossMargin: '45.5',
        netMargin: '12.3'
      }

      const result = businessFormSchema.parse(data)
      expect(result.grossMargin).toBe(45.5)
      expect(result.netMargin).toBe(12.3)
    })

    it('should transform year strings to numbers', () => {
      const data = {
        title: 'Test Business',
        description: 'Valid description that meets minimum character requirements for testing.',
        category: 'RESTAURANT' as const,
        established: '2015'
      }

      const result = businessFormSchema.parse(data)
      expect(result.established).toBe(2015)
    })
  })
})