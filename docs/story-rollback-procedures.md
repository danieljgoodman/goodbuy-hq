# Story-by-Story Rollback Procedures and Triggers

## Overview

This document provides detailed rollback procedures for each story in the GoodBuy HQ AI SaaS enhancement epic, including specific triggers, thresholds, and step-by-step recovery procedures.

## Rollback Framework

### Rollback Levels

**Level 1: Feature Disable** - Disable new features, keep data
**Level 2: Data Rollback** - Remove new data, keep infrastructure  
**Level 3: Complete Rollback** - Full reversal to pre-story state

### Trigger Categories

**Automatic Triggers** - System-detected failures
**Performance Triggers** - Threshold-based performance degradation
**Manual Triggers** - Human-initiated based on business criteria

## Story 1.1: Enhanced Authentication & Subscription Foundation

### Rollback Triggers

**Automatic Triggers**:
- Database migration fails during subscription table creation
- NextAuth.js authentication breaks (>5% login failure rate)
- Stripe integration connection failures (>3 consecutive API errors)

**Performance Triggers**:
- User login time increases >40% from baseline
- Database query performance degrades >30% on user-related queries
- Memory usage increases >50% on authentication endpoints

**Manual Triggers**:
- User complaints about login issues (>10 reports in 24 hours)
- Subscription data inconsistencies detected
- Business decision to postpone billing integration

### Rollback Procedures

#### Level 1: Feature Disable (Recommended first step)
```sql
-- Disable subscription features
UPDATE subscription_plans SET is_active = false;
UPDATE user_subscriptions SET status = 'disabled';
```

```javascript
// Application config changes
// In environment variables or config file
ENABLE_SUBSCRIPTIONS=false
ENABLE_BILLING=false
STRIPE_ENABLED=false
```

**Recovery Time**: 5-10 minutes  
**Data Loss**: None  
**User Impact**: Subscription features disappear from UI

#### Level 2: Data Rollback
```sql
-- Remove subscription assignments
DELETE FROM billing_transactions;
DELETE FROM usage_metrics WHERE subscription_id IS NOT NULL;
DELETE FROM user_subscriptions;
```

**Recovery Time**: 15-30 minutes  
**Data Loss**: All subscription assignments and billing history  
**User Impact**: Users revert to pre-subscription state

#### Level 3: Complete Rollback
```sql
-- Execute full schema rollback
DROP TABLE IF EXISTS billing_transactions CASCADE;
DROP TABLE IF EXISTS usage_metrics CASCADE;  
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Verify user table integrity
SELECT COUNT(*) FROM users WHERE id IS NULL; -- Should be 0
```

**Recovery Time**: 30-60 minutes  
**Data Loss**: Complete removal of subscription infrastructure  
**User Impact**: System returns to original authentication-only state

### Rollback Validation
```sql
-- Verify authentication still works
SELECT COUNT(*) FROM users WHERE email IS NOT NULL;
SELECT COUNT(*) FROM accounts WHERE user_id IS NOT NULL;

-- Verify no orphaned data
SELECT COUNT(*) FROM user_subscriptions; -- Should be 0 after rollback
```

## Story 1.2: AI Tools Dashboard Integration

### Rollback Triggers

**Automatic Triggers**:
- Dashboard load failures (>10% error rate)
- Component rendering errors (React crashes)
- Navigation integration breaks existing flows

**Performance Triggers**:
- Dashboard load time >8 seconds (baseline: 2-3 seconds)
- Memory leak detected (>100MB increase over 1 hour)
- API response times >5 seconds for dashboard data

**Manual Triggers**:
- User experience feedback indicating confusion
- Existing workflow disruption reports
- UI/UX quality concerns

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Feature flags in application
ENABLE_AI_DASHBOARD=false
SHOW_AI_TOOLS=false

// Route changes
// Redirect AI tools routes to existing business analysis
// Remove AI tools navigation items
```

**Recovery Time**: 2-5 minutes  
**Data Loss**: None  
**User Impact**: AI dashboard hidden, original interface restored

#### Level 2: Component Rollback
```bash
# Git revert specific components
git revert --no-commit <ai-dashboard-commits>
git revert --no-commit <navigation-changes-commits>

# Rebuild and deploy
npm run build
npm run deploy
```

**Recovery Time**: 10-20 minutes  
**Data Loss**: None  
**User Impact**: Complete UI restoration to pre-story state

## Story 1.3: Enhanced Business Data Input & Validation

### Rollback Triggers

**Automatic Triggers**:
- Data validation failures causing data corruption
- CSV upload functionality breaking existing data entry
- Form submission errors >15% of attempts

**Performance Triggers**:
- Form load time increases >60% from baseline
- File upload processing >2 minutes for typical business data
- Database writes take >10 seconds per business record

**Manual Triggers**:
- Data quality issues reported by users
- Existing manual entry workflow disruption
- File upload security concerns

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Disable enhanced features
ENABLE_CSV_UPLOAD=false
ENABLE_ENHANCED_VALIDATION=false
ENABLE_AUTO_SAVE=false

// Form configuration
FORM_MODE="legacy"
```

**Recovery Time**: 1-3 minutes  
**Data Loss**: None  
**User Impact**: Forms revert to original functionality

#### Level 2: Data Rollback
```sql
-- Remove enhanced validation metadata
UPDATE businesses SET 
  metadata = metadata - 'enhanced_validation_data',
  metadata = metadata - 'csv_import_history';

-- Remove auto-save drafts
DELETE FROM form_drafts WHERE form_type = 'enhanced_business_input';
```

**Recovery Time**: 5-15 minutes  
**Data Loss**: Enhanced validation data and auto-save drafts  
**User Impact**: Loss of enhanced features, data entry reverts to manual

## Story 1.4: Real-Time AI Analysis Enhancement

### Rollback Triggers

**Automatic Triggers**:
- WebSocket connection failures >20%
- AI analysis results differ significantly from existing algorithms (>25% variance)
- Streaming analysis timeouts >60 seconds

**Performance Triggers**:
- AI analysis time exceeds 45 seconds (current target: 30 seconds)
- Concurrent analysis causes system slowdown >40%
- WebSocket memory leaks detected

**Manual Triggers**:
- Analysis quality concerns from users
- Confidence scoring inaccuracy reports
- Real-time streaming stability issues

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Disable streaming features
ENABLE_STREAMING_ANALYSIS=false
ENABLE_REALTIME_PROGRESS=false
USE_LEGACY_ANALYSIS=true

// WebSocket configuration
DISABLE_WEBSOCKETS=true
```

**Recovery Time**: 2-5 minutes  
**Data Loss**: None  
**User Impact**: Analysis reverts to original batch processing

#### Level 2: Analysis Rollback  
```sql
-- Disable enhanced AI analysis
UPDATE ai_analysis_sessions SET status = 'disabled' WHERE status = 'streaming';

-- Remove streaming data
DELETE FROM ai_analysis_sessions WHERE session_type IN ('streaming_health', 'realtime_analysis');
```

**Recovery Time**: 10-20 minutes  
**Data Loss**: Real-time analysis session data  
**User Impact**: AI analysis returns to original 30-second batch process

## Story 1.5: Professional Reporting & Export Enhancement

### Rollback Triggers

**Automatic Triggers**:
- PDF generation failures >10%
- Report template rendering errors
- Export functionality breaking existing exports

**Performance Triggers**:
- Report generation time >5 minutes
- File storage usage spikes >500MB per hour
- Export process causes system memory issues

**Manual Triggers**:
- Report quality issues (formatting, branding)
- Existing export workflow disruption
- Professional template concerns

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Disable professional reporting
ENABLE_PROFESSIONAL_REPORTS=false
ENABLE_WHITE_LABEL_REPORTS=false
USE_LEGACY_EXPORTS=true
```

**Recovery Time**: 1-3 minutes  
**Data Loss**: None  
**User Impact**: Reports revert to original PDF/Excel export functionality

#### Level 2: Data Rollback
```sql
-- Remove generated professional reports
DELETE FROM generated_reports WHERE report_type IN ('professional_pdf', 'white_label');

-- Clean up file storage
-- (Manual process to remove report files from storage)
```

**Recovery Time**: 15-30 minutes  
**Data Loss**: Generated professional reports and custom branding  
**User Impact**: Loss of professional reporting, original exports only

## Story 1.6: Portfolio Management & Bulk Analysis Integration

### Rollback Triggers

**Automatic Triggers**:
- Bulk analysis processing failures >20%
- Portfolio data corruption or integrity issues  
- Comparative analysis calculation errors

**Performance Triggers**:
- Bulk analysis exceeds 10 minutes for 10 businesses (target: 5 minutes)
- Portfolio dashboard load time >10 seconds
- Database performance impact on individual business queries

**Manual Triggers**:
- Portfolio organization confusion reported by users
- Bulk processing quality concerns
- Individual analysis quality degradation

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Disable portfolio features
ENABLE_PORTFOLIOS=false
ENABLE_BULK_ANALYSIS=false
HIDE_PORTFOLIO_UI=true
```

**Recovery Time**: 2-5 minutes  
**Data Loss**: None  
**User Impact**: Portfolio features hidden, individual analysis only

#### Level 2: Data Rollback
```sql
-- Remove portfolio assignments
DELETE FROM portfolio_businesses;
DELETE FROM portfolios WHERE is_default = false;

-- Remove bulk analysis results
DELETE FROM ai_analysis_sessions WHERE session_type = 'bulk_analysis';
```

**Recovery Time**: 10-25 minutes  
**Data Loss**: Portfolio organizations and bulk analysis results  
**User Impact**: Return to individual business management only

## Story 1.7: Usage Analytics & Subscription Management Integration

### Rollback Triggers

**Automatic Triggers**:
- Usage tracking data inconsistencies >10%
- Billing integration failures with Stripe
- Analytics dashboard critical errors

**Performance Triggers**:
- Usage analytics queries slow system >25%
- Billing webhook processing delays >30 seconds
- Admin dashboard load time >15 seconds

**Manual Triggers**:
- Usage tracking accuracy concerns
- Billing discrepancies reported
- Admin management difficulties

### Rollback Procedures

#### Level 1: Feature Disable
```javascript
// Disable analytics and billing features
ENABLE_USAGE_ANALYTICS=false
ENABLE_BILLING_MANAGEMENT=false
DISABLE_USAGE_TRACKING=true
```

**Recovery Time**: 1-3 minutes  
**Data Loss**: None  
**User Impact**: Usage analytics hidden, subscription management disabled

#### Level 2: Data Rollback
```sql
-- Clear usage analytics (keep for potential re-enablement)
UPDATE usage_metrics SET is_active = false;
DELETE FROM billing_transactions WHERE transaction_type = 'subscription';
```

**Recovery Time**: 5-15 minutes  
**Data Loss**: Usage analytics and billing transaction history  
**User Impact**: Return to basic user management without subscription features

## Cross-Story Emergency Rollback

### Complete Epic Rollback
If multiple stories fail or systemic issues occur:

```bash
#!/bin/bash
# Emergency epic rollback script

echo "Starting emergency rollback of entire AI SaaS enhancement..."

# 1. Disable all new features
export ENABLE_SUBSCRIPTIONS=false
export ENABLE_AI_DASHBOARD=false
export ENABLE_CSV_UPLOAD=false
export ENABLE_STREAMING_ANALYSIS=false
export ENABLE_PROFESSIONAL_REPORTS=false
export ENABLE_PORTFOLIOS=false
export ENABLE_USAGE_ANALYTICS=false

# 2. Database rollback
psql $DATABASE_URL -f emergency_rollback.sql

# 3. Code rollback
git revert --no-commit $EPIC_START_COMMIT..$EPIC_END_COMMIT

# 4. Rebuild and deploy
npm run build
npm run deploy

echo "Emergency rollback completed. System restored to pre-enhancement state."
```

### Monitoring Post-Rollback

```sql
-- Validate system integrity after rollback
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Businesses', COUNT(*) FROM businesses  
UNION ALL
SELECT 'Health Metrics', COUNT(*) FROM health_metrics
UNION ALL
SELECT 'Communications', COUNT(*) FROM messages;

-- Check for any orphaned data
SELECT 'Orphaned Subscriptions', COUNT(*) FROM user_subscriptions 
WHERE user_id NOT IN (SELECT id FROM users);
```

## Success Criteria for Rollbacks

### Technical Validation
- All original functionality restored and tested
- No data corruption or orphaned records
- Performance returns to baseline metrics
- All existing APIs functional

### User Validation  
- Existing workflows operate normally
- No user complaints about missing functionality
- System stability confirmed over 24-hour period
- Monitoring shows normal operation patterns

### Business Validation
- Revenue systems unaffected (if applicable)
- User retention maintained
- Support ticket volume returns to normal
- Stakeholder confidence restored

## Documentation and Communication

### Post-Rollback Actions
1. **Document the incident** - Root cause, timeline, resolution
2. **Notify stakeholders** - Users, management, development team
3. **Schedule post-mortem** - Identify improvements for future deployments
4. **Update rollback procedures** - Based on lessons learned
5. **Plan re-deployment** - If and when issues are resolved

### Communication Templates
- User notification email templates
- Status page updates  
- Internal team notifications
- Stakeholder summary reports

This comprehensive rollback strategy ensures that any story-level failure can be quickly and safely reversed while preserving the integrity of the existing GoodBuy HQ platform.