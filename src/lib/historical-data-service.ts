import { BusinessFormData } from '@/lib/validation/business-form-schema'

export interface HistoricalDataPattern {
  id: string
  userId: string
  fieldName: keyof BusinessFormData
  value: any
  frequency: number
  lastUsed: Date
  context: {
    category?: string
    businessSize?: 'small' | 'medium' | 'large'
    location?: string
    similarFields?: Record<string, any>
  }
  confidence: number
}

export interface PrePopulationSuggestion {
  field: keyof BusinessFormData
  value: any
  reason: string
  confidence: number
  source: 'user_history' | 'similar_business' | 'pattern_analysis'
  metadata?: Record<string, any>
}

export interface UserBusinessProfile {
  userId: string
  primaryCategories: string[]
  typicalBusinessSize: 'small' | 'medium' | 'large'
  commonLocations: string[]
  averageValues: Record<keyof BusinessFormData, any>
  patterns: HistoricalDataPattern[]
  lastAnalyzed: Date
}

// Mock historical data storage - in production this would be a database
class HistoricalDataStorage {
  private static patterns: Map<string, HistoricalDataPattern[]> = new Map()
  private static userProfiles: Map<string, UserBusinessProfile> = new Map()

  static getUserPatterns(userId: string): HistoricalDataPattern[] {
    return this.patterns.get(userId) || []
  }

  static getUserProfile(userId: string): UserBusinessProfile | null {
    return this.userProfiles.get(userId) || null
  }

  static savePattern(pattern: HistoricalDataPattern): void {
    const userPatterns = this.patterns.get(pattern.userId) || []
    const existingIndex = userPatterns.findIndex(
      p =>
        p.fieldName === pattern.fieldName &&
        JSON.stringify(p.value) === JSON.stringify(pattern.value)
    )

    if (existingIndex >= 0) {
      userPatterns[existingIndex].frequency += 1
      userPatterns[existingIndex].lastUsed = new Date()
    } else {
      userPatterns.push(pattern)
    }

    this.patterns.set(pattern.userId, userPatterns)
  }

  static saveProfile(profile: UserBusinessProfile): void {
    this.userProfiles.set(profile.userId, profile)
  }

  static clearUserData(userId: string): void {
    this.patterns.delete(userId)
    this.userProfiles.delete(userId)
  }

  // Mock data for demonstration
  static initializeMockData() {
    const mockUserId = 'user-123'

    // Mock historical patterns
    const mockPatterns: HistoricalDataPattern[] = [
      {
        id: '1',
        userId: mockUserId,
        fieldName: 'category',
        value: 'RESTAURANT',
        frequency: 3,
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        context: { businessSize: 'small' },
        confidence: 0.8,
      },
      {
        id: '2',
        userId: mockUserId,
        fieldName: 'city',
        value: 'Seattle',
        frequency: 5,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        context: {},
        confidence: 0.9,
      },
      {
        id: '3',
        userId: mockUserId,
        fieldName: 'state',
        value: 'WA',
        frequency: 5,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        context: { location: 'Seattle' },
        confidence: 0.9,
      },
      {
        id: '4',
        userId: mockUserId,
        fieldName: 'listingType',
        value: 'BUSINESS_SALE',
        frequency: 4,
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        context: {},
        confidence: 0.7,
      },
    ]

    // Mock user profile
    const mockProfile: UserBusinessProfile = {
      userId: mockUserId,
      primaryCategories: ['RESTAURANT', 'RETAIL'],
      typicalBusinessSize: 'small',
      commonLocations: ['Seattle', 'Portland'],
      averageValues: {
        revenue: 250000,
        profit: 45000,
        employees: 8,
        established: 2015,
      } as any,
      patterns: mockPatterns,
      lastAnalyzed: new Date(),
    }

    this.patterns.set(mockUserId, mockPatterns)
    this.userProfiles.set(mockUserId, mockProfile)
  }
}

// Initialize mock data
HistoricalDataStorage.initializeMockData()

export class HistoricalDataService {
  private static readonly CONFIDENCE_THRESHOLD = 0.3
  private static readonly RECENT_USAGE_BONUS = 0.1
  private static readonly FREQUENCY_WEIGHT = 0.4

  // Generate pre-population suggestions based on user history
  static async getPrePopulationSuggestions(
    userId: string,
    currentData: Partial<BusinessFormData>,
    context: {
      category?: string
      location?: string
      businessSize?: 'small' | 'medium' | 'large'
    } = {}
  ): Promise<PrePopulationSuggestion[]> {
    const suggestions: PrePopulationSuggestion[] = []

    // Get user's historical patterns
    const userPatterns = HistoricalDataStorage.getUserPatterns(userId)
    const userProfile = HistoricalDataStorage.getUserProfile(userId)

    if (userPatterns.length === 0) {
      return suggestions
    }

    // Generate suggestions from user patterns
    suggestions.push(
      ...this.generatePatternBasedSuggestions(
        userPatterns,
        currentData,
        context
      )
    )

    // Generate suggestions from user profile
    if (userProfile) {
      suggestions.push(
        ...this.generateProfileBasedSuggestions(
          userProfile,
          currentData,
          context
        )
      )
    }

    // Generate contextual suggestions
    suggestions.push(
      ...this.generateContextualSuggestions(userPatterns, currentData, context)
    )

    // Sort by confidence and filter
    return suggestions
      .filter(s => s.confidence >= this.CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10) // Limit to top 10 suggestions
  }

  // Generate suggestions based on historical patterns
  private static generatePatternBasedSuggestions(
    patterns: HistoricalDataPattern[],
    currentData: Partial<BusinessFormData>,
    context: any
  ): PrePopulationSuggestion[] {
    const suggestions: PrePopulationSuggestion[] = []

    // Group patterns by field
    const patternsByField = patterns.reduce(
      (acc, pattern) => {
        if (!acc[pattern.fieldName]) {
          acc[pattern.fieldName] = []
        }
        acc[pattern.fieldName].push(pattern)
        return acc
      },
      {} as Record<keyof BusinessFormData, HistoricalDataPattern[]>
    )

    // Generate suggestions for each field
    Object.entries(patternsByField).forEach(([fieldName, fieldPatterns]) => {
      const field = fieldName as keyof BusinessFormData

      // Skip if field is already populated
      if (currentData[field] && currentData[field] !== '') {
        return
      }

      // Find the most relevant pattern
      const mostRelevant = this.findMostRelevantPattern(fieldPatterns, context)

      if (mostRelevant) {
        const confidence = this.calculatePatternConfidence(mostRelevant)

        suggestions.push({
          field,
          value: mostRelevant.value,
          reason: this.generatePatternReason(mostRelevant),
          confidence,
          source: 'user_history',
          metadata: {
            frequency: mostRelevant.frequency,
            lastUsed: mostRelevant.lastUsed,
            context: mostRelevant.context,
          },
        })
      }
    })

    return suggestions
  }

  // Generate suggestions based on user profile
  private static generateProfileBasedSuggestions(
    profile: UserBusinessProfile,
    currentData: Partial<BusinessFormData>,
    context: any
  ): PrePopulationSuggestion[] {
    const suggestions: PrePopulationSuggestion[] = []

    // Suggest primary category if not set
    if (!currentData.category && profile.primaryCategories.length > 0) {
      suggestions.push({
        field: 'category',
        value: profile.primaryCategories[0],
        reason: `You frequently list ${profile.primaryCategories[0].toLowerCase()} businesses`,
        confidence: 0.6,
        source: 'user_history',
        metadata: { categories: profile.primaryCategories },
      })
    }

    // Suggest common location if not set
    if (!currentData.city && profile.commonLocations.length > 0) {
      const location = profile.commonLocations[0]
      suggestions.push({
        field: 'city',
        value: location,
        reason: `You frequently list businesses in ${location}`,
        confidence: 0.5,
        source: 'user_history',
        metadata: { locations: profile.commonLocations },
      })
    }

    // Suggest average values for financial fields
    Object.entries(profile.averageValues).forEach(([fieldName, avgValue]) => {
      const field = fieldName as keyof BusinessFormData

      if (!currentData[field] && avgValue !== null && avgValue !== undefined) {
        suggestions.push({
          field,
          value: avgValue,
          reason: `Based on your typical business values`,
          confidence: 0.4,
          source: 'pattern_analysis',
          metadata: { isAverage: true, profileBased: true },
        })
      }
    })

    return suggestions
  }

  // Generate contextual suggestions based on current form data
  private static generateContextualSuggestions(
    patterns: HistoricalDataPattern[],
    currentData: Partial<BusinessFormData>,
    context: any
  ): PrePopulationSuggestion[] {
    const suggestions: PrePopulationSuggestion[] = []

    // If category is selected, suggest related fields from patterns
    if (currentData.category) {
      const categoryPatterns = patterns.filter(
        p =>
          p.context.category === currentData.category ||
          (p.fieldName === 'category' && p.value === currentData.category)
      )

      categoryPatterns.forEach(pattern => {
        if (
          pattern.fieldName !== 'category' &&
          (!currentData[pattern.fieldName] ||
            currentData[pattern.fieldName] === '')
        ) {
          const confidence = this.calculatePatternConfidence(pattern) * 0.8 // Reduced for contextual

          suggestions.push({
            field: pattern.fieldName,
            value: pattern.value,
            reason: `Commonly used with ${currentData.category} businesses`,
            confidence,
            source: 'pattern_analysis',
            metadata: { contextual: true, basedOn: 'category' },
          })
        }
      })
    }

    // If location is set, suggest related location fields
    if (currentData.city) {
      const locationPatterns = patterns.filter(
        p =>
          p.context.location === currentData.city ||
          (p.fieldName === 'city' && p.value === currentData.city)
      )

      locationPatterns.forEach(pattern => {
        if (
          ['state', 'zipCode'].includes(pattern.fieldName) &&
          (!currentData[pattern.fieldName] ||
            currentData[pattern.fieldName] === '')
        ) {
          suggestions.push({
            field: pattern.fieldName,
            value: pattern.value,
            reason: `Typically used with ${currentData.city} location`,
            confidence: 0.7,
            source: 'pattern_analysis',
            metadata: { contextual: true, basedOn: 'location' },
          })
        }
      })
    }

    return suggestions
  }

  // Find the most relevant pattern for a field
  private static findMostRelevantPattern(
    patterns: HistoricalDataPattern[],
    context: any
  ): HistoricalDataPattern | null {
    if (patterns.length === 0) return null

    // Score patterns based on relevance
    const scoredPatterns = patterns.map(pattern => ({
      pattern,
      score: this.calculateRelevanceScore(pattern, context),
    }))

    // Return the highest scoring pattern
    scoredPatterns.sort((a, b) => b.score - a.score)
    return scoredPatterns[0].pattern
  }

  // Calculate relevance score for a pattern
  private static calculateRelevanceScore(
    pattern: HistoricalDataPattern,
    context: any
  ): number {
    let score = 0

    // Base score from frequency
    score += pattern.frequency * this.FREQUENCY_WEIGHT

    // Bonus for recent usage
    const daysSinceUsed =
      (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUsed < 7) {
      score += (this.RECENT_USAGE_BONUS * (7 - daysSinceUsed)) / 7
    }

    // Context matching bonus
    if (context.category && pattern.context.category === context.category) {
      score += 0.3
    }

    if (context.location && pattern.context.location === context.location) {
      score += 0.2
    }

    if (
      context.businessSize &&
      pattern.context.businessSize === context.businessSize
    ) {
      score += 0.1
    }

    return score
  }

  // Calculate confidence for a pattern
  private static calculatePatternConfidence(
    pattern: HistoricalDataPattern
  ): number {
    let confidence = pattern.confidence

    // Boost confidence based on frequency
    confidence += Math.min(0.2, pattern.frequency * 0.05)

    // Boost confidence for recent usage
    const daysSinceUsed =
      (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUsed < 30) {
      confidence += (0.1 * (30 - daysSinceUsed)) / 30
    }

    return Math.min(1, confidence)
  }

  // Generate human-readable reason for pattern suggestion
  private static generatePatternReason(pattern: HistoricalDataPattern): string {
    const timesUsed =
      pattern.frequency === 1 ? 'once' : `${pattern.frequency} times`
    const daysSinceUsed = Math.floor(
      (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    )

    let timeDesc = ''
    if (daysSinceUsed === 0) {
      timeDesc = 'today'
    } else if (daysSinceUsed === 1) {
      timeDesc = 'yesterday'
    } else if (daysSinceUsed < 7) {
      timeDesc = `${daysSinceUsed} days ago`
    } else if (daysSinceUsed < 30) {
      timeDesc = `${Math.floor(daysSinceUsed / 7)} weeks ago`
    } else {
      timeDesc = 'recently'
    }

    return `You've used this ${timesUsed} (last used ${timeDesc})`
  }

  // Record user input for future suggestions
  static async recordUserInput(
    userId: string,
    fieldName: keyof BusinessFormData,
    value: any,
    context: {
      category?: string
      location?: string
      businessSize?: 'small' | 'medium' | 'large'
      similarFields?: Record<string, any>
    } = {}
  ): Promise<void> {
    if (!value || value === '') return

    const pattern: HistoricalDataPattern = {
      id: `${userId}-${fieldName}-${Date.now()}`,
      userId,
      fieldName,
      value,
      frequency: 1,
      lastUsed: new Date(),
      context,
      confidence: 0.5, // Base confidence for new patterns
    }

    HistoricalDataStorage.savePattern(pattern)

    // Update user profile
    await this.updateUserProfile(userId, fieldName, value, context)
  }

  // Update user profile based on input
  private static async updateUserProfile(
    userId: string,
    fieldName: keyof BusinessFormData,
    value: any,
    context: any
  ): Promise<void> {
    let profile = HistoricalDataStorage.getUserProfile(userId)

    if (!profile) {
      profile = {
        userId,
        primaryCategories: [],
        typicalBusinessSize: 'small',
        commonLocations: [],
        averageValues: {} as any,
        patterns: [],
        lastAnalyzed: new Date(),
      }
    }

    // Update categories
    if (fieldName === 'category' && typeof value === 'string') {
      if (!profile.primaryCategories.includes(value)) {
        profile.primaryCategories.unshift(value)
        profile.primaryCategories = profile.primaryCategories.slice(0, 3) // Keep top 3
      }
    }

    // Update locations
    if (fieldName === 'city' && typeof value === 'string') {
      if (!profile.commonLocations.includes(value)) {
        profile.commonLocations.unshift(value)
        profile.commonLocations = profile.commonLocations.slice(0, 5) // Keep top 5
      }
    }

    // Update average values for numerical fields
    const numericalFields = [
      'revenue',
      'profit',
      'askingPrice',
      'employees',
      'established',
    ]
    if (numericalFields.includes(fieldName) && typeof value === 'number') {
      const currentAvg = profile.averageValues[fieldName] || 0
      const patterns = HistoricalDataStorage.getUserPatterns(userId)
      const fieldPatterns = patterns.filter(p => p.fieldName === fieldName)

      if (fieldPatterns.length > 0) {
        const sum = fieldPatterns.reduce(
          (acc, p) => acc + (Number(p.value) || 0),
          0
        )
        profile.averageValues[fieldName] = Math.round(
          sum / fieldPatterns.length
        )
      } else {
        profile.averageValues[fieldName] = value
      }
    }

    profile.lastAnalyzed = new Date()
    HistoricalDataStorage.saveProfile(profile)
  }

  // Clear user's historical data
  static async clearUserHistory(userId: string): Promise<void> {
    HistoricalDataStorage.clearUserData(userId)
  }

  // Get user's data patterns for analysis
  static async getUserDataAnalytics(userId: string): Promise<{
    totalPatterns: number
    mostUsedFields: Array<{ field: keyof BusinessFormData; frequency: number }>
    recentActivity: HistoricalDataPattern[]
    categories: string[]
    locations: string[]
  }> {
    const patterns = HistoricalDataStorage.getUserPatterns(userId)
    const profile = HistoricalDataStorage.getUserProfile(userId)

    // Count field usage
    const fieldCounts = patterns.reduce(
      (acc, pattern) => {
        acc[pattern.fieldName] =
          (acc[pattern.fieldName] || 0) + pattern.frequency
        return acc
      },
      {} as Record<keyof BusinessFormData, number>
    )

    const mostUsedFields = Object.entries(fieldCounts)
      .map(([field, frequency]) => ({
        field: field as keyof BusinessFormData,
        frequency,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentActivity = patterns
      .filter(p => p.lastUsed > thirtyDaysAgo)
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 10)

    return {
      totalPatterns: patterns.length,
      mostUsedFields,
      recentActivity,
      categories: profile?.primaryCategories || [],
      locations: profile?.commonLocations || [],
    }
  }
}
