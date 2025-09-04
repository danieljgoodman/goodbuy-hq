import OpenAI from 'openai'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import pRetry, { AbortError } from 'p-retry'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

export class OpenAIService {
  private openai: OpenAI
  private rateLimiter: RateLimiterMemory
  private costTracker: { totalTokens: number; estimatedCost: number }

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.rateLimiter = new RateLimiterMemory({
      points: 10,
      duration: 60,
    })

    this.costTracker = {
      totalTokens: 0,
      estimatedCost: 0,
    }
  }

  async checkRateLimit(): Promise<void> {
    try {
      await this.rateLimiter.consume('openai-api')
    } catch (error) {
      logger.warn('Rate limit exceeded', { error })
      throw new Error('Rate limit exceeded. Please try again later.')
    }
  }

  calculateCost(tokens: number, model: string = 'gpt-4'): number {
    const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002
    return tokens * costPerToken
  }

  updateCostTracker(tokens: number, model: string): void {
    const cost = this.calculateCost(tokens, model)
    this.costTracker.totalTokens += tokens
    this.costTracker.estimatedCost += cost

    logger.info('API usage updated', {
      tokens,
      cost,
      totalTokens: this.costTracker.totalTokens,
      totalCost: this.costTracker.estimatedCost,
    })
  }

  getCostSummary() {
    return this.costTracker
  }

  async retryableRequest<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return pRetry(
      async () => {
        try {
          await this.checkRateLimit()
          return await operation()
        } catch (error: any) {
          logger.error(`OpenAI API error in ${context}`, {
            error: error.message,
            status: error.status,
            type: error.type,
          })

          if (error.status === 429) {
            throw new Error('Rate limit exceeded')
          }
          if (error.status >= 500) {
            throw error
          }

          throw new AbortError(error.message)
        }
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
        onFailedAttempt: error => {
          logger.warn(`Retry attempt ${error.attemptNumber} failed`, {
            context,
            error: error.retriesLeft,
          })
        },
      }
    )
  }

  async generateCompletion(
    prompt: string,
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
      stream?: boolean
    } = {}
  ) {
    const {
      model = 'gpt-4',
      maxTokens = 1000,
      temperature = 0.7,
      stream = false,
    } = options

    return this.retryableRequest(async () => {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        stream,
      })

      if (!stream && 'usage' in response) {
        const tokens = response.usage?.total_tokens || 0
        this.updateCostTracker(tokens, model)
      }

      return response
    }, 'generateCompletion')
  }

  async generateStreamingCompletion(
    prompt: string,
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
    } = {}
  ) {
    const { model = 'gpt-4', maxTokens = 1000, temperature = 0.7 } = options

    return this.retryableRequest(async () => {
      const stream = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      })

      return stream
    }, 'generateStreamingCompletion')
  }
}

export const openaiService = new OpenAIService()
