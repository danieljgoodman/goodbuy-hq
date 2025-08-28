import { openaiService } from './openai'
import type { BusinessData } from '@/types/business'

export interface BusinessAnalysis {
  financialHealth: {
    score: number
    trends: string[]
    strengths: string[]
    concerns: string[]
  }
  marketPosition: {
    competitiveness: number
    marketShare: string
    differentiators: string[]
    threats: string[]
  }
  growthPotential: {
    score: number
    opportunities: string[]
    scalability: string
    timeline: string
  }
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  summary: string
}

export class BusinessAnalysisAgent {
  private createAnalysisPrompt(businessData: BusinessData): string {
    return `
You are an expert business analyst with 20+ years of experience in business valuation, market analysis, and strategic planning. Analyze the following business comprehensively and provide actionable insights.

BUSINESS DATA:
- Name: ${businessData.businessName}
- Industry: ${businessData.industry}
- Description: ${businessData.description}
- Annual Revenue: $${businessData.annualRevenue?.toLocaleString() || 'Not provided'}
- Monthly Expenses: $${businessData.monthlyExpenses?.toLocaleString() || 'Not provided'}
- Number of Employees: ${businessData.employees || 'Not provided'}
- Years in Operation: ${businessData.yearsInOperation || 'Not provided'}
- Location: ${businessData.location || 'Not provided'}
- Business Type: ${businessData.businessType || 'Not provided'}
- Assets: $${businessData.assets?.toLocaleString() || 'Not provided'}
- Liabilities: $${businessData.liabilities?.toLocaleString() || 'Not provided'}

ANALYSIS REQUIREMENTS:
Provide a comprehensive analysis in valid JSON format with the following structure:

{
  "financialHealth": {
    "score": [0-100 numerical score],
    "trends": [array of key financial trends],
    "strengths": [array of financial strengths],
    "concerns": [array of financial concerns or red flags]
  },
  "marketPosition": {
    "competitiveness": [0-100 numerical score],
    "marketShare": "[description of estimated market position]",
    "differentiators": [array of competitive advantages],
    "threats": [array of competitive threats]
  },
  "growthPotential": {
    "score": [0-100 numerical score],
    "opportunities": [array of growth opportunities],
    "scalability": "[assessment of scalability potential]",
    "timeline": "[realistic timeline for growth milestones]"
  },
  "riskAssessment": {
    "level": "[low/medium/high]",
    "factors": [array of risk factors],
    "mitigation": [array of risk mitigation strategies]
  },
  "recommendations": {
    "immediate": [array of actions to take within 30 days],
    "shortTerm": [array of actions for 3-12 months],
    "longTerm": [array of strategic initiatives for 1-3 years]
  },
  "summary": "[2-3 sentence executive summary of the business analysis]"
}

ANALYSIS GUIDELINES:
1. Be data-driven and objective in your assessment
2. Consider industry-specific factors and benchmarks
3. Account for current market conditions and economic factors
4. Provide specific, actionable recommendations
5. Use professional business terminology
6. Be realistic but constructive in your analysis
7. If data is limited, clearly state assumptions made

Respond ONLY with valid JSON - no additional text or formatting.
    `.trim()
  }

  private createEnhancementPrompt(description: string): string {
    return `
You are a professional business copywriter and strategist. Enhance the following business description to be more compelling, professional, and market-focused.

ORIGINAL DESCRIPTION:
"${description}"

ENHANCEMENT REQUIREMENTS:
1. Make it more compelling and professional
2. Highlight unique value propositions
3. Include target market insights
4. Emphasize competitive advantages
5. Use industry-appropriate terminology
6. Maintain authenticity and accuracy
7. Keep it concise but impactful (2-4 sentences)

RESPOND WITH:
Enhanced description only - no additional formatting or explanation.
    `.trim()
  }

  async analyzeBusinessComprehensively(
    businessData: BusinessData
  ): Promise<BusinessAnalysis> {
    try {
      const prompt = this.createAnalysisPrompt(businessData)

      const response = await openaiService.generateCompletion(prompt, {
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3,
      })

      const content =
        typeof response === 'object' && 'choices' in response
          ? response.choices[0]?.message?.content
          : ''

      if (!content) {
        throw new Error('No analysis content received from AI')
      }

      try {
        return JSON.parse(content) as BusinessAnalysis
      } catch (parseError) {
        console.error('Failed to parse AI response:', content)
        throw new Error('Invalid analysis format received from AI')
      }
    } catch (error) {
      console.error('Business analysis failed:', error)

      return this.getFallbackAnalysis(businessData)
    }
  }

  async enhanceBusinessDescription(description: string): Promise<string> {
    try {
      const prompt = this.createEnhancementPrompt(description)

      const response = await openaiService.generateCompletion(prompt, {
        model: 'gpt-4',
        maxTokens: 300,
        temperature: 0.7,
      })

      const enhancedDescription =
        typeof response === 'object' && 'choices' in response
          ? response.choices[0]?.message?.content?.trim()
          : ''

      return enhancedDescription || description
    } catch (error) {
      console.error('Description enhancement failed:', error)
      return description
    }
  }

  async streamBusinessAnalysis(
    businessData: BusinessData,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const prompt = this.createAnalysisPrompt(businessData)

      const stream = await openaiService.generateStreamingCompletion(prompt, {
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          onChunk(content)
        }
      }
    } catch (error) {
      console.error('Streaming analysis failed:', error)
      onChunk('Analysis failed. Please try again.')
    }
  }

  private getFallbackAnalysis(businessData: BusinessData): BusinessAnalysis {
    const hasRevenue =
      businessData.annualRevenue && businessData.annualRevenue > 0
    const hasExpenses =
      businessData.monthlyExpenses && businessData.monthlyExpenses > 0

    return {
      financialHealth: {
        score: hasRevenue ? 65 : 40,
        trends: hasRevenue
          ? ['Revenue data available for analysis']
          : ['Limited financial data available'],
        strengths: hasRevenue
          ? ['Generating revenue']
          : ['Business concept established'],
        concerns: ['Limited data available for comprehensive analysis'],
      },
      marketPosition: {
        competitiveness: 50,
        marketShare: 'Unable to determine without additional market data',
        differentiators: ['Requires detailed market research'],
        threats: ['Competitive analysis needed'],
      },
      growthPotential: {
        score: 50,
        opportunities: ['Market research needed to identify opportunities'],
        scalability: 'Assessment requires more detailed business information',
        timeline: 'Timeline depends on market conditions and execution',
      },
      riskAssessment: {
        level: 'medium' as const,
        factors: ['Limited data for comprehensive risk assessment'],
        mitigation: ['Gather more detailed business and market data'],
      },
      recommendations: {
        immediate: [
          'Collect comprehensive business metrics',
          'Conduct market research',
        ],
        shortTerm: [
          'Develop detailed business plan',
          'Analyze competitive landscape',
        ],
        longTerm: ['Strategic planning based on market insights'],
      },
      summary:
        'Analysis limited by available data. Recommend gathering comprehensive business metrics and market research for detailed evaluation.',
    }
  }
}

export const businessAnalysisAgent = new BusinessAnalysisAgent()
