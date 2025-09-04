import { describe, it, expect, beforeEach } from '@jest/globals'
import { 
  BusinessSuggestionsService, 
  BusinessSuggestion, 
  SuggestionContext 
} from '../../src/lib/business-suggestions'
import { BusinessFormData } from '../../src/lib/validation/business-form-schema'

describe('BusinessSuggestionsService', () => {
  let mockFormData: Partial<BusinessFormData>
  let mockContext: SuggestionContext

  beforeEach(() => {
    mockFormData = {
      category: 'RESTAURANT',
      revenue: 500000
    }
    
    mockContext = {
      category: 'RESTAURANT',
      businessSize: 'medium',
      location: {
        city: 'Seattle',
        state: 'WA'
      }
    }
  })

  describe('generateSuggestions', () => {
    it('should generate industry-based suggestions', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, mockContext)
      
      expect(suggestions.length).toBeGreaterThan(0)
      
      // Should suggest margins for restaurant category
      const marginSuggestions = suggestions.filter(s => 
        s.field === 'grossMargin' || s.field === 'netMargin'
      )
      expect(marginSuggestions.length).toBeGreaterThan(0)
      
      // Should have reasonable confidence levels
      suggestions.forEach(suggestion => {
        expect(suggestion.confidence).toBeGreaterThan(0)
        expect(suggestion.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should generate financial calculation suggestions', () => {
      const dataWithMargin: Partial<BusinessFormData> = {
        ...mockFormData,
        netMargin: 8 // 8% net margin
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(dataWithMargin, mockContext)
      
      // Should suggest calculated profit
      const profitSuggestion = suggestions.find(s => s.field === 'profit')
      expect(profitSuggestion).toBeDefined()
      expect(profitSuggestion?.confidence).toBeGreaterThan(0.8) // High confidence for calculations
      expect(profitSuggestion?.source).toBe('algorithm')
    })

    it('should generate asking price suggestions', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, mockContext)
      
      const priceSuggestion = suggestions.find(s => s.field === 'askingPrice')
      expect(priceSuggestion).toBeDefined()
      
      // Price should be a reasonable multiple of revenue
      const suggestedPrice = priceSuggestion?.value as number
      const revenueMultiple = suggestedPrice / (mockFormData.revenue as number)
      expect(revenueMultiple).toBeGreaterThan(0.5)
      expect(revenueMultiple).toBeLessThan(10)
    })

    it('should generate monthly revenue from annual revenue', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, mockContext)
      
      const monthlySuggestion = suggestions.find(s => s.field === 'monthlyRevenue')
      expect(monthlySuggestion).toBeDefined()
      
      const expectedMonthly = Math.round((mockFormData.revenue as number) / 12)
      expect(monthlySuggestion?.value).toBe(expectedMonthly)
    })

    it('should generate location-based suggestions', () => {
      const contextWithHighCostArea: SuggestionContext = {
        ...mockContext,
        location: { ...mockContext.location, state: 'CA' }
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, contextWithHighCostArea)
      const priceSuggestion = suggestions.find(s => s.field === 'askingPrice')
      
      // Should suggest higher price for high-cost areas
      expect(priceSuggestion?.confidence).toBeGreaterThan(0)
    })

    it('should respect existing data and not override', () => {
      const dataWithExistingPrice: Partial<BusinessFormData> = {
        ...mockFormData,
        askingPrice: 750000
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(dataWithExistingPrice, mockContext)
      
      // Should not suggest asking price since it's already set
      const priceSuggestion = suggestions.find(s => s.field === 'askingPrice')
      expect(priceSuggestion).toBeUndefined()
    })
  })

  describe('getFieldSuggestions', () => {
    it('should return suggestions for specific field', () => {
      const allSuggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, mockContext)
      const marginSuggestions = BusinessSuggestionsService.getFieldSuggestions('grossMargin', mockFormData, mockContext)
      
      expect(marginSuggestions.length).toBeLessThanOrEqual(allSuggestions.length)
      marginSuggestions.forEach(suggestion => {
        expect(suggestion.field).toBe('grossMargin')
      })
    })
  })

  describe('formatSuggestionValue', () => {
    it('should format currency values correctly', () => {
      const suggestion: BusinessSuggestion = {
        field: 'askingPrice',
        value: 1500000,
        confidence: 0.8,
        reason: 'Test',
        source: 'industry_average'
      }
      
      const formatted = BusinessSuggestionsService.formatSuggestionValue(suggestion)
      expect(formatted).toBe('$1,500,000')
    })

    it('should format percentage values correctly', () => {
      const suggestion: BusinessSuggestion = {
        field: 'grossMargin',
        value: 62.5,
        confidence: 0.7,
        reason: 'Test',
        source: 'industry_average'
      }
      
      const formatted = BusinessSuggestionsService.formatSuggestionValue(suggestion)
      expect(formatted).toBe('62.5%')
    })

    it('should format array values correctly', () => {
      const suggestion: BusinessSuggestion = {
        field: 'daysOpen',
        value: ['Monday', 'Tuesday', 'Wednesday'],
        confidence: 0.6,
        reason: 'Test',
        source: 'industry_average'
      }
      
      const formatted = BusinessSuggestionsService.formatSuggestionValue(suggestion)
      expect(formatted).toBe('Monday, Tuesday, Wednesday')
    })
  })

  describe('suggestion quality and relevance', () => {
    it('should generate high-confidence suggestions for calculated values', () => {
      const dataWithGoodInfo: Partial<BusinessFormData> = {
        category: 'TECHNOLOGY',
        revenue: 2000000,
        netMargin: 15
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(dataWithGoodInfo, {
        category: 'TECHNOLOGY',
        businessSize: 'medium'
      })
      
      const profitSuggestion = suggestions.find(s => s.field === 'profit')
      expect(profitSuggestion?.confidence).toBeGreaterThan(0.8)
    })

    it('should provide reasonable business logic warnings through suggestions', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions({
        category: 'RESTAURANT',
        revenue: 100000 // Low revenue for restaurant
      }, { category: 'RESTAURANT', businessSize: 'small' })
      
      // All suggestions should be realistic for the business size
      suggestions.forEach(suggestion => {
        if (suggestion.field === 'askingPrice') {
          const price = suggestion.value as number
          expect(price).toBeGreaterThan(10000) // Minimum reasonable price
          expect(price).toBeLessThan(10000000) // Maximum reasonable price
        }
      })
    })

    it('should sort suggestions by confidence', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions(mockFormData, mockContext)
      
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].confidence).toBeLessThanOrEqual(suggestions[i - 1].confidence)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty form data gracefully', () => {
      const suggestions = BusinessSuggestionsService.generateSuggestions({}, {})
      
      // Should still generate some suggestions, but fewer
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should handle unknown category gracefully', () => {
      const dataWithUnknownCategory = {
        category: 'UNKNOWN_CATEGORY' as any,
        revenue: 500000
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(
        dataWithUnknownCategory, 
        { category: 'UNKNOWN_CATEGORY' as any }
      )
      
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should handle invalid numeric values gracefully', () => {
      const dataWithInvalidNumbers = {
        category: 'RESTAURANT',
        revenue: -1000, // Negative revenue
        netMargin: 150 // Invalid percentage
      }
      
      const suggestions = BusinessSuggestionsService.generateSuggestions(
        dataWithInvalidNumbers, 
        { category: 'RESTAURANT' }
      )
      
      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })
})