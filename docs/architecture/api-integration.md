# API Integration

Based on your existing Next.js API routes and established patterns, I'm defining API integration approaches that extend current architecture while supporting AI analysis streaming, subscription management, and professional reporting capabilities.

## Service Template

```typescript
// /lib/services/ai-analysis-service.ts
import { z } from 'zod'

// API client configuration building on existing patterns
class AIAnalysisService {
  private baseUrl = '/api/ai'
  private wsBaseUrl =
    process.env.NODE_ENV === 'production'
      ? 'wss://your-domain.com/ws'
      : 'ws://localhost:3000/ws'

  // Analysis request validation using existing Zod patterns
  private analyzeRequestSchema = z.object({
    businessId: z.string().uuid(),
    analysisType: z.enum(['health', 'valuation', 'forecast', 'comprehensive']),
    options: z
      .object({
        includeConfidence: z.boolean().default(true),
        streamProgress: z.boolean().default(true),
        priority: z.enum(['normal', 'high']).default('normal'),
      })
      .optional(),
  })

  // Start AI analysis with streaming support
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisSession> {
    try {
      // Validate request using existing validation patterns
      const validatedRequest = this.analyzeRequestSchema.parse(request)

      // API call following existing error handling patterns
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(validatedRequest),
      })

      if (!response.ok) {
        throw new APIError(
          `Analysis failed: ${response.status}`,
          response.status,
          await response.text()
        )
      }

      const session = await response.json()

      // Return session with WebSocket URL for streaming
      return {
        ...session,
        streamUrl: `${this.wsBaseUrl}/analysis/${session.sessionId}`,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid analysis request', error.errors)
      }
      throw error
    }
  }

  // WebSocket streaming client for real-time updates
  createStreamingClient(sessionId: string): StreamingClient {
    return new StreamingClient(`${this.wsBaseUrl}/analysis/${sessionId}`)
  }

  // Authentication token retrieval (integrating with existing NextAuth)
  private async getAuthToken(): Promise<string> {
    const session = await fetch('/api/auth/session').then(r => r.json())
    if (!session?.accessToken) {
      throw new AuthError('Authentication required')
    }
    return session.accessToken
  }
}

// Streaming client for real-time progress updates
class StreamingClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 1000

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onerror = error => {
          console.error('WebSocket error:', error)
          reject(new Error('Failed to establish streaming connection'))
        }

        this.ws.onclose = event => {
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            setTimeout(() => {
              this.reconnectAttempts++
              this.connect()
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  onProgress(callback: (progress: ProgressUpdate) => void): void {
    if (!this.ws) throw new Error('WebSocket not connected')

    this.ws.onmessage = event => {
      try {
        const progress = JSON.parse(event.data) as ProgressUpdate
        callback(progress)
      } catch (error) {
        console.error('Failed to parse progress update:', error)
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }
}

// Export configured service instances
export const aiAnalysisService = new AIAnalysisService()

// Custom errors for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: z.ZodIssue[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
```

## API Client Configuration

```typescript
// /lib/api-client.ts
import { z } from 'zod'

// HTTP client configuration extending existing patterns
export class APIClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Generic request method with error handling
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Add authentication header from existing NextAuth session
    const authHeaders = await this.getAuthHeaders()

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Handle authentication errors
      if (response.status === 401) {
        // Trigger re-authentication using existing patterns
        window.location.href = '/api/auth/signin'
        throw new AuthError('Authentication required')
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        throw new RateLimitError(
          'Rate limit exceeded',
          parseInt(retryAfter || '60')
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new APIError(
          errorData?.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthError) {
        throw error
      }
      throw new APIError('Network error', 0, error)
    }
  }

  // Authentication header integration with NextAuth
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const session = await fetch('/api/auth/session').then(r => r.json())
      return session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}
    } catch {
      return {}
    }
  }
}

// Export configured client instance
export const apiClient = new APIClient()

// Custom error classes
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}
```

---
