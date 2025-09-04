# External Service Setup Procedures

## Overview

This document provides comprehensive procedures for setting up and integrating external services required for the GoodBuy HQ AI SaaS platform enhancement, including account creation, API integration, fallback strategies, and security considerations.

## 1. Stripe Payment Processing Integration

### Account Setup Requirements

#### 1.1 Stripe Account Creation

**Responsible Party**: Business Owner/Admin (Human-only task)

**Steps**:

1. Visit [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create business account with the following information:
   - Business name: "GoodBuy HQ"
   - Business type: "Software/SaaS"
   - Country: United States (or applicable jurisdiction)
   - Business structure: (Appropriate legal structure)
3. Complete business verification process
4. Set up bank account for payouts
5. Configure tax settings and compliance requirements

**Timeline**: 2-7 business days for verification

#### 1.2 API Key Configuration

**Responsible Party**: Developer/Admin

**Development Environment**:

```bash
# Add to .env.local (development)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Production Environment**:

```bash
# Add to production environment variables
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 1.3 Product and Pricing Setup

**Responsible Party**: Product Owner/Admin

**Required Products**:

```javascript
// Subscription plans to create in Stripe Dashboard
const SUBSCRIPTION_PLANS = [
  {
    name: 'Free Tier',
    price: 0,
    interval: 'month',
    features: ['5 AI Analyses/month', 'Basic Reports', 'Email Support'],
    stripePriceId: 'price_free_tier',
  },
  {
    name: 'Professional',
    price: 29.99,
    interval: 'month',
    features: [
      '100 AI Analyses/month',
      'Professional Reports',
      'Portfolio Management',
      'Priority Support',
    ],
    stripePriceId: 'price_professional_monthly',
  },
  {
    name: 'Enterprise',
    price: 99.99,
    interval: 'month',
    features: [
      'Unlimited AI Analyses',
      'White-label Reports',
      'Bulk Analysis',
      'Dedicated Support',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
]
```

#### 1.4 Webhook Configuration

**Endpoints to Configure**:

```
Production: https://goodbuyhq.com/api/webhooks/stripe
Development: https://your-ngrok-url.ngrok.io/api/webhooks/stripe
```

**Required Events**:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

### Integration Implementation

#### 1.5 Stripe Client Setup

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const getStripeCustomerId = async (userId: string): Promise<string> => {
  // Implementation for getting/creating Stripe customer
}
```

#### 1.6 Subscription Management API

```typescript
// src/app/api/subscriptions/route.ts
export async function POST(request: Request) {
  // Create subscription
  // Update user subscription in database
  // Return success response
}

export async function PUT(request: Request) {
  // Update subscription
  // Sync with database
  // Return updated subscription
}
```

### Fallback Strategies

#### 1.7 Payment Processing Failures

**Level 1: Retry Logic**

```typescript
const createSubscription = async (customerId: string, priceId: string) => {
  let retries = 3
  while (retries > 0) {
    try {
      return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      })
    } catch (error) {
      retries--
      if (retries === 0) throw error
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

**Level 2: Graceful Degradation**

- Allow users to continue with Free tier if payment fails
- Store payment intent for retry later
- Notify admin of payment processing issues

**Level 3: Manual Processing**

- Provide manual payment collection process
- Admin dashboard for manual subscription management
- Customer service integration for billing issues

## 2. OpenAI API Integration (Existing - Enhance)

### Current Integration Status

**Status**: ✅ Already Implemented
**File**: `src/lib/openai.ts`
**Configuration**: Already set up with API keys

### Enhancement Requirements

#### 2.1 Usage Tracking Integration

```typescript
// Enhance existing OpenAI calls with usage tracking
export const analyzeBusinessWithUsageTracking = async (
  businessData: BusinessData,
  userId: string
) => {
  // Check user subscription and remaining credits
  const subscription = await getUserSubscription(userId)
  if (!hasRemainingCredits(subscription)) {
    throw new Error('Insufficient AI analysis credits')
  }

  // Perform existing AI analysis
  const result = await performAIAnalysis(businessData)

  // Track usage
  await trackAIUsage(userId, 'business_analysis', 1)

  return result
}
```

#### 2.2 Rate Limiting by Subscription Tier

```typescript
const RATE_LIMITS = {
  FREE: { requests: 5, window: '1h' },
  PROFESSIONAL: { requests: 100, window: '1h' },
  ENTERPRISE: { requests: 1000, window: '1h' },
}
```

### Fallback Strategies

#### 2.3 OpenAI API Failures

**Level 1: Automatic Retry**

- Retry with exponential backoff
- Switch to backup OpenAI account if available

**Level 2: Alternative AI Services**

```typescript
// Fallback to alternative AI services
const AI_SERVICES = [
  { provider: 'openai', priority: 1 },
  { provider: 'anthropic', priority: 2 },
  { provider: 'local-model', priority: 3 },
]
```

**Level 3: Cached/Pre-computed Results**

- Return similar analysis results from cache
- Provide basic analysis without AI enhancement

## 3. Email Service Integration (Existing - Enhance)

### Current Integration Status

**Status**: ✅ Already Implemented
**Files**: `src/lib/email.ts`, email templates
**Providers**: AWS SES, SendGrid support already configured

### Enhancement Requirements

#### 3.1 Subscription-Related Email Templates

**New Templates Required**:

- Welcome to subscription tier
- Payment confirmation
- Subscription upgrade/downgrade
- Usage quota warnings
- Billing failure notifications
- Subscription cancellation confirmation

#### 3.2 Email Template Implementation

```typescript
// src/lib/email-templates/subscription.ts
export const subscriptionWelcomeTemplate = (
  userData: User,
  planName: string
) => ({
  subject: `Welcome to GoodBuy HQ ${planName}!`,
  html: `
    <h1>Welcome to ${planName}</h1>
    <p>Thank you for subscribing to GoodBuy HQ ${planName}!</p>
    <!-- Template content -->
  `,
  text: `Welcome to ${planName}...`,
})
```

## 4. File Storage Service (AWS S3 - Existing)

### Current Integration Status

**Status**: ✅ Already Implemented
**Files**: AWS S3 client configuration
**Usage**: Business document uploads, image storage

### Enhancement Requirements

#### 4.1 Professional Report Storage

```typescript
// Enhanced S3 configuration for reports
const S3_BUCKETS = {
  BUSINESS_DOCUMENTS: 'goodbuy-hq-documents',
  PROFESSIONAL_REPORTS: 'goodbuy-hq-reports', // NEW
  USER_UPLOADS: 'goodbuy-hq-uploads',
}

export const uploadProfessionalReport = async (
  userId: string,
  reportBuffer: Buffer,
  metadata: ReportMetadata
) => {
  // Upload with subscription tier-based retention policies
}
```

#### 4.2 Storage Quota Management

```typescript
const STORAGE_QUOTAS = {
  FREE: 100 * 1024 * 1024, // 100 MB
  PROFESSIONAL: 1024 * 1024 * 1024, // 1 GB
  ENTERPRISE: 10 * 1024 * 1024 * 1024, // 10 GB
}
```

## 5. Monitoring and Analytics Services

### 5.1 Application Performance Monitoring (APM)

**Recommended Services**: Vercel Analytics (if using Vercel), DataDog, New Relic

**Setup Requirements**:

```bash
# Environment variables
VERCEL_ANALYTICS_ID=your_analytics_id
DATADOG_API_KEY=your_datadog_key (if using DataDog)
```

#### Implementation

```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'

export const trackSubscriptionEvent = (event: string, properties: any) => {
  // Track subscription-related events
  analytics.track(event, properties)
}
```

### 5.2 Error Tracking

**Recommended**: Sentry (if not already implemented)

**Setup**:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 6. Customer Support Integration

### 6.1 Help Desk System

**Options**: Intercom, Zendesk, Freshdesk

**Requirements**:

- Integration with user subscription data
- Ticket priority based on subscription tier
- Automated subscription-related responses

### 6.2 Live Chat Integration

```typescript
// Subscription-aware live chat
const initializeLiveChat = (user: User) => {
  window.Intercom('boot', {
    app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
    user_id: user.id,
    subscription_tier: user.subscriptionTier,
    email: user.email,
  })
}
```

## 7. Security Services

### 7.1 API Rate Limiting

**Service**: Upstash Redis or built-in Next.js rate limiting

```typescript
// src/middleware.ts (enhanced)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
})

export async function middleware(request: NextRequest) {
  // Rate limiting based on subscription tier
  const subscription = await getUserSubscription(userId)
  const limit = RATE_LIMITS[subscription.tier]

  const { success } = await ratelimit.limit(`${userId}_${subscription.tier}`)
  if (!success) {
    return new Response('Rate limited', { status: 429 })
  }
}
```

### 7.2 Data Encryption

**Requirements**:

- Encrypt sensitive Stripe data
- Secure API key storage
- PCI compliance for payment data

```typescript
// src/lib/encryption.ts
import crypto from 'crypto'

export const encryptSensitiveData = (data: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}
```

## 8. Backup and Disaster Recovery Services

### 8.1 Database Backups

**Service**: PostgreSQL automated backups (cloud provider specific)

**Configuration**:

- Daily automated backups with 30-day retention
- Point-in-time recovery capability
- Cross-region backup replication for Enterprise tier

### 8.2 Application Backups

**Requirements**:

- Code repository backups (GitHub/GitLab)
- Environment configuration backups
- SSL certificate backups

## 9. Development and Testing Services

### 9.1 Staging Environment Setup

**Requirements**:

- Separate Stripe test environment
- Development API keys for all services
- Mock services for testing

### 9.2 CI/CD Pipeline Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup environment variables
        run: |
          echo "STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }}" >> $GITHUB_ENV
          echo "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}" >> $GITHUB_ENV
```

## 10. Service Health Monitoring

### 10.1 External Service Health Checks

```typescript
// src/lib/health-checks.ts
export const checkExternalServices = async () => {
  const services = [
    { name: 'Stripe', check: () => stripe.accounts.retrieve() },
    { name: 'OpenAI', check: () => openai.models.list() },
    { name: 'AWS S3', check: () => s3.listBuckets() },
  ]

  const results = await Promise.allSettled(
    services.map(async service => ({
      name: service.name,
      status: await service
        .check()
        .then(() => 'healthy')
        .catch(() => 'unhealthy'),
    }))
  )

  return results
}
```

### 10.2 Service Dependency Mapping

```typescript
const SERVICE_DEPENDENCIES = {
  subscription_creation: ['stripe', 'database', 'email'],
  ai_analysis: ['openai', 'database', 'file_storage'],
  report_generation: ['database', 'file_storage', 'email'],
  user_authentication: ['database', 'email'],
}
```

## 11. Emergency Contact and Support

### Service Provider Support Contacts

- **Stripe Support**: Available in Stripe Dashboard, 24/7 for live accounts
- **OpenAI Support**: Available through OpenAI Platform, email support
- **AWS Support**: Based on support plan level
- **Vercel Support**: Available through dashboard and Discord

### Escalation Procedures

1. **Level 1**: Automated fallback and retry mechanisms
2. **Level 2**: Notify development team via monitoring alerts
3. **Level 3**: Contact service provider support
4. **Level 4**: Activate disaster recovery procedures

## 12. Service Setup Timeline

### Pre-Development (Week 0)

- [ ] Create Stripe account and complete verification
- [ ] Set up production domain and SSL certificates
- [ ] Configure DNS and subdomains

### Development Phase (Weeks 1-2)

- [ ] Implement Stripe integration in development
- [ ] Set up webhook endpoints and testing
- [ ] Configure enhanced monitoring services
- [ ] Set up staging environment with test services

### Testing Phase (Weeks 3-4)

- [ ] Test all external service integrations
- [ ] Validate fallback mechanisms
- [ ] Load test with external service limits
- [ ] Security audit of API integrations

### Production Deployment (Week 5)

- [ ] Switch to production API keys
- [ ] Configure production webhooks
- [ ] Enable monitoring and alerting
- [ ] Activate backup and recovery procedures

This comprehensive external service setup guide ensures reliable, secure, and scalable integration of all required services for the GoodBuy HQ AI SaaS platform.
