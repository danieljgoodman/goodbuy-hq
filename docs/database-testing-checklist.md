# Database Testing Checklist for Brownfield Environment

**Version:** 1.0  
**Date:** September 3, 2025  
**Author:** QA Team  
**Environment:** GoodBuy HQ Brownfield Migration

---

## Executive Summary

This comprehensive testing checklist ensures safe database migrations in the existing GoodBuy HQ production environment. All tests must pass before any migration proceeds to production.

### Testing Phases

1. **Pre-Migration Validation** - Baseline and compatibility testing
2. **Migration Execution Testing** - Real-time migration monitoring
3. **Post-Migration Validation** - Comprehensive functionality verification
4. **Performance Regression Testing** - Ensure no degradation
5. **Rollback Validation Testing** - Verify rollback procedures work

---

## Pre-Migration Validation

### ✅ Environment Setup Checklist

#### Database State Validation

```sql
-- PRE-001: Validate current database state
-- Execute on staging before migration testing

-- Check database connectivity and version
SELECT version(), current_database(), current_user;

-- Verify all existing tables are present and healthy
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Validate referential integrity
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
```

**Expected Results:**

- [ ] PostgreSQL version 14+ confirmed
- [ ] All 16+ existing tables present with expected row counts
- [ ] Zero referential integrity violations
- [ ] Database size within expected bounds

#### Data Integrity Baseline

```bash
#!/bin/bash
# PRE-002: Create data integrity baseline

echo "Creating data integrity baseline..."

# Count records in each critical table
psql $DATABASE_URL -c "
SELECT
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT
  'businesses' as table_name, COUNT(*) as count FROM businesses
UNION ALL
SELECT
  'evaluations' as table_name, COUNT(*) as count FROM evaluations
UNION ALL
SELECT
  'inquiries' as table_name, COUNT(*) as count FROM inquiries;
" > baseline_counts.txt

# Check for any orphaned records
psql $DATABASE_URL -c "
-- Businesses without owners
SELECT 'orphaned_businesses', COUNT(*)
FROM businesses b
LEFT JOIN users u ON b.ownerId = u.id
WHERE u.id IS NULL;
" >> baseline_orphaned.txt

echo "Baseline created: baseline_counts.txt, baseline_orphaned.txt"
```

**Expected Results:**

- [ ] Baseline record counts captured
- [ ] Zero orphaned business records
- [ ] Zero orphaned evaluation records
- [ ] Baseline files created successfully

### ✅ Application Compatibility Testing

#### Existing API Endpoints

```bash
#!/bin/bash
# PRE-003: Test all existing API endpoints

echo "Testing existing API endpoints..."

# Test core business endpoints
curl -f "http://localhost:3000/api/businesses?limit=5" || exit 1
curl -f "http://localhost:3000/api/businesses/test-business-id" || echo "Business detail test requires valid ID"

# Test user authentication
curl -f "http://localhost:3000/api/auth/status" || exit 1

# Test evaluation endpoints
curl -f "http://localhost:3000/api/evaluations?limit=3" || exit 1

# Test search functionality
curl -f "http://localhost:3000/api/search?q=test&type=business" || exit 1

echo "API endpoint testing complete"
```

**Expected Results:**

- [ ] All existing endpoints respond with 200 status
- [ ] Response times within baseline parameters
- [ ] No authentication errors
- [ ] Search functionality working

#### Prisma Schema Validation

```typescript
// PRE-004: Validate Prisma schema compatibility
import { PrismaClient } from '@prisma/client'

async function validatePrismaCompatibility() {
  const prisma = new PrismaClient()

  try {
    // Test all existing models
    const users = await prisma.user.findMany({ take: 1 })
    const businesses = await prisma.business.findMany({ take: 1 })
    const evaluations = await prisma.evaluation.findMany({ take: 1 })

    console.log('✅ User model working:', users.length)
    console.log('✅ Business model working:', businesses.length)
    console.log('✅ Evaluation model working:', evaluations.length)

    // Test relationships
    const businessWithOwner = await prisma.business.findFirst({
      include: { owner: true, evaluations: true },
    })

    console.log(
      '✅ Business relationships working:',
      !!businessWithOwner?.owner
    )
  } catch (error) {
    console.error('❌ Prisma compatibility error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validatePrismaCompatibility()
```

**Expected Results:**

- [ ] All existing Prisma models accessible
- [ ] Relationships working correctly
- [ ] No TypeScript compilation errors
- [ ] Database connection successful

### ✅ Performance Baseline Testing

#### Query Performance Baseline

```sql
-- PRE-005: Establish query performance baselines
-- Run these queries and record execution times

\timing on

-- Business listing query (target: <100ms)
EXPLAIN (ANALYZE, BUFFERS)
SELECT b.id, b.title, b.revenue, b.askingPrice, u.name as owner_name
FROM businesses b
JOIN users u ON b.ownerId = u.id
WHERE b.status = 'ACTIVE'
ORDER BY b.updatedAt DESC
LIMIT 20;

-- User dashboard query (target: <150ms)
EXPLAIN (ANALYZE, BUFFERS)
SELECT
  b.id, b.title, b.revenue,
  COUNT(e.id) as evaluation_count,
  COUNT(i.id) as inquiry_count
FROM businesses b
LEFT JOIN evaluations e ON b.id = e.businessId
LEFT JOIN inquiries i ON b.id = i.businessId
WHERE b.ownerId = 'sample-user-id'
GROUP BY b.id, b.title, b.revenue;

-- Search query performance (target: <200ms)
EXPLAIN (ANALYZE, BUFFERS)
SELECT b.id, b.title, b.description
FROM businesses b
WHERE b.status = 'ACTIVE'
  AND (b.title ILIKE '%restaurant%' OR b.description ILIKE '%restaurant%')
ORDER BY b.priority DESC, b.updatedAt DESC
LIMIT 50;
```

**Expected Results:**

- [ ] Business listing query <100ms execution time
- [ ] User dashboard query <150ms execution time
- [ ] Search query <200ms execution time
- [ ] All queries use appropriate indexes

---

## Migration Execution Testing

### ✅ Migration Process Validation

#### Schema Migration Testing

```bash
#!/bin/bash
# MIG-001: Test migration execution in safe environment

echo "Testing migration execution..."

# Create transaction-wrapped test migration
psql $TEST_DATABASE_URL -c "
BEGIN;

-- Execute migration scripts
\i migrations/001_health_metrics.sql
\i migrations/002_forecasting.sql
\i migrations/003_quickbooks.sql

-- Validate migration success
SELECT 'health_metrics' as table_name, COUNT(*) FROM information_schema.tables WHERE table_name = 'health_metrics';
SELECT 'forecast_results' as table_name, COUNT(*) FROM information_schema.tables WHERE table_name = 'forecast_results';

-- Test rollback capability
SAVEPOINT before_rollback_test;

-- Rollback test
\i rollback/emergency_rollback.sql

-- Verify rollback worked
SELECT 'health_metrics_after_rollback' as test, COUNT(*) FROM information_schema.tables WHERE table_name = 'health_metrics';

-- Restore to test continued execution
ROLLBACK TO SAVEPOINT before_rollback_test;

COMMIT;
"

echo "Migration execution testing complete"
```

**Expected Results:**

- [ ] All migration scripts execute without error
- [ ] New tables created successfully
- [ ] Rollback procedure works correctly
- [ ] Original state restorable

#### Data Migration Validation

```sql
-- MIG-002: Validate data migrations
-- Test population of new tables with existing data

-- Verify health score population from existing evaluations
SELECT
  b.id,
  b.title,
  AVG((e.financialScore + e.operationalScore + e.marketScore) / 3) as calculated_health_score
FROM businesses b
JOIN evaluations e ON b.id = e.businessId
WHERE e.status = 'COMPLETED'
GROUP BY b.id, b.title
LIMIT 5;

-- Verify QuickBooks connections can be created
INSERT INTO quickbooks_connections (business_id, company_id, sync_status)
VALUES ('test-business-id', 'test-company-123', 'pending');

-- Test constraint validation
SELECT COUNT(*) FROM health_metrics WHERE overall_score > 100; -- Should be 0
SELECT COUNT(*) FROM health_metrics WHERE business_id NOT IN (SELECT id FROM businesses); -- Should be 0
```

**Expected Results:**

- [ ] Health scores calculate correctly from existing evaluations
- [ ] Foreign key constraints work properly
- [ ] Check constraints prevent invalid data
- [ ] No data integrity violations

### ✅ Real-Time Migration Monitoring

#### Performance Impact Monitoring

```bash
#!/bin/bash
# MIG-003: Monitor performance during migration

echo "Starting migration performance monitoring..."

# Monitor database connections
psql $DATABASE_URL -c "
SELECT
  COUNT(*) as active_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_queries,
  COUNT(*) FILTER (WHERE waiting) as waiting_queries
FROM pg_stat_activity
WHERE datname = current_database();" &

# Monitor long-running queries
psql $DATABASE_URL -c "
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 minute';" &

# Monitor table locks
psql $DATABASE_URL -c "
SELECT
  t.relname,
  l.locktype,
  l.mode,
  l.granted
FROM pg_locks l
JOIN pg_class t ON l.relation = t.oid
WHERE t.relkind = 'r';" &

echo "Performance monitoring active during migration"
```

**Expected Results:**

- [ ] Database connections remain within normal limits
- [ ] No queries running longer than 5 minutes during migration
- [ ] No excessive table locks preventing normal operations
- [ ] System remains responsive during migration

---

## Post-Migration Validation

### ✅ Functionality Verification

#### Core Feature Testing

```typescript
// POST-001: Comprehensive functionality test
describe('Post-Migration Functionality Tests', () => {
  test('existing business operations unchanged', async () => {
    const business = await prisma.business.create({
      data: {
        title: 'Test Business Post Migration',
        description: 'Testing post-migration',
        ownerId: 'test-owner-id',
      },
    })

    expect(business.id).toBeDefined()
    expect(business.title).toBe('Test Business Post Migration')

    // Test existing relationships still work
    const businessWithOwner = await prisma.business.findUnique({
      where: { id: business.id },
      include: { owner: true },
    })

    expect(businessWithOwner?.owner).toBeDefined()
  })

  test('new health metrics optional and working', async () => {
    const business = await prisma.business.findFirst()

    // Should be able to create health metrics
    const healthMetric = await prisma.healthMetrics.create({
      data: {
        businessId: business.id,
        overallScore: 85,
        growthScore: 90,
        operationalScore: 80,
        financialScore: 85,
        saleReadinessScore: 85,
        confidenceLevel: 92,
      },
    })

    expect(healthMetric.overallScore).toBe(85)
    expect(healthMetric.businessId).toBe(business.id)
  })

  test('existing API endpoints still work', async () => {
    const response = await request(app)
      .get('/api/businesses?limit=5')
      .expect(200)

    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0]).toHaveProperty('title')
    expect(response.body[0]).toHaveProperty('revenue')
  })
})
```

**Expected Results:**

- [ ] All existing business operations work unchanged
- [ ] New health metrics functionality works correctly
- [ ] API endpoints return expected data structure
- [ ] No TypeScript compilation errors

#### Data Integrity Validation

```sql
-- POST-002: Validate data integrity post-migration

-- Check for any data corruption
SELECT
  table_name,
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_name = t.table_name
    AND is_nullable = 'NO'
    AND column_default IS NULL
  ) as required_columns_without_defaults
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verify foreign key relationships
SELECT
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace;

-- Check for orphaned records in new tables
SELECT 'orphaned_health_metrics' as check_name, COUNT(*)
FROM health_metrics hm
LEFT JOIN businesses b ON hm.business_id = b.id
WHERE b.id IS NULL

UNION ALL

SELECT 'orphaned_forecast_results' as check_name, COUNT(*)
FROM forecast_results fr
LEFT JOIN businesses b ON fr.business_id = b.id
WHERE b.id IS NULL;
```

**Expected Results:**

- [ ] No data corruption detected
- [ ] All foreign key relationships intact
- [ ] Zero orphaned records in new tables
- [ ] Required columns have appropriate defaults

### ✅ Integration Testing

#### Full User Journey Testing

```bash
#!/bin/bash
# POST-003: Test complete user journeys

echo "Testing complete user journeys..."

# Test business owner journey
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@goodbuyhq.com", "password": "testpass"}' | jq -r '.token')

# Create business
BUSINESS_ID=$(curl -s -X POST http://localhost:3000/api/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Integration Test Business", "description": "Testing"}' | jq -r '.id')

# Create evaluation
curl -s -X POST http://localhost:3000/api/businesses/$BUSINESS_ID/evaluations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Evaluation", "financialScore": 85}' || exit 1

# Test new health metrics (should be optional)
curl -s -X POST http://localhost:3000/api/businesses/$BUSINESS_ID/health-metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"overallScore": 90}' || echo "Health metrics endpoint not yet available"

echo "User journey testing complete"
```

**Expected Results:**

- [ ] User authentication working
- [ ] Business creation successful
- [ ] Evaluation creation working
- [ ] New endpoints optional and non-breaking

---

## Performance Regression Testing

### ✅ Query Performance Validation

#### Critical Query Performance

```sql
-- PERF-001: Validate query performance hasn't regressed

\timing on

-- Test 1: Business listing (baseline: <100ms)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT b.id, b.title, b.revenue, b.askingPrice, u.name as owner_name
FROM businesses b
JOIN users u ON b.ownerId = u.id
WHERE b.status = 'ACTIVE'
ORDER BY b.updatedAt DESC
LIMIT 20;

-- Test 2: Business with optional health score (new query, target: <120ms)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT
  b.id, b.title, b.revenue,
  hm.overall_score,
  hm.trajectory
FROM businesses b
LEFT JOIN LATERAL (
  SELECT overall_score, trajectory
  FROM health_metrics
  WHERE business_id = b.id
  ORDER BY created_at DESC
  LIMIT 1
) hm ON true
WHERE b.status = 'ACTIVE'
ORDER BY b.updatedAt DESC
LIMIT 20;

-- Test 3: User dashboard with new features (target: <200ms)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT
  b.id, b.title, b.revenue,
  COUNT(e.id) as evaluation_count,
  COUNT(i.id) as inquiry_count,
  hm.overall_score
FROM businesses b
LEFT JOIN evaluations e ON b.id = e.businessId
LEFT JOIN inquiries i ON b.id = i.businessId
LEFT JOIN LATERAL (
  SELECT overall_score
  FROM health_metrics
  WHERE business_id = b.id
  ORDER BY created_at DESC
  LIMIT 1
) hm ON true
WHERE b.ownerId = 'sample-user-id'
GROUP BY b.id, b.title, b.revenue, hm.overall_score;
```

**Performance Thresholds:**

- [ ] Business listing query <100ms (no regression)
- [ ] Business with health score <120ms (20% overhead acceptable)
- [ ] User dashboard <200ms (no more than 30% increase)
- [ ] All queries use appropriate indexes

#### Load Testing

```bash
#!/bin/bash
# PERF-002: Load testing with new schema

echo "Starting load testing..."

# Install artillery if not present
npm install -g artillery || echo "Artillery already installed"

# Create load test configuration
cat > load-test-config.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Business listing load test"
    requests:
      - get:
          url: "/api/businesses?limit=20"

  - name: "Business detail load test"
    requests:
      - get:
          url: "/api/businesses/{{ \$randomString() }}"

  - name: "Search load test"
    requests:
      - get:
          url: "/api/search?q=restaurant&type=business"
EOF

# Execute load test
artillery run load-test-config.yml

echo "Load testing complete"
```

**Expected Results:**

- [ ] API response times remain within 95th percentile baselines
- [ ] No significant increase in error rates under load
- [ ] Database connection pool handles increased load
- [ ] System remains stable during extended load

---

## Rollback Validation Testing

### ✅ Emergency Rollback Testing

#### Rollback Speed Testing

```bash
#!/bin/bash
# ROLL-001: Test emergency rollback speed

echo "Testing emergency rollback procedures..."

START_TIME=$(date +%s)

# Execute emergency rollback
./emergency-rollback.sh

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "Emergency rollback completed in $DURATION seconds"

# Validate rollback success
if [ $DURATION -le 300 ]; then  # 5 minutes = 300 seconds
  echo "✅ Rollback completed within 5-minute target"
else
  echo "❌ Rollback took longer than 5-minute target: $DURATION seconds"
  exit 1
fi

# Test system functionality post-rollback
curl -f http://localhost:3000/api/businesses?limit=5 || {
  echo "❌ System not functional after rollback"
  exit 1
}

echo "Emergency rollback testing successful"
```

**Expected Results:**

- [ ] Rollback completes within 5 minutes
- [ ] All core functionality restored
- [ ] No data loss during rollback
- [ ] System fully operational post-rollback

#### Data Preservation Testing

```sql
-- ROLL-002: Validate data preservation during rollback

-- Before rollback: Check data exists
SELECT COUNT(*) as health_metrics_count FROM health_metrics;
SELECT COUNT(*) as forecast_count FROM forecast_results;

-- After rollback: Check data preserved in backup schema
SELECT COUNT(*) as preserved_health_metrics
FROM emergency_backup.health_metrics;

SELECT COUNT(*) as preserved_forecasts
FROM emergency_backup.forecast_results;

-- Verify existing data untouched
SELECT COUNT(*) as businesses_count FROM businesses;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as evaluations_count FROM evaluations;
```

**Expected Results:**

- [ ] New feature data preserved in backup schema
- [ ] Existing data completely untouched
- [ ] Data recovery possible from backup
- [ ] No referential integrity violations

---

## Security Testing

### ✅ Access Control Validation

#### Database Security Testing

```sql
-- SEC-001: Validate database security

-- Test row-level security still works
SELECT
  schemaname,
  tablename,
  rowsecurity,
  pg_has_role(current_user, 'pg_read_all_data', 'MEMBER') as has_read_access
FROM pg_tables
WHERE schemaname = 'public';

-- Verify encryption for sensitive fields
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'quickbooks_connections'
  AND column_name LIKE '%token%';

-- Test permissions on new tables
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('health_metrics', 'forecast_results', 'quickbooks_connections');
```

**Expected Results:**

- [ ] Row-level security policies intact
- [ ] Sensitive fields properly encrypted
- [ ] Appropriate permissions on new tables
- [ ] No unauthorized access possible

---

## Final Checklist

### ✅ Migration Readiness Validation

#### All Systems Go Checklist

**Pre-Migration:**

- [ ] All baseline tests pass
- [ ] Performance baselines established
- [ ] Test environment mirrors production
- [ ] Rollback procedures tested and validated
- [ ] Team trained on rollback procedures

**During Migration:**

- [ ] Real-time monitoring active
- [ ] Performance metrics within thresholds
- [ ] No long-running locks detected
- [ ] Rollback capability confirmed

**Post-Migration:**

- [ ] All functionality tests pass
- [ ] Performance regression tests pass
- [ ] Data integrity validation complete
- [ ] User acceptance testing successful
- [ ] Production monitoring active

**Final Sign-off:**

- [ ] Database Administrator approval
- [ ] Technical Lead approval
- [ ] QA Lead approval
- [ ] Product Owner approval (if user-facing changes)

### Documentation Requirements

- [ ] Test execution results documented
- [ ] Performance benchmark comparison
- [ ] Any issues encountered and resolved
- [ ] Rollback readiness confirmed
- [ ] Post-migration monitoring plan active

---

## Automated Test Execution

### Continuous Integration Integration

```yaml
# .github/workflows/database-migration-testing.yml
name: Database Migration Testing

on:
  pull_request:
    paths:
      - 'prisma/**'
      - 'migrations/**'

jobs:
  migration-testing:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: |
          npm run db:setup:test
          npm run db:seed:test

      - name: Run migration tests
        run: |
          npm run test:migration:compatibility
          npm run test:migration:performance  
          npm run test:migration:rollback

      - name: Validate rollback procedures
        run: |
          npm run test:rollback:emergency
          npm run test:rollback:planned
```

This comprehensive testing checklist ensures that every aspect of the database migration is thoroughly validated before, during, and after execution in the brownfield GoodBuy HQ environment.
