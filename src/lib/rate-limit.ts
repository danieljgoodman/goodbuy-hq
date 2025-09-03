import { NextRequest } from 'next/server'
import { RateLimiterMemory } from 'rate-limiter-flexible'

interface RateLimitConfig {
  limit: number
  window: number // in milliseconds
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  success: boolean
  remaining?: number
  resetTime?: number
  error?: string
}

// Create rate limiters for different endpoints
const rateLimiters = new Map<string, RateLimiterMemory>()

function getRateLimiter(
  key: string,
  config: RateLimitConfig
): RateLimiterMemory {
  if (!rateLimiters.has(key)) {
    const limiter = new RateLimiterMemory({
      keyGenerator: (req?: any) => req?.ip || 'default',
      points: config.limit,
      duration: Math.ceil(config.window / 1000), // Convert to seconds
      execEvenly: true,
    })
    rateLimiters.set(key, limiter)
  }
  return rateLimiters.get(key)!
}

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (remoteAddr) {
    return remoteAddr
  }

  // Fallback to localhost for development
  return '127.0.0.1'
}

function generateRateLimitKey(request: NextRequest, endpoint?: string): string {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const pathName = new URL(request.url).pathname

  // Create a more specific key including endpoint if provided
  const keyParts = [ip]
  if (endpoint) {
    keyParts.push(endpoint)
  } else {
    keyParts.push(pathName)
  }

  return keyParts.join(':')
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  endpoint?: string
): Promise<RateLimitResult> {
  try {
    const key = generateRateLimitKey(request, endpoint)
    const limiter = getRateLimiter(endpoint || 'default', config)

    const result = await limiter.consume(key)

    return {
      success: true,
      remaining: result.remainingPoints,
      resetTime: result.msBeforeNext
        ? Date.now() + result.msBeforeNext
        : undefined,
    }
  } catch (rateLimiterRes) {
    // Rate limit exceeded
    const remaining = rateLimiterRes.remainingPoints || 0
    const resetTime = rateLimiterRes.msBeforeNext
      ? Date.now() + rateLimiterRes.msBeforeNext
      : Date.now() + config.window

    return {
      success: false,
      remaining: 0,
      resetTime,
      error: 'Rate limit exceeded',
    }
  }
}

// Predefined rate limiting configurations
export const RATE_LIMIT_CONFIGS = {
  // Health calculation endpoint (more restrictive)
  HEALTH_CALCULATION: {
    limit: 10,
    window: 60000, // 1 minute
  },

  // Standard API endpoints
  API_DEFAULT: {
    limit: 60,
    window: 60000, // 1 minute
  },

  // Data retrieval endpoints (more permissive)
  API_READ: {
    limit: 100,
    window: 60000, // 1 minute
  },

  // Authentication endpoints
  AUTH: {
    limit: 5,
    window: 60000, // 1 minute
  },

  // Upload endpoints
  UPLOAD: {
    limit: 20,
    window: 300000, // 5 minutes
  },
} as const

// Middleware helper function
export function createRateLimitMiddleware(
  config: RateLimitConfig,
  endpoint?: string
) {
  return async (request: NextRequest) => {
    return rateLimit(request, config, endpoint)
  }
}

// Get rate limit headers for response
export function getRateLimitHeaders(
  result: RateLimitResult,
  config: RateLimitConfig
) {
  const headers: Record<string, string> = {}

  headers['X-RateLimit-Limit'] = config.limit.toString()
  headers['X-RateLimit-Remaining'] = (result.remaining || 0).toString()

  if (result.resetTime) {
    headers['X-RateLimit-Reset'] = new Date(result.resetTime).toISOString()
  }

  return headers
}

// Reset rate limit for a specific key (admin use)
export async function resetRateLimit(
  request: NextRequest,
  endpoint?: string
): Promise<void> {
  const key = generateRateLimitKey(request, endpoint)
  const limiter = rateLimiters.get(endpoint || 'default')

  if (limiter) {
    await limiter.delete(key)
  }
}
