# Database Migration Rollback Plan

## AI Financial Health Analyzer - PostgreSQL Schema Changes

**Version:** 1.0  
**Date:** September 3, 2025  
**Database:** PostgreSQL 14+  
**Schema:** goodbuy_hq

---

## Overview

This document provides detailed database migration rollback procedures for the AI Financial Health Analyzer project. All rollback procedures are designed to maintain backward compatibility with the existing GoodBuy HQ brownfield system while safely reverting AI-specific schema changes.

## Migration Rollback Framework

### Core Principles

1. **Data Preservation First** - Never lose existing business data
2. **Backward Compatibility** - Existing queries must continue to work
3. **Atomic Operations** - All-or-nothing rollback approach
4. **Validation Gates** - Verify rollback success at each step

### Rollback Infrastructure

```sql
-- Create rollback tracking table (if not exists)
CREATE TABLE IF NOT EXISTS migration_rollbacks (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rollback_sql TEXT NOT NULL,
  rollback_applied_at TIMESTAMP NULL,
  rollback_status VARCHAR(50) DEFAULT 'pending',
  rollback_notes TEXT,
  created_by VARCHAR(100) DEFAULT current_user
);

-- Create backup schema for emergency recovery
CREATE SCHEMA IF NOT EXISTS emergency_backup;
```

## AI Health Analyzer Schema Additions

### 1. Health Metrics Tables

#### Migration: Add health_metrics table

```sql
-- Original Migration
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  growth_score INTEGER CHECK (growth_score >= 0 AND growth_score <= 100),
  operational_score INTEGER CHECK (operational_score >= 0 AND operational_score <= 100),
  financial_score INTEGER CHECK (financial_score >= 0 AND financial_score <= 100),
  sale_readiness_score INTEGER CHECK (sale_readiness_score >= 0 AND sale_readiness_score <= 100),
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  trajectory health_trajectory DEFAULT 'stable',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_sources JSONB,
  calculation_metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add to rollback registry
INSERT INTO migration_rollbacks (migration_name, rollback_sql) VALUES (
  'add_health_metrics_table',
  'DROP TABLE IF EXISTS health_metrics CASCADE;'
);
```

#### Rollback: Remove health_metrics table

```sql
-- Rollback Procedure
BEGIN TRANSACTION;

-- 1. Create backup of health metrics data
CREATE TABLE emergency_backup.health_metrics_backup AS
SELECT * FROM health_metrics;

-- 2. Log rollback start
UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'in_progress',
    rollback_notes = 'Starting health_metrics table rollback'
WHERE migration_name = 'add_health_metrics_table';

-- 3. Drop dependent objects first
DROP INDEX IF EXISTS idx_health_metrics_business_date;
DROP INDEX IF EXISTS idx_health_metrics_score;

-- 4. Remove health_metrics table
DROP TABLE IF EXISTS health_metrics CASCADE;

-- 5. Verify rollback success
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'health_metrics'
  ) THEN
    RAISE EXCEPTION 'Rollback failed: health_metrics table still exists';
  END IF;
END $$;

-- 6. Update rollback status
UPDATE migration_rollbacks
SET rollback_status = 'completed',
    rollback_notes = 'health_metrics table successfully removed'
WHERE migration_name = 'add_health_metrics_table';

COMMIT;
```

### 2. Forecasting Tables

#### Migration: Add forecast_results table

```sql
-- Original Migration
CREATE TABLE forecast_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  forecast_type forecast_type_enum,
  forecast_period INTEGER,
  predicted_value DECIMAL(15,2),
  confidence_interval_lower DECIMAL(15,2),
  confidence_interval_upper DECIMAL(15,2),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  model_used VARCHAR(50),
  forecast_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actual_value DECIMAL(15,2),
  accuracy_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_rollbacks (migration_name, rollback_sql) VALUES (
  'add_forecast_results_table',
  'DROP TABLE IF EXISTS forecast_results CASCADE; DROP TYPE IF EXISTS forecast_type_enum CASCADE;'
);
```

#### Rollback: Remove forecast_results table

```sql
BEGIN TRANSACTION;

-- Backup forecast data
CREATE TABLE emergency_backup.forecast_results_backup AS
SELECT * FROM forecast_results;

-- Update rollback status
UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'in_progress'
WHERE migration_name = 'add_forecast_results_table';

-- Drop indexes
DROP INDEX IF EXISTS idx_forecast_results_business_type;
DROP INDEX IF EXISTS idx_forecast_results_date;

-- Drop table and enum
DROP TABLE IF EXISTS forecast_results CASCADE;
DROP TYPE IF EXISTS forecast_type_enum CASCADE;

-- Verify rollback
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forecast_results') THEN
    RAISE EXCEPTION 'Rollback failed: forecast_results table still exists';
  END IF;
END $$;

-- Update status
UPDATE migration_rollbacks
SET rollback_status = 'completed'
WHERE migration_name = 'add_forecast_results_table';

COMMIT;
```

### 3. QuickBooks Integration Tables

#### Migration: Add quickbooks_connections table

```sql
-- Original Migration
CREATE TABLE quickbooks_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  company_id VARCHAR(100) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  last_sync_at TIMESTAMP,
  sync_status sync_status_enum DEFAULT 'pending',
  sync_errors JSONB,
  webhook_subscriptions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_rollbacks (migration_name, rollback_sql) VALUES (
  'add_quickbooks_connections',
  'DROP TABLE IF EXISTS quickbooks_connections CASCADE; DROP TYPE IF EXISTS sync_status_enum CASCADE;'
);
```

#### Rollback: Remove quickbooks_connections table

```sql
BEGIN TRANSACTION;

-- Backup QuickBooks connection data (encrypted tokens preserved)
CREATE TABLE emergency_backup.quickbooks_connections_backup AS
SELECT * FROM quickbooks_connections;

UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'in_progress'
WHERE migration_name = 'add_quickbooks_connections';

-- Drop related tables first
DROP TABLE IF EXISTS quickbooks_sync_logs CASCADE;
DROP INDEX IF EXISTS idx_quickbooks_company;
DROP INDEX IF EXISTS idx_quickbooks_business;

-- Drop main table
DROP TABLE IF EXISTS quickbooks_connections CASCADE;
DROP TYPE IF EXISTS sync_status_enum CASCADE;

-- Verify rollback
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quickbooks_connections') THEN
    RAISE EXCEPTION 'Rollback failed: quickbooks_connections table still exists';
  END IF;
END $$;

UPDATE migration_rollbacks SET rollback_status = 'completed'
WHERE migration_name = 'add_quickbooks_connections';

COMMIT;
```

### 4. Alert System Tables

#### Migration: Add health_alerts table

```sql
-- Original Migration
CREATE TABLE health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  alert_type alert_type_enum,
  severity alert_severity_enum,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  threshold_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  metadata JSONB
);

INSERT INTO migration_rollbacks (migration_name, rollback_sql) VALUES (
  'add_health_alerts',
  'DROP TABLE IF EXISTS health_alerts CASCADE; DROP TYPE IF EXISTS alert_type_enum CASCADE; DROP TYPE IF EXISTS alert_severity_enum CASCADE;'
);
```

#### Rollback: Remove health_alerts table

```sql
BEGIN TRANSACTION;

CREATE TABLE emergency_backup.health_alerts_backup AS
SELECT * FROM health_alerts;

UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'in_progress'
WHERE migration_name = 'add_health_alerts';

DROP INDEX IF EXISTS idx_health_alerts_business_severity;
DROP TABLE IF EXISTS health_alerts CASCADE;
DROP TYPE IF EXISTS alert_type_enum CASCADE;
DROP TYPE IF EXISTS alert_severity_enum CASCADE;

-- Verify
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_alerts') THEN
    RAISE EXCEPTION 'Rollback failed: health_alerts table still exists';
  END IF;
END $$;

UPDATE migration_rollbacks SET rollback_status = 'completed'
WHERE migration_name = 'add_health_alerts';

COMMIT;
```

## Business Table Modifications

### 1. Additional AI-related Columns

#### Migration: Add AI columns to businesses table

```sql
-- Original Migration
ALTER TABLE businesses
ADD COLUMN health_score_enabled BOOLEAN DEFAULT false,
ADD COLUMN last_health_calculation TIMESTAMP,
ADD COLUMN quickbooks_company_id VARCHAR(100),
ADD COLUMN auto_sync_enabled BOOLEAN DEFAULT false;

INSERT INTO migration_rollbacks (migration_name, rollback_sql) VALUES (
  'add_business_ai_columns',
  'ALTER TABLE businesses DROP COLUMN IF EXISTS health_score_enabled, DROP COLUMN IF EXISTS last_health_calculation, DROP COLUMN IF EXISTS quickbooks_company_id, DROP COLUMN IF EXISTS auto_sync_enabled;'
);
```

#### Rollback: Remove AI columns from businesses table

```sql
BEGIN TRANSACTION;

-- Backup businesses with AI data
CREATE TABLE emergency_backup.businesses_ai_data AS
SELECT id, health_score_enabled, last_health_calculation,
       quickbooks_company_id, auto_sync_enabled
FROM businesses
WHERE health_score_enabled = true OR quickbooks_company_id IS NOT NULL;

UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'in_progress'
WHERE migration_name = 'add_business_ai_columns';

-- Remove AI-specific columns
ALTER TABLE businesses
DROP COLUMN IF EXISTS health_score_enabled,
DROP COLUMN IF EXISTS last_health_calculation,
DROP COLUMN IF EXISTS quickbooks_company_id,
DROP COLUMN IF EXISTS auto_sync_enabled;

-- Verify rollback
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'health_score_enabled'
  ) THEN
    RAISE EXCEPTION 'Rollback failed: AI columns still exist in businesses table';
  END IF;
END $$;

UPDATE migration_rollbacks SET rollback_status = 'completed'
WHERE migration_name = 'add_business_ai_columns';

COMMIT;
```

## Enum Types Rollback

### Health-related Enums

```sql
-- Rollback all AI-related enum types
BEGIN TRANSACTION;

-- Create backup of enum usage
CREATE TABLE emergency_backup.enum_usage AS
SELECT
  t.table_name,
  c.column_name,
  e.enumtypid::regtype::text as enum_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
JOIN pg_type e ON c.udt_name = e.typname
WHERE e.typtype = 'e' AND e.typname LIKE '%health%' OR e.typname LIKE '%forecast%';

-- Drop enums in correct order (dependent types first)
DROP TYPE IF EXISTS alert_severity_enum CASCADE;
DROP TYPE IF EXISTS alert_type_enum CASCADE;
DROP TYPE IF EXISTS sync_status_enum CASCADE;
DROP TYPE IF EXISTS forecast_type_enum CASCADE;
DROP TYPE IF EXISTS health_trajectory CASCADE;

-- Verify enum cleanup
DO $$
DECLARE
  enum_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO enum_count
  FROM pg_type
  WHERE typtype = 'e'
  AND (typname LIKE '%health%' OR typname LIKE '%forecast%' OR typname LIKE '%alert%');

  IF enum_count > 0 THEN
    RAISE EXCEPTION 'Rollback failed: % AI-related enums still exist', enum_count;
  END IF;
END $$;

COMMIT;
```

## Index Rollback Procedures

### Remove AI-specific Indexes

```sql
-- Rollback all AI-related indexes
BEGIN TRANSACTION;

-- Backup index definitions
CREATE TABLE emergency_backup.dropped_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%health%'
   OR indexname LIKE '%forecast%'
   OR indexname LIKE '%quickbooks%'
   OR indexname LIKE '%alert%';

-- Drop AI-related indexes
DROP INDEX IF EXISTS idx_health_metrics_business_date;
DROP INDEX IF EXISTS idx_health_metrics_score;
DROP INDEX IF EXISTS idx_forecast_results_business_type;
DROP INDEX IF EXISTS idx_forecast_results_date;
DROP INDEX IF EXISTS idx_quickbooks_connections_company;
DROP INDEX IF EXISTS idx_quickbooks_connections_business;
DROP INDEX IF EXISTS idx_health_alerts_business_severity;
DROP INDEX IF EXISTS idx_health_alerts_triggered_at;

-- Verify index removal
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE indexname LIKE '%health%'
     OR indexname LIKE '%forecast%'
     OR indexname LIKE '%quickbooks%'
     OR indexname LIKE '%alert%';

  IF index_count > 0 THEN
    RAISE EXCEPTION 'Rollback failed: % AI-related indexes still exist', index_count;
  END IF;
END $$;

COMMIT;
```

## Complete Schema Rollback Script

```sql
-- complete_ai_schema_rollback.sql
-- WARNING: This script removes all AI Financial Health Analyzer schema changes

BEGIN TRANSACTION;

-- Set up rollback logging
CREATE TEMP TABLE rollback_log (
  step TEXT,
  status TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT
);

INSERT INTO rollback_log (step, status, details) VALUES
('ROLLBACK_START', 'INFO', 'Starting complete AI schema rollback');

-- Step 1: Create comprehensive backup
INSERT INTO rollback_log (step, status) VALUES ('BACKUP_START', 'INFO');

-- Create backup schema if not exists
CREATE SCHEMA IF NOT EXISTS emergency_backup;

-- Backup all AI-related data
DO $$
DECLARE
  table_name TEXT;
  backup_sql TEXT;
BEGIN
  FOR table_name IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND (t.table_name LIKE '%health%'
         OR t.table_name LIKE '%forecast%'
         OR t.table_name LIKE '%quickbooks%'
         OR t.table_name LIKE '%alert%')
  LOOP
    backup_sql := format('CREATE TABLE emergency_backup.%I AS SELECT * FROM %I',
                        table_name || '_backup', table_name);
    EXECUTE backup_sql;
  END LOOP;
END $$;

INSERT INTO rollback_log (step, status) VALUES ('BACKUP_COMPLETE', 'SUCCESS');

-- Step 2: Remove foreign key constraints (AI tables)
INSERT INTO rollback_log (step, status) VALUES ('CONSTRAINTS_REMOVAL_START', 'INFO');

-- Drop all foreign keys pointing to AI tables
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT
      tc.constraint_name,
      tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_name = tc.table_name
      AND (t.table_name LIKE '%health%'
           OR t.table_name LIKE '%forecast%'
           OR t.table_name LIKE '%quickbooks%'
           OR t.table_name LIKE '%alert%')
    )
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
                  constraint_record.table_name, constraint_record.constraint_name);
  END LOOP;
END $$;

INSERT INTO rollback_log (step, status) VALUES ('CONSTRAINTS_REMOVAL_COMPLETE', 'SUCCESS');

-- Step 3: Drop AI-related tables
INSERT INTO rollback_log (step, status) VALUES ('TABLES_REMOVAL_START', 'INFO');

DROP TABLE IF EXISTS health_alerts CASCADE;
DROP TABLE IF EXISTS forecast_results CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS quickbooks_connections CASCADE;
DROP TABLE IF EXISTS quickbooks_sync_logs CASCADE;

INSERT INTO rollback_log (step, status) VALUES ('TABLES_REMOVAL_COMPLETE', 'SUCCESS');

-- Step 4: Remove AI columns from existing tables
INSERT INTO rollback_log (step, status) VALUES ('COLUMN_REMOVAL_START', 'INFO');

ALTER TABLE businesses
DROP COLUMN IF EXISTS health_score_enabled,
DROP COLUMN IF EXISTS last_health_calculation,
DROP COLUMN IF EXISTS quickbooks_company_id,
DROP COLUMN IF EXISTS auto_sync_enabled;

INSERT INTO rollback_log (step, status) VALUES ('COLUMN_REMOVAL_COMPLETE', 'SUCCESS');

-- Step 5: Drop AI-related enums
INSERT INTO rollback_log (step, status) VALUES ('ENUMS_REMOVAL_START', 'INFO');

DROP TYPE IF EXISTS alert_severity_enum CASCADE;
DROP TYPE IF EXISTS alert_type_enum CASCADE;
DROP TYPE IF EXISTS sync_status_enum CASCADE;
DROP TYPE IF EXISTS forecast_type_enum CASCADE;
DROP TYPE IF EXISTS health_trajectory CASCADE;

INSERT INTO rollback_log (step, status) VALUES ('ENUMS_REMOVAL_COMPLETE', 'SUCCESS');

-- Step 6: Update migration tracking
UPDATE migration_rollbacks
SET rollback_applied_at = CURRENT_TIMESTAMP,
    rollback_status = 'completed',
    rollback_notes = 'Complete AI schema rollback executed'
WHERE migration_name LIKE '%health%'
   OR migration_name LIKE '%forecast%'
   OR migration_name LIKE '%quickbooks%'
   OR migration_name LIKE '%alert%';

INSERT INTO rollback_log (step, status) VALUES ('MIGRATION_TRACKING_UPDATE', 'SUCCESS');

-- Step 7: Verify rollback success
INSERT INTO rollback_log (step, status) VALUES ('VERIFICATION_START', 'INFO');

-- Check for remaining AI tables
DO $$
DECLARE
  ai_table_count INTEGER;
  ai_enum_count INTEGER;
  ai_column_count INTEGER;
BEGIN
  -- Check tables
  SELECT COUNT(*) INTO ai_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND (table_name LIKE '%health%'
       OR table_name LIKE '%forecast%'
       OR table_name LIKE '%quickbooks%'
       OR table_name LIKE '%alert%');

  -- Check enums
  SELECT COUNT(*) INTO ai_enum_count
  FROM pg_type
  WHERE typtype = 'e'
  AND (typname LIKE '%health%'
       OR typname LIKE '%forecast%'
       OR typname LIKE '%alert%'
       OR typname LIKE '%sync%');

  -- Check business table columns
  SELECT COUNT(*) INTO ai_column_count
  FROM information_schema.columns
  WHERE table_name = 'businesses'
  AND (column_name LIKE '%health%'
       OR column_name LIKE '%quickbooks%'
       OR column_name LIKE '%sync%');

  IF ai_table_count > 0 OR ai_enum_count > 0 OR ai_column_count > 0 THEN
    INSERT INTO rollback_log (step, status, details) VALUES
    ('VERIFICATION_FAILED', 'ERROR',
     format('Remaining AI objects: %s tables, %s enums, %s columns',
            ai_table_count, ai_enum_count, ai_column_count));
    RAISE EXCEPTION 'Rollback verification failed: AI objects still exist';
  END IF;
END $$;

INSERT INTO rollback_log (step, status) VALUES ('VERIFICATION_COMPLETE', 'SUCCESS');

-- Step 8: Optimize remaining tables
INSERT INTO rollback_log (step, status) VALUES ('OPTIMIZATION_START', 'INFO');

-- Rebuild statistics on modified tables
ANALYZE businesses;
ANALYZE users;
ANALYZE evaluations;

-- Reindex core tables
REINDEX TABLE businesses;

INSERT INTO rollback_log (step, status) VALUES ('OPTIMIZATION_COMPLETE', 'SUCCESS');

-- Final log entry
INSERT INTO rollback_log (step, status, details) VALUES
('ROLLBACK_COMPLETE', 'SUCCESS', 'Complete AI schema rollback executed successfully');

-- Display rollback summary
SELECT
  step,
  status,
  timestamp,
  details
FROM rollback_log
ORDER BY timestamp;

COMMIT;

-- Final verification query (outside transaction)
SELECT
  'Tables' as object_type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%health%' OR table_name LIKE '%forecast%')

UNION ALL

SELECT
  'Enums' as object_type,
  COUNT(*) as count
FROM pg_type
WHERE typtype = 'e'
AND (typname LIKE '%health%' OR typname LIKE '%forecast%')

UNION ALL

SELECT
  'AI Columns in businesses' as object_type,
  COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'businesses'
AND (column_name LIKE '%health%' OR column_name LIKE '%quickbooks%');
```

## Data Recovery Procedures

### Post-Rollback Data Recovery

```sql
-- recover_ai_data.sql
-- Use this script to recover AI data after a rollback if needed

BEGIN TRANSACTION;

-- Step 1: Recreate health_metrics table (if needed for recovery)
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  growth_score INTEGER CHECK (growth_score >= 0 AND growth_score <= 100),
  operational_score INTEGER CHECK (operational_score >= 0 AND operational_score <= 100),
  financial_score INTEGER CHECK (financial_score >= 0 AND financial_score <= 100),
  sale_readiness_score INTEGER CHECK (sale_readiness_score >= 0 AND sale_readiness_score <= 100),
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  trajectory VARCHAR(20) DEFAULT 'stable',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_sources JSONB,
  calculation_metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Recover high-quality health data only
INSERT INTO health_metrics
SELECT * FROM emergency_backup.health_metrics_backup
WHERE confidence_level >= 80
AND overall_score IS NOT NULL
AND business_id IN (SELECT id FROM businesses WHERE status = 'ACTIVE');

-- Step 3: Validate recovered data
SELECT
  COUNT(*) as total_recovered,
  AVG(overall_score) as avg_score,
  MIN(calculated_at) as oldest_data,
  MAX(calculated_at) as newest_data
FROM health_metrics;

COMMIT;
```

## Emergency Recovery Plan

### Complete System Restore

```sql
-- emergency_restore.sql
-- Last resort: restore entire database from pre-migration backup

-- This script should only be used in catastrophic failure scenarios
-- Requires a full database backup from before AI migrations

\echo 'WARNING: This will restore entire database to pre-AI state'
\echo 'All data created after AI migration will be lost'
\echo 'Press Ctrl+C to cancel, or type YES to continue'
\prompt 'Continue with full restore? (YES to confirm): ' confirm

-- Verify confirmation
\if :confirm != 'YES'
  \echo 'Restore cancelled'
  \quit
\endif

-- Terminate all connections
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'goodbuy_hq'
AND pid <> pg_backend_pid();

-- Drop current database
DROP DATABASE goodbuy_hq;

-- Create fresh database
CREATE DATABASE goodbuy_hq;

-- Restore from backup (adjust path as needed)
\! pg_restore -d goodbuy_hq /path/to/pre-ai-backup.sql

\echo 'Emergency restore completed'
\echo 'Please verify all systems are functional'
```

## Rollback Validation Checklist

### Post-Rollback Validation

```sql
-- validation_checklist.sql
-- Run this script after any rollback to verify system integrity

-- 1. Core table integrity
SELECT
  'businesses' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as valid_titles,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as valid_status
FROM businesses

UNION ALL

SELECT
  'users' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as valid_emails,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as valid_status
FROM users;

-- 2. Foreign key integrity
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 3. Check for orphaned data
SELECT 'Orphaned business views' as check_name, COUNT(*) as count
FROM business_views bv
WHERE NOT EXISTS (SELECT 1 FROM businesses b WHERE b.id = bv.business_id)

UNION ALL

SELECT 'Orphaned evaluations' as check_name, COUNT(*) as count
FROM evaluations e
WHERE NOT EXISTS (SELECT 1 FROM businesses b WHERE b.id = e.business_id)

UNION ALL

SELECT 'Orphaned inquiries' as check_name, COUNT(*) as count
FROM inquiries i
WHERE NOT EXISTS (SELECT 1 FROM businesses b WHERE b.id = i.business_id);

-- 4. Verify no AI remnants
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND (column_name LIKE '%health%'
     OR column_name LIKE '%forecast%'
     OR column_name LIKE '%quickbooks%'
     OR column_name LIKE '%ai%')
ORDER BY table_name, column_name;
```

## Monitoring and Alerts

### Rollback Success Monitoring

```sql
-- Create monitoring view for rollback status
CREATE OR REPLACE VIEW rollback_status_monitor AS
SELECT
  mr.migration_name,
  mr.applied_at,
  mr.rollback_applied_at,
  mr.rollback_status,
  mr.rollback_notes,
  CASE
    WHEN mr.rollback_status = 'completed' THEN 'SUCCESS'
    WHEN mr.rollback_status = 'in_progress' THEN 'PENDING'
    WHEN mr.rollback_status = 'failed' THEN 'ERROR'
    ELSE 'UNKNOWN'
  END as status_category
FROM migration_rollbacks mr
WHERE mr.migration_name LIKE '%health%'
   OR mr.migration_name LIKE '%forecast%'
   OR mr.migration_name LIKE '%quickbooks%'
ORDER BY mr.rollback_applied_at DESC;

-- Monitor for rollback anomalies
SELECT
  COUNT(*) as total_rollbacks,
  COUNT(CASE WHEN rollback_status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN rollback_status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN rollback_status = 'in_progress' THEN 1 END) as in_progress
FROM rollback_status_monitor;
```

---

**Document Control:**

- Version: 1.0
- Last Updated: September 3, 2025
- Next Review: September 17, 2025
- Approved By: Database Administrator, Technical Lead
- Emergency Contact: DBA On-Call (+1-555-DBA-HELP)

**Backup Locations:**

- Schema backups: `/backups/postgresql/pre-migration/`
- Recovery scripts: `/scripts/database/recovery/`
- Rollback logs: `/logs/database/rollback/`

This database migration rollback plan ensures safe and complete reversion of all AI Financial Health Analyzer schema changes while preserving core GoodBuy HQ functionality and data integrity.
