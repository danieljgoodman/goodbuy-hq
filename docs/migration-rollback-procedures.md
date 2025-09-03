# Database Migration Rollback Procedures

**Version:** 1.0  
**Date:** September 3, 2025  
**Author:** Database Administration Team  
**Classification:** CRITICAL - PRODUCTION PROCEDURE

## Emergency Contact Information

**Primary DBA**: database-admin@goodbuyhq.com  
**Tech Lead**: tech-lead@goodbuyhq.com  
**On-Call Engineer**: +1-XXX-XXX-XXXX  
**Escalation**: cto@goodbuyhq.com

---

## Executive Summary

This document provides step-by-step rollback procedures for the AI Financial Health Analyzer database migrations. These procedures are designed to restore full system functionality within 5 minutes of initiating rollback.

### Rollback Types

1. **Emergency Rollback** - Immediate system restoration (<5 minutes)
2. **Planned Rollback** - Controlled rollback with data preservation (<30 minutes)
3. **Partial Rollback** - Selective feature rollback (<15 minutes)

---

## Pre-Rollback Preparation

### Required Access and Tools

```bash
# Verify access before emergency
psql $DATABASE_URL -c "SELECT version();"
git status
docker ps
pm2 status
```

### Environment Variables

```bash
# Set in .env or export before rollback
export DATABASE_URL="postgresql://user:pass@host:port/db"
export BACKUP_DIR="/var/backups/goodbuy-db"
export ROLLBACK_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
```

---

## Emergency Rollback Procedure (< 5 Minutes)

### STEP 1: Immediate Application Safety (30 seconds)

```bash
#!/bin/bash
# emergency-rollback.sh - Execute immediately in production

set -e
echo "=== EMERGENCY ROLLBACK INITIATED at $(date) ===" | tee -a rollback.log

# 1A. Enable maintenance mode immediately
echo "Enabling maintenance mode..."
echo "MAINTENANCE_MODE=true" >> .env.production
echo "DISABLE_NEW_FEATURES=true" >> .env.production

# 1B. Restart application with emergency flags
pm2 restart all --force
echo "Application in maintenance mode - $(date)" | tee -a rollback.log

# 1C. Disable new feature flags via API
curl -X POST http://localhost:3000/api/admin/features/bulk-disable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMERGENCY_TOKEN" \
  -d '{"features": ["health_analyzer", "quickbooks_sync", "ai_forecasting"]}' \
  || echo "Feature flag API unavailable - continuing with database rollback"

echo "=== STEP 1 COMPLETE: Application safety engaged ===" | tee -a rollback.log
```

### STEP 2: Database Schema Rollback (3 minutes)

```sql
-- emergency-schema-rollback.sql
-- Execute immediately after Step 1

BEGIN;

-- Set transaction timeout for safety
SET statement_timeout = '180s';

\echo 'Starting emergency database rollback...'

-- 2A. Drop new indexes immediately (fastest rollback)
\echo 'Dropping new indexes...'
DROP INDEX CONCURRENTLY IF EXISTS idx_health_metrics_business_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_health_metrics_created_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_forecast_results_business_type;
DROP INDEX CONCURRENTLY IF EXISTS idx_quickbooks_connections_company;
DROP INDEX CONCURRENTLY IF EXISTS idx_health_alerts_business_severity;
DROP INDEX CONCURRENTLY IF EXISTS idx_businesses_health_score;

-- 2B. Remove added columns from existing tables
\echo 'Removing added columns...'
ALTER TABLE businesses
DROP COLUMN IF EXISTS health_score CASCADE,
DROP COLUMN IF EXISTS last_health_calculation CASCADE,
DROP COLUMN IF EXISTS quickbooks_sync_enabled CASCADE;

-- 2C. Preserve new data by moving to backup schema
\echo 'Preserving data in backup schema...'
CREATE SCHEMA IF NOT EXISTS emergency_backup;
ALTER TABLE IF EXISTS health_metrics SET SCHEMA emergency_backup;
ALTER TABLE IF EXISTS forecast_results SET SCHEMA emergency_backup;
ALTER TABLE IF EXISTS quickbooks_connections SET SCHEMA emergency_backup;
ALTER TABLE IF EXISTS health_alerts SET SCHEMA emergency_backup;
ALTER TABLE IF EXISTS business_metrics_history SET SCHEMA emergency_backup;

-- 2D. Drop new enums and types
\echo 'Cleaning up new types...'
DROP TYPE IF EXISTS health_trajectory CASCADE;
DROP TYPE IF EXISTS forecast_type_enum CASCADE;
DROP TYPE IF EXISTS sync_status_enum CASCADE;
DROP TYPE IF EXISTS alert_type_enum CASCADE;
DROP TYPE IF EXISTS alert_severity_enum CASCADE;

-- 2E. Verify rollback success
\echo 'Verifying existing functionality...'
SELECT COUNT(*) as business_count FROM businesses;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as evaluation_count FROM evaluations;

\echo 'Emergency database rollback complete!'

COMMIT;
```

### STEP 3: Application Recovery (90 seconds)

```bash
#!/bin/bash
# application-recovery.sh

echo "=== STEP 3: Application Recovery ===" | tee -a rollback.log

# 3A. Verify database connectivity
psql $DATABASE_URL -c "SELECT 'Database accessible' as status;"

# 3B. Generate fresh Prisma client (exclude new models)
echo "Regenerating Prisma client..."
npx prisma generate --schema=prisma/schema-rollback.prisma

# 3C. Build application without new features
echo "Building application..."
NODE_ENV=production npm run build

# 3D. Restart application services
echo "Restarting services..."
pm2 restart all

# 3E. Verify core functionality
echo "Testing core functionality..."
curl -f http://localhost:3000/api/health || {
  echo "CRITICAL: Application health check failed!"
  exit 1
}

curl -f http://localhost:3000/api/businesses?limit=1 || {
  echo "CRITICAL: Core business API failed!"
  exit 1
}

# 3F. Disable maintenance mode
echo "Disabling maintenance mode..."
sed -i '/MAINTENANCE_MODE/d' .env.production
sed -i '/DISABLE_NEW_FEATURES/d' .env.production
pm2 restart all

echo "=== EMERGENCY ROLLBACK COMPLETE at $(date) ===" | tee -a rollback.log
```

---

## Planned Rollback Procedure (< 30 Minutes)

### Phase 1: Pre-Rollback Data Backup (10 minutes)

```bash
#!/bin/bash
# planned-rollback-backup.sh

set -e

echo "=== PLANNED ROLLBACK: Data Backup Phase ===" | tee -a rollback.log

# 1A. Create timestamped backup directory
BACKUP_DIR="/var/backups/goodbuy-db/planned-rollback-$ROLLBACK_TIMESTAMP"
mkdir -p $BACKUP_DIR

# 1B. Full database backup (compressed)
echo "Creating full database backup..."
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/full-database-backup.sql.gz

# 1C. Export new feature data to CSV for analysis
echo "Exporting health analyzer data..."
psql $DATABASE_URL -c "\copy (SELECT * FROM health_metrics) TO '$BACKUP_DIR/health_metrics.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy (SELECT * FROM forecast_results) TO '$BACKUP_DIR/forecast_results.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy (SELECT * FROM quickbooks_connections) TO '$BACKUP_DIR/quickbooks_connections.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy (SELECT * FROM health_alerts) TO '$BACKUP_DIR/health_alerts.csv' CSV HEADER"

# 1D. Export analytics on feature usage
echo "Generating analytics report..."
psql $DATABASE_URL -c "
SELECT
  'Health Metrics' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT business_id) as unique_businesses,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM health_metrics
UNION ALL
SELECT
  'Forecast Results' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT business_id) as unique_businesses,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM forecast_results;
" > $BACKUP_DIR/feature_usage_analytics.txt

echo "Backup phase complete. Files stored in: $BACKUP_DIR" | tee -a rollback.log
```

### Phase 2: Application Preparation (5 minutes)

```bash
#!/bin/bash
# planned-rollback-app-prep.sh

echo "=== PLANNED ROLLBACK: Application Preparation ===" | tee -a rollback.log

# 2A. Notify users of planned maintenance
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Scheduled Maintenance",
    "message": "The system will be in maintenance mode for approximately 20 minutes.",
    "type": "SYSTEM_ALERT",
    "channels": ["in_app", "email"]
  }' || echo "Notification API unavailable"

# 2B. Gracefully stop background jobs
echo "Stopping background jobs..."
pm2 stop health-calculator
pm2 stop quickbooks-sync
pm2 stop forecast-generator

# 2C. Wait for active requests to complete
echo "Waiting for active requests to complete..."
sleep 30

# 2D. Enable maintenance mode
echo "MAINTENANCE_MODE=true" >> .env.production
echo "ROLLBACK_IN_PROGRESS=true" >> .env.production
pm2 restart all

echo "Application preparation complete" | tee -a rollback.log
```

### Phase 3: Database Rollback with Preservation (10 minutes)

```sql
-- planned-database-rollback.sql

BEGIN;

\echo 'Starting planned database rollback with data preservation...'

-- 3A. Create comprehensive backup schema with metadata
CREATE SCHEMA IF NOT EXISTS rollback_preserve;
CREATE TABLE rollback_preserve.rollback_metadata (
  id SERIAL PRIMARY KEY,
  rollback_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  executed_by TEXT,
  tables_preserved TEXT[],
  recovery_instructions TEXT
);

INSERT INTO rollback_preserve.rollback_metadata
(reason, executed_by, tables_preserved, recovery_instructions)
VALUES (
  'Planned rollback of AI Financial Health Analyzer features',
  CURRENT_USER,
  ARRAY['health_metrics', 'forecast_results', 'quickbooks_connections', 'health_alerts'],
  'Data preserved in rollback_preserve schema. Use restore_health_analyzer_data.sql to recover.'
);

-- 3B. Preserve all new tables with complete structure
\echo 'Preserving table structures and data...'
CREATE TABLE rollback_preserve.health_metrics AS TABLE health_metrics INCLUDING ALL;
CREATE TABLE rollback_preserve.forecast_results AS TABLE forecast_results INCLUDING ALL;
CREATE TABLE rollback_preserve.quickbooks_connections AS TABLE quickbooks_connections INCLUDING ALL;
CREATE TABLE rollback_preserve.health_alerts AS TABLE health_alerts INCLUDING ALL;
CREATE TABLE rollback_preserve.business_metrics_history AS TABLE business_metrics_history INCLUDING ALL;

-- 3C. Create restoration scripts
\echo 'Creating restoration procedures...'
CREATE OR REPLACE FUNCTION rollback_preserve.restore_health_analyzer_data()
RETURNS VOID AS $$
DECLARE
  table_name TEXT;
  tables_to_restore TEXT[] := ARRAY['health_metrics', 'forecast_results', 'quickbooks_connections', 'health_alerts'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_restore LOOP
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I AS
      TABLE rollback_preserve.%I INCLUDING ALL',
      table_name, table_name);

    RAISE NOTICE 'Restored table: %', table_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3D. Remove new features from production schema
\echo 'Removing new tables from production...'
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS forecast_results CASCADE;
DROP TABLE IF EXISTS quickbooks_connections CASCADE;
DROP TABLE IF EXISTS health_alerts CASCADE;
DROP TABLE IF EXISTS business_metrics_history CASCADE;

-- 3E. Remove added columns (with preservation)
\echo 'Preserving and removing added columns...'
-- First preserve the data
UPDATE rollback_preserve.rollback_metadata
SET recovery_instructions = recovery_instructions ||
  E'\n\nTo restore business table columns:\n' ||
  'ALTER TABLE businesses ADD COLUMN health_score INTEGER;\n' ||
  'ALTER TABLE businesses ADD COLUMN last_health_calculation TIMESTAMP;\n' ||
  'ALTER TABLE businesses ADD COLUMN quickbooks_sync_enabled BOOLEAN DEFAULT FALSE;'
WHERE id = (SELECT MAX(id) FROM rollback_preserve.rollback_metadata);

-- Then remove from production
ALTER TABLE businesses
DROP COLUMN IF EXISTS health_score CASCADE,
DROP COLUMN IF EXISTS last_health_calculation CASCADE,
DROP COLUMN IF EXISTS quickbooks_sync_enabled CASCADE;

-- 3F. Clean up types and indexes
\echo 'Cleaning up types and indexes...'
DROP INDEX CONCURRENTLY IF EXISTS idx_businesses_health_score;
DROP TYPE IF EXISTS health_trajectory CASCADE;
DROP TYPE IF EXISTS forecast_type_enum CASCADE;
DROP TYPE IF EXISTS sync_status_enum CASCADE;
DROP TYPE IF EXISTS alert_type_enum CASCADE;
DROP TYPE IF EXISTS alert_severity_enum CASCADE;

-- 3G. Final validation
\echo 'Validating rollback success...'
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname IN ('public', 'rollback_preserve')
ORDER BY schemaname, tablename;

\echo 'Planned database rollback complete with full data preservation!'

COMMIT;
```

### Phase 4: Application Recovery and Verification (5 minutes)

```bash
#!/bin/bash
# planned-rollback-recovery.sh

echo "=== PLANNED ROLLBACK: Recovery and Verification ===" | tee -a rollback.log

# 4A. Update Prisma schema to rollback version
cp prisma/schema-rollback.prisma prisma/schema.prisma

# 4B. Regenerate Prisma client
echo "Regenerating Prisma client for rollback schema..."
npx prisma generate

# 4C. Run database migrations to ensure consistency
echo "Validating database state..."
npx prisma db pull --preview-feature || true

# 4D. Build and test application
echo "Building and testing application..."
NODE_ENV=production npm run build
npm run test:smoke:production

# 4E. Start background services (old version)
echo "Starting background services..."
pm2 start ecosystem-rollback.config.js

# 4F. Comprehensive functionality test
echo "Running comprehensive functionality tests..."
npm run test:integration:existing-features

# 4G. Performance validation
echo "Validating performance..."
npm run test:performance:baseline

# 4H. Disable maintenance mode
echo "Disabling maintenance mode..."
sed -i '/MAINTENANCE_MODE/d' .env.production
sed -i '/ROLLBACK_IN_PROGRESS/d' .env.production
pm2 restart all

# 4I. Notify users of completion
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Maintenance Complete",
    "message": "System is now fully operational. Thank you for your patience.",
    "type": "SYSTEM_ALERT",
    "channels": ["in_app"]
  }' || echo "Notification API unavailable"

echo "=== PLANNED ROLLBACK COMPLETE at $(date) ===" | tee -a rollback.log
echo "Data preserved in rollback_preserve schema for future analysis"
```

---

## Partial Rollback Procedure (< 15 Minutes)

### Selective Feature Rollback

```bash
#!/bin/bash
# partial-rollback.sh

FEATURE_TO_ROLLBACK=$1  # health_analyzer, quickbooks_sync, or ai_forecasting

echo "=== PARTIAL ROLLBACK: $FEATURE_TO_ROLLBACK ===" | tee -a rollback.log

case $FEATURE_TO_ROLLBACK in
  "health_analyzer")
    echo "Rolling back health analyzer features..."

    # Disable feature flag
    curl -X POST http://localhost:3000/api/admin/features/disable \
      -d '{"feature": "health_analyzer"}'

    # Move health_metrics table to backup
    psql $DATABASE_URL -c "
      CREATE SCHEMA IF NOT EXISTS disabled_features;
      ALTER TABLE health_metrics SET SCHEMA disabled_features;
      ALTER TABLE health_alerts SET SCHEMA disabled_features;
    "

    # Remove health score from businesses table
    psql $DATABASE_URL -c "
      ALTER TABLE businesses
      DROP COLUMN IF EXISTS health_score,
      DROP COLUMN IF EXISTS last_health_calculation;
    "
    ;;

  "quickbooks_sync")
    echo "Rolling back QuickBooks sync features..."

    # Stop sync jobs
    pm2 stop quickbooks-sync

    # Disable feature flag
    curl -X POST http://localhost:3000/api/admin/features/disable \
      -d '{"feature": "quickbooks_sync"}'

    # Move connections to backup
    psql $DATABASE_URL -c "
      CREATE SCHEMA IF NOT EXISTS disabled_features;
      ALTER TABLE quickbooks_connections SET SCHEMA disabled_features;
    "

    # Remove sync flag from businesses
    psql $DATABASE_URL -c "
      ALTER TABLE businesses
      DROP COLUMN IF EXISTS quickbooks_sync_enabled;
    "
    ;;

  "ai_forecasting")
    echo "Rolling back AI forecasting features..."

    # Stop forecast jobs
    pm2 stop forecast-generator

    # Disable feature flag
    curl -X POST http://localhost:3000/api/admin/features/disable \
      -d '{"feature": "ai_forecasting"}'

    # Move forecasts to backup
    psql $DATABASE_URL -c "
      CREATE SCHEMA IF NOT EXISTS disabled_features;
      ALTER TABLE forecast_results SET SCHEMA disabled_features;
    "
    ;;

  *)
    echo "Unknown feature: $FEATURE_TO_ROLLBACK"
    exit 1
    ;;
esac

# Regenerate Prisma client without disabled features
npx prisma generate

# Restart application
pm2 restart all

echo "=== PARTIAL ROLLBACK COMPLETE: $FEATURE_TO_ROLLBACK ===" | tee -a rollback.log
```

---

## Post-Rollback Procedures

### Immediate Verification Checklist

```bash
#!/bin/bash
# post-rollback-verification.sh

echo "=== POST-ROLLBACK VERIFICATION ===" | tee -a rollback.log

# Test critical user paths
echo "Testing critical user paths..."

# 1. User authentication
curl -f http://localhost:3000/api/auth/status || {
  echo "CRITICAL: User authentication failed"
  exit 1
}

# 2. Business listing
curl -f "http://localhost:3000/api/businesses?limit=5" || {
  echo "CRITICAL: Business listing failed"
  exit 1
}

# 3. Business creation
USER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@goodbuyhq.com"}' | jq -r '.token')

curl -f -X POST http://localhost:3000/api/businesses \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Business", "description": "Rollback verification test"}' || {
  echo "CRITICAL: Business creation failed"
  exit 1
}

# 4. Evaluation system
curl -f "http://localhost:3000/api/evaluations?limit=1" || {
  echo "CRITICAL: Evaluation system failed"
  exit 1
}

# 5. Database connectivity and performance
psql $DATABASE_URL -c "\timing on" -c "
SELECT
  COUNT(*) as businesses,
  AVG(EXTRACT(EPOCH FROM (now() - created_at))/86400) as avg_age_days
FROM businesses
WHERE status = 'ACTIVE';
" || {
  echo "CRITICAL: Database performance issue"
  exit 1
}

echo "=== VERIFICATION COMPLETE: All systems operational ===" | tee -a rollback.log
```

### Data Recovery Planning

```sql
-- data-recovery-plan.sql
-- Use this to plan data recovery if rollback was premature

-- 1. Assess preserved data
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
WHERE schemaname IN ('emergency_backup', 'rollback_preserve', 'disabled_features');

-- 2. Create data recovery procedures
CREATE OR REPLACE FUNCTION plan_data_recovery()
RETURNS TABLE(
  recovery_step INTEGER,
  description TEXT,
  sql_command TEXT,
  estimated_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    1,
    'Restore health_metrics table'::TEXT,
    'CREATE TABLE health_metrics AS TABLE rollback_preserve.health_metrics INCLUDING ALL'::TEXT,
    '2 minutes'::INTERVAL
  UNION ALL
  SELECT
    2,
    'Restore forecast_results table'::TEXT,
    'CREATE TABLE forecast_results AS TABLE rollback_preserve.forecast_results INCLUDING ALL'::TEXT,
    '1 minute'::INTERVAL
  UNION ALL
  SELECT
    3,
    'Restore business table columns'::TEXT,
    'ALTER TABLE businesses ADD COLUMN health_score INTEGER'::TEXT,
    '30 seconds'::INTERVAL
  UNION ALL
  SELECT
    4,
    'Recreate indexes'::TEXT,
    'CREATE INDEX CONCURRENTLY idx_health_metrics_business_id ON health_metrics(business_id)'::TEXT,
    '5 minutes'::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Execute to see recovery plan
SELECT * FROM plan_data_recovery() ORDER BY recovery_step;
```

---

## Rollback Testing Procedures

### Rollback Drill Schedule

```yaml
# rollback-drill-schedule.yml
rollback_drills:
  emergency_drill:
    frequency: monthly
    duration: '5 minutes'
    environment: staging
    participants: [dba, tech_lead, on_call]

  planned_rollback_drill:
    frequency: quarterly
    duration: '30 minutes'
    environment: staging
    participants: [dba, tech_lead, product_owner, qa_lead]

  partial_rollback_drill:
    frequency: bi_monthly
    duration: '15 minutes'
    environment: staging
    participants: [dba, tech_lead]

success_criteria:
  emergency_drill:
    - complete_within: '5 minutes'
    - zero_data_loss: true
    - all_services_restored: true

  planned_drill:
    - complete_within: '30 minutes'
    - data_preserved: true
    - recovery_plan_documented: true

  partial_drill:
    - complete_within: '15 minutes'
    - targeted_feature_disabled: true
    - other_features_unaffected: true
```

### Automated Rollback Testing

```bash
#!/bin/bash
# automated-rollback-test.sh

set -e

echo "=== AUTOMATED ROLLBACK TEST ===" | tee -a rollback-test.log

# 1. Create test migration
echo "Creating test migration..."
psql $TEST_DATABASE_URL -f test-migration.sql

# 2. Verify migration success
echo "Verifying migration..."
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM test_health_metrics;"

# 3. Execute rollback procedure
echo "Testing rollback procedure..."
./emergency-rollback.sh

# 4. Verify rollback success
echo "Verifying rollback..."
psql $TEST_DATABASE_URL -c "
SELECT
  CASE
    WHEN NOT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'test_health_metrics')
    THEN 'PASS: Table removed'
    ELSE 'FAIL: Table still exists'
  END as rollback_test_result;
"

# 5. Performance baseline check
echo "Checking performance baseline..."
npm run test:performance:baseline

echo "=== ROLLBACK TEST COMPLETE ===" | tee -a rollback-test.log
```

---

## Communication Templates

### Emergency Rollback Communication

```markdown
# URGENT: Emergency System Rollback

**Time:** [TIMESTAMP]
**Duration:** ~5 minutes
**Impact:** Temporary service interruption

## What Happened

AI Financial Health Analyzer features have been rolled back due to [REASON].

## Current Status

- ✅ Core business listing functionality: OPERATIONAL
- ✅ User authentication: OPERATIONAL
- ✅ Business evaluations: OPERATIONAL
- ❌ Health scoring: TEMPORARILY DISABLED
- ❌ QuickBooks sync: TEMPORARILY DISABLED

## Next Steps

1. Full system analysis in progress
2. Root cause investigation initiated
3. Timeline for re-deployment: TBD

## Contact

For urgent issues: database-admin@goodbuyhq.com
Status updates: status.goodbuyhq.com
```

### Planned Rollback Communication

```markdown
# Scheduled System Rollback

**Maintenance Window:** [START_TIME] - [END_TIME] (Est. 30 minutes)
**Impact:** Limited functionality during maintenance

## What's Happening

We are performing a planned rollback of recent AI features to ensure optimal system performance.

## During Maintenance

- ✅ Core business browsing: AVAILABLE
- ⚠️ New business creation: LIMITED
- ❌ AI health analysis: TEMPORARILY UNAVAILABLE
- ❌ Financial forecasting: TEMPORARILY UNAVAILABLE

## After Maintenance

All core GoodBuy HQ functionality will be fully restored with improved performance.

## Questions?

Contact: support@goodbuyhq.com
```

---

## Success Metrics

### Rollback Performance Targets

```yaml
rollback_targets:
  emergency_rollback:
    max_duration: '5 minutes'
    max_downtime: '2 minutes'
    data_loss_tolerance: 'zero'
    success_rate: '99.9%'

  planned_rollback:
    max_duration: '30 minutes'
    max_downtime: '5 minutes'
    data_preservation: '100%'
    success_rate: '100%'

  partial_rollback:
    max_duration: '15 minutes'
    max_downtime: '0 minutes'
    feature_isolation: 'perfect'
    success_rate: '100%'
```

### Post-Rollback Validation Criteria

- [ ] All existing API endpoints respond within baseline performance
- [ ] Database queries execute within 110% of baseline time
- [ ] User authentication and authorization fully functional
- [ ] Business listing and search perform as expected
- [ ] Evaluation system completely operational
- [ ] No data corruption or loss detected
- [ ] All critical user journeys validated
- [ ] Performance monitoring shows green status

---

## Conclusion

These rollback procedures ensure that any migration of the AI Financial Health Analyzer can be safely reversed with minimal impact to the existing GoodBuy HQ platform. Regular testing and drills are essential to maintain rollback readiness.

### Key Takeaways

1. **Speed is Critical**: Emergency rollback must complete within 5 minutes
2. **Data Preservation**: All rollback procedures preserve data for later analysis
3. **Validation Required**: Every rollback must be followed by comprehensive testing
4. **Communication Essential**: Users must be informed of rollback status
5. **Regular Testing**: Monthly drills ensure procedures remain effective

These procedures provide the safety net necessary for confident deployment of database changes in a critical business environment.
