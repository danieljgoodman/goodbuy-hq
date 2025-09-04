# Environment Configuration

Based on your existing Next.js deployment patterns and established environment management, I'm defining configuration requirements that support AI analysis processing, subscription billing integration, and professional reporting capabilities while maintaining security and scalability.

```bash
# .env.local - Local development environment
# Existing environment variables (preserved)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/goodbuy_hq_dev
REDIS_URL=redis://localhost:6379

# AI Analysis Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
AI_ANALYSIS_TIMEOUT_MS=30000
AI_CONCURRENT_ANALYSES_LIMIT=10
AI_STREAMING_HEARTBEAT_INTERVAL=5000

# WebSocket Configuration
WEBSOCKET_PORT=3001
WEBSOCKET_PATH=/ws
WEBSOCKET_CORS_ORIGIN=http://localhost:3000
WEBSOCKET_CONNECTION_TIMEOUT=30000
WEBSOCKET_MAX_CONNECTIONS=1000

# Subscription & Billing (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_PROFESSIONAL=price_your-professional-price-id
STRIPE_PRICE_ID_ENTERPRISE=price_your-enterprise-price-id

# Professional Reporting
REPORT_GENERATION_TIMEOUT_MS=60000
REPORT_STORAGE_BUCKET=goodbuy-reports-dev
REPORT_CDN_BASE_URL=https://dev-reports.goodbuy.com
PDF_GENERATION_MEMORY_LIMIT=512
EXCEL_EXPORT_MAX_ROWS=10000

# Feature Flags
FEATURE_AI_PORTFOLIO_ANALYSIS=true
FEATURE_BULK_ANALYSIS=true
FEATURE_WHITE_LABEL_REPORTS=true
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_BETA_AI_FORECASTING=false

# Rate Limiting
RATE_LIMIT_AI_ANALYSIS_PER_HOUR=50
RATE_LIMIT_REPORT_GENERATION_PER_HOUR=20
RATE_LIMIT_BULK_OPERATIONS_PER_DAY=10

# Monitoring & Analytics
ANALYTICS_API_KEY=your-analytics-api-key
ERROR_REPORTING_DSN=your-sentry-dsn
PERFORMANCE_MONITORING_SAMPLE_RATE=0.1
LOG_LEVEL=debug
```

## Configuration Management Patterns

```typescript
// /lib/config/env.ts - Environment configuration management
import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  // Base Next.js configuration
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),

  // AI Analysis Configuration
  OPENAI_API_KEY: z.string().min(1),
  AI_ANALYSIS_TIMEOUT_MS: z.coerce.number().default(30000),
  AI_CONCURRENT_ANALYSES_LIMIT: z.coerce.number().default(10),

  // WebSocket Configuration
  WEBSOCKET_PORT: z.coerce.number().default(3001),
  WEBSOCKET_MAX_CONNECTIONS: z.coerce.number().default(1000),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // Feature Flags
  FEATURE_AI_PORTFOLIO_ANALYSIS: z.coerce.boolean().default(false),
  FEATURE_BULK_ANALYSIS: z.coerce.boolean().default(false),
})

// Parse and validate environment variables
function createEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment configuration')
  }

  return parsed.data
}

// Export validated environment configuration
export const env = createEnv()
```

---
