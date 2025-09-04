# Database Migration Strategy for AI SaaS Enhancement

## Overview

This document outlines the comprehensive database migration strategy for transforming GoodBuy HQ from a business analysis platform into a subscription-based AI SaaS platform while ensuring zero downtime and complete backward compatibility.

## Current Database Analysis

**Existing Schema Foundation**:

- **Users**: Complete authentication system with NextAuth.js integration
- **Businesses**: Comprehensive business data model with health metrics
- **Health Analytics**: Advanced health scoring and forecasting system already implemented
- **Communication System**: Full messaging, meetings, and collaboration features

**Database Technology**: PostgreSQL with Prisma ORM

## Required Schema Extensions for SaaS Enhancement

### 1. Subscription Management Tables

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period VARCHAR NOT NULL, -- 'monthly', 'yearly'
  ai_analysis_limit INTEGER, -- NULL for unlimited
  features JSON NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Usage Tracking
CREATE TABLE usage_metrics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id VARCHAR REFERENCES user_subscriptions(id),
  metric_type VARCHAR NOT NULL, -- 'ai_analysis', 'report_generation', etc.
  count INTEGER DEFAULT 1,
  metadata JSON,
  created_at TIMESTAMP DEFAULT now(),
  date DATE DEFAULT CURRENT_DATE
);

-- Billing History
CREATE TABLE billing_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  subscription_id VARCHAR REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR NOT NULL,
  transaction_type VARCHAR NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT now()
);
```

### 2. Enhanced AI Analysis Tables

```sql
-- AI Analysis Sessions
CREATE TABLE ai_analysis_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  business_id VARCHAR NOT NULL REFERENCES businesses(id),
  session_type VARCHAR NOT NULL, -- 'health_analysis', 'valuation', 'forecast'
  status VARCHAR NOT NULL DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  streaming_data JSON,
  results JSON,
  confidence_score INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

-- Portfolio Management
CREATE TABLE portfolios (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE portfolio_businesses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id VARCHAR NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  business_id VARCHAR NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT now(),
  notes TEXT,
  UNIQUE(portfolio_id, business_id)
);

-- Professional Reports
CREATE TABLE generated_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  business_id VARCHAR REFERENCES businesses(id),
  portfolio_id VARCHAR REFERENCES portfolios(id),
  report_type VARCHAR NOT NULL,
  template_used VARCHAR,
  branding_config JSON,
  file_path VARCHAR,
  file_size INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);
```

## Migration Phases

### Phase 1: Schema Preparation (Story 1.1)

**Target**: Extend existing authentication with subscription foundation

**Actions**:

1. Add subscription-related tables without foreign key constraints
2. Create indexes for performance optimization
3. Set up initial subscription plans data
4. Add usage tracking infrastructure

**Rollback Strategy**:

```sql
-- Phase 1 Rollback
DROP TABLE IF EXISTS usage_metrics CASCADE;
DROP TABLE IF EXISTS billing_transactions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
```

### Phase 2: User Migration (Story 1.1)

**Target**: Migrate existing users to appropriate subscription tiers

**Actions**:

```sql
-- Auto-assign existing users to Free tier
INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT u.id,
       (SELECT id FROM subscription_plans WHERE name = 'Free' LIMIT 1),
       'active',
       now(),
       now() + interval '1 year'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
);
```

**Rollback Strategy**:

```sql
-- Remove auto-assigned subscriptions
DELETE FROM user_subscriptions
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'Free');
```

### Phase 3: AI Enhancement (Stories 1.2-1.4)

**Target**: Add AI analysis tracking and portfolio management

**Actions**:

1. Create AI analysis session tracking
2. Implement portfolio management tables
3. Add usage metrics collection
4. Enable real-time analysis streaming

**Rollback Strategy**:

```sql
DROP TABLE IF EXISTS portfolio_businesses CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS ai_analysis_sessions CASCADE;
```

### Phase 4: Professional Reporting (Story 1.5)

**Target**: Add professional report generation capabilities

**Actions**:

1. Create report generation tracking tables
2. Add file storage metadata
3. Implement branding customization storage

**Rollback Strategy**:

```sql
DROP TABLE IF EXISTS generated_reports CASCADE;
```

### Phase 5: Finalization (Stories 1.6-1.7)

**Target**: Complete integration and monitoring

**Actions**:

1. Add performance monitoring tables
2. Implement billing integration verification
3. Final data consistency checks

## Data Preservation Guarantees

### Existing Data Protection

- **Users**: All existing user accounts, authentication, and profile data preserved
- **Businesses**: All business listings, evaluations, and health metrics maintained
- **Health Analytics**: Existing health metrics, forecasts, and alerts unchanged
- **Communications**: All messages, meetings, and document sharing preserved

### Backward Compatibility

- All existing API endpoints continue to function
- Existing user workflows remain unchanged
- Current UI components and routes preserved
- Database queries maintain performance

## Performance Impact Mitigation

### Indexing Strategy

```sql
-- Critical performance indexes
CREATE INDEX CONCURRENTLY idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX CONCURRENTLY idx_usage_metrics_user_date ON usage_metrics(user_id, date);
CREATE INDEX CONCURRENTLY idx_ai_sessions_user_status ON ai_analysis_sessions(user_id, status);
CREATE INDEX CONCURRENTLY idx_portfolios_user_default ON portfolios(user_id, is_default);
```

### Query Optimization

- Use CONCURRENTLY for index creation to avoid table locks
- Implement connection pooling optimization for new tables
- Add materialized views for complex subscription analytics

## Rollback Procedures

### Critical Rollback Points

**Level 1: Schema Rollback** (Complete reversal)

```bash
# Execute phase-specific rollback scripts in reverse order
psql $DATABASE_URL -f rollback_phase_5.sql
psql $DATABASE_URL -f rollback_phase_4.sql
psql $DATABASE_URL -f rollback_phase_3.sql
psql $DATABASE_URL -f rollback_phase_2.sql
psql $DATABASE_URL -f rollback_phase_1.sql
```

**Level 2: Data Rollback** (Preserve new tables, reset data)

```sql
-- Clear subscription assignments but keep infrastructure
DELETE FROM user_subscriptions;
DELETE FROM usage_metrics;
DELETE FROM billing_transactions;
-- Reset users to pre-migration state
```

**Level 3: Feature Rollback** (Disable new features, keep data)

```sql
-- Disable subscription features via application config
UPDATE subscription_plans SET is_active = false;
-- Keep data for future re-enablement
```

### Rollback Triggers

**Automatic Triggers**:

- Database migration failure (any step fails)
- Performance degradation >20% on key queries
- Data integrity violations detected

**Manual Triggers**:

- User experience issues reported
- Subscription billing problems
- Critical bug discovery

## Monitoring and Validation

### Pre-Migration Validation

```sql
-- Validate existing data integrity
SELECT COUNT(*) FROM users WHERE id IS NULL; -- Should be 0
SELECT COUNT(*) FROM businesses WHERE owner_id NOT IN (SELECT id FROM users); -- Should be 0
SELECT COUNT(*) FROM health_metrics WHERE business_id NOT IN (SELECT id FROM businesses); -- Should be 0
```

### Post-Migration Validation

```sql
-- Verify subscription assignments
SELECT COUNT(*) FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.id IS NULL; -- Should be 0

-- Verify data integrity
SELECT COUNT(*) FROM user_subscriptions
WHERE user_id NOT IN (SELECT id FROM users); -- Should be 0
```

### Performance Monitoring

- Track query performance on key tables
- Monitor subscription lookup speed
- Validate usage tracking accuracy
- Check AI analysis streaming performance

## Security Considerations

### Data Encryption

- Encrypt Stripe tokens using application-level encryption
- Hash sensitive billing information
- Implement secure API key management

### Access Controls

- Row-level security for subscription data
- Audit trail for all billing operations
- Rate limiting for AI analysis requests

## Success Criteria

### Technical Success

- Zero data loss during migration
- <5% performance impact on existing queries
- 100% backward compatibility maintained
- All rollback procedures tested and verified

### Business Success

- Existing users seamlessly upgraded
- New subscription features functional
- Billing integration operational
- Usage tracking accurate

## Timeline and Dependencies

**Week 1-2**: Schema preparation and testing
**Week 3**: User migration and validation  
**Week 4**: AI enhancement tables
**Week 5**: Professional reporting infrastructure
**Week 6**: Final integration and monitoring

**Dependencies**:

- Stripe account setup and API integration
- Testing environment with production data copy
- Monitoring infrastructure enhancement
- Backup and disaster recovery procedures
