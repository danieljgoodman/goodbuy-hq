# Backward Compatibility Testing Procedures

**Version:** 1.0  
**Date:** September 3, 2025  
**Author:** QA Engineering Team  
**Environment:** GoodBuy HQ Brownfield Database Migration

---

## Executive Summary

This document provides comprehensive testing procedures to ensure that database migrations for the AI Financial Health Analyzer maintain 100% backward compatibility with existing GoodBuy HQ functionality. All existing user workflows, API endpoints, and business processes must continue to function without disruption.

### Compatibility Assurance Goals

1. **Zero Breaking Changes**: No existing functionality impacted
2. **API Stability**: All current endpoints maintain exact same behavior
3. **Data Integrity**: Existing data remains accessible and unchanged
4. **Performance Preservation**: No degradation in existing query performance
5. **User Experience Continuity**: Seamless transition for existing users

---

## Testing Strategy Framework

### Testing Levels

#### Level 1: Database Schema Compatibility

- **Focus**: Ensure schema changes don't break existing queries
- **Scope**: Database structure, constraints, indexes
- **Tools**: SQL validation, Prisma schema validation

#### Level 2: Application Layer Compatibility

- **Focus**: Ensure ORM and application code continues working
- **Scope**: Prisma models, TypeScript compilation, API routes
- **Tools**: Unit tests, integration tests, TypeScript compiler

#### Level 3: API Endpoint Compatibility

- **Focus**: Ensure all existing endpoints return same responses
- **Scope**: REST API, GraphQL endpoints, authentication
- **Tools**: API testing, contract testing, end-to-end testing

#### Level 4: User Workflow Compatibility

- **Focus**: Ensure complete user journeys work unchanged
- **Scope**: Frontend functionality, business processes, integrations
- **Tools**: User acceptance testing, regression testing

---

## Pre-Migration Compatibility Baseline

### Database Schema Baseline

#### Current Schema Documentation

```sql
-- baseline-schema-capture.sql
-- Capture complete current schema before any changes

-- Generate comprehensive schema documentation
SELECT
  'TABLE' as object_type,
  table_name as object_name,
  '' as definition
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
  'COLUMN' as object_type,
  table_name || '.' || column_name as object_name,
  data_type ||
  CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
  CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END
FROM information_schema.columns
WHERE table_schema = 'public'

UNION ALL

SELECT
  'CONSTRAINT' as object_type,
  constraint_name as object_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'

ORDER BY object_type, object_name;
```

#### Critical Query Patterns Identification

```sql
-- critical-query-patterns.sql
-- Identify all existing query patterns that must continue working

-- Common business listing patterns
EXPLAIN (FORMAT JSON)
SELECT b.id, b.title, b.revenue, b.askingPrice, u.name as owner_name
FROM businesses b
JOIN users u ON b.ownerId = u.id
WHERE b.status = 'ACTIVE'
ORDER BY b.updatedAt DESC;

-- User dashboard patterns
EXPLAIN (FORMAT JSON)
SELECT
  b.id, b.title, b.revenue,
  COUNT(e.id) as evaluation_count,
  COUNT(i.id) as inquiry_count
FROM businesses b
LEFT JOIN evaluations e ON b.id = e.businessId
LEFT JOIN inquiries i ON b.id = i.businessId
WHERE b.ownerId = $1
GROUP BY b.id, b.title, b.revenue;

-- Search and filtering patterns
EXPLAIN (FORMAT JSON)
SELECT b.id, b.title, b.description, b.industry
FROM businesses b
WHERE b.status = 'ACTIVE'
  AND b.revenue BETWEEN $1 AND $2
  AND ($3 IS NULL OR b.industry = $3)
ORDER BY b.priority DESC, b.updatedAt DESC;

-- Evaluation system patterns
EXPLAIN (FORMAT JSON)
SELECT e.*, b.title as business_title
FROM evaluations e
JOIN businesses b ON e.businessId = b.id
WHERE e.evaluatorId = $1
  AND e.status = 'COMPLETED'
ORDER BY e.updatedAt DESC;
```

### API Response Baseline

#### API Contract Capture

```bash
#!/bin/bash
# capture-api-contracts.sh
# Document all existing API responses before migration

ENDPOINTS=(
  "GET /api/businesses"
  "GET /api/businesses/{id}"
  "POST /api/businesses"
  "PUT /api/businesses/{id}"
  "DELETE /api/businesses/{id}"
  "GET /api/businesses/{id}/evaluations"
  "POST /api/businesses/{id}/evaluations"
  "GET /api/evaluations"
  "GET /api/evaluations/{id}"
  "GET /api/users/me"
  "GET /api/users/{id}/businesses"
  "GET /api/search"
  "GET /api/inquiries"
  "POST /api/inquiries"
)

mkdir -p baseline-contracts

for endpoint in "${ENDPOINTS[@]}"; do
  METHOD=$(echo $endpoint | cut -d' ' -f1)
  PATH=$(echo $endpoint | cut -d' ' -f2)

  # Replace path parameters with actual IDs for testing
  ACTUAL_PATH=$(echo $PATH | sed 's/{id}/test-business-id/g')

  echo "Capturing baseline for $METHOD $PATH"

  # Capture response structure and validate against schema
  case $METHOD in
    "GET")
      curl -s -X GET "http://localhost:3000$ACTUAL_PATH" \
        -H "Authorization: Bearer $TEST_TOKEN" | \
        jq '.' > "baseline-contracts/${METHOD}_${PATH//\//_}.json"
      ;;
    "POST"|"PUT")
      # Use minimal valid payload for structure testing
      curl -s -X $METHOD "http://localhost:3000$ACTUAL_PATH" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEST_TOKEN" \
        -d '{"title":"Test","description":"Test"}' | \
        jq '.' > "baseline-contracts/${METHOD}_${PATH//\//_}.json"
      ;;
  esac
done

echo "API contract baseline captured in baseline-contracts/"
```

### Performance Baseline

#### Query Performance Benchmarks

```typescript
// performance-baseline.ts
interface QueryBenchmark {
  queryName: string
  averageExecutionTime: number
  medianExecutionTime: number
  percentile95: number
  percentile99: number
  sampleSize: number
  baselineDate: Date
}

class PerformanceBaseline {
  async captureBaseline(): Promise<QueryBenchmark[]> {
    const criticalQueries = [
      {
        name: 'business_listing',
        query: `
          SELECT b.id, b.title, b.revenue, b.askingPrice, u.name as owner_name
          FROM businesses b 
          JOIN users u ON b.ownerId = u.id 
          WHERE b.status = 'ACTIVE' 
          ORDER BY b.updatedAt DESC 
          LIMIT 20
        `,
      },
      {
        name: 'user_dashboard',
        query: `
          SELECT 
            b.id, b.title, b.revenue,
            COUNT(e.id) as evaluation_count,
            COUNT(i.id) as inquiry_count
          FROM businesses b 
          LEFT JOIN evaluations e ON b.id = e.businessId
          LEFT JOIN inquiries i ON b.id = i.businessId
          WHERE b.ownerId = $1
          GROUP BY b.id, b.title, b.revenue
        `,
      },
      {
        name: 'business_search',
        query: `
          SELECT b.id, b.title, b.description 
          FROM businesses b
          WHERE b.status = 'ACTIVE' 
            AND (b.title ILIKE '%' || $1 || '%' OR b.description ILIKE '%' || $1 || '%')
          ORDER BY b.priority DESC, b.updatedAt DESC
          LIMIT 50
        `,
      },
    ]

    const benchmarks: QueryBenchmark[] = []

    for (const queryDef of criticalQueries) {
      const benchmark = await this.benchmarkQuery(queryDef.name, queryDef.query)
      benchmarks.push(benchmark)
    }

    await this.saveBaseline(benchmarks)
    return benchmarks
  }

  private async benchmarkQuery(
    name: string,
    query: string
  ): Promise<QueryBenchmark> {
    const executions: number[] = []
    const sampleSize = 100

    for (let i = 0; i < sampleSize; i++) {
      const startTime = performance.now()
      await this.executeQuery(query)
      const endTime = performance.now()
      executions.push(endTime - startTime)
    }

    executions.sort((a, b) => a - b)

    return {
      queryName: name,
      averageExecutionTime:
        executions.reduce((sum, time) => sum + time, 0) / sampleSize,
      medianExecutionTime: executions[Math.floor(sampleSize / 2)],
      percentile95: executions[Math.floor(sampleSize * 0.95)],
      percentile99: executions[Math.floor(sampleSize * 0.99)],
      sampleSize,
      baselineDate: new Date(),
    }
  }
}
```

---

## Migration Compatibility Testing

### Database Level Compatibility Tests

#### Schema Structure Validation

```sql
-- schema-compatibility-test.sql
-- Validate that existing schema elements remain unchanged

-- Test 1: Verify all original tables still exist
WITH expected_tables AS (
  VALUES
    ('users'), ('businesses'), ('evaluations'), ('favorites'),
    ('inquiries'), ('communication_threads'), ('messages'),
    ('meetings'), ('shared_documents'), ('notifications')
)
SELECT
  expected.column1 as table_name,
  CASE WHEN actual.table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM expected_tables expected
LEFT JOIN information_schema.tables actual ON expected.column1 = actual.table_name
WHERE actual.table_schema = 'public' OR actual.table_name IS NULL;

-- Test 2: Verify critical columns unchanged
WITH critical_columns AS (
  VALUES
    ('businesses', 'id', 'text'),
    ('businesses', 'title', 'text'),
    ('businesses', 'revenue', 'numeric'),
    ('businesses', 'ownerId', 'text'),
    ('users', 'id', 'text'),
    ('users', 'email', 'text'),
    ('evaluations', 'businessId', 'text'),
    ('evaluations', 'financialScore', 'integer')
)
SELECT
  cc.column1 as table_name,
  cc.column2 as column_name,
  cc.column3 as expected_type,
  COALESCE(ic.data_type, 'MISSING') as actual_type,
  CASE
    WHEN ic.data_type IS NULL THEN 'COLUMN_MISSING'
    WHEN ic.data_type != cc.column3 THEN 'TYPE_CHANGED'
    ELSE 'OK'
  END as status
FROM critical_columns cc
LEFT JOIN information_schema.columns ic ON
  cc.column1 = ic.table_name AND
  cc.column2 = ic.column_name AND
  ic.table_schema = 'public';

-- Test 3: Verify foreign key relationships preserved
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  'PRESERVED' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('businesses', 'evaluations', 'inquiries', 'favorites');
```

#### Data Access Compatibility

```sql
-- data-access-compatibility.sql
-- Ensure existing data remains accessible with same queries

-- Test 1: Basic business queries still work
SELECT 'business_count' as metric, COUNT(*) as value FROM businesses
UNION ALL
SELECT 'active_business_count' as metric, COUNT(*) as value FROM businesses WHERE status = 'ACTIVE'
UNION ALL
SELECT 'user_count' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'evaluation_count' as metric, COUNT(*) as value FROM evaluations;

-- Test 2: Complex joins still function
SELECT
  'businesses_with_owners' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM businesses b
JOIN users u ON b.ownerId = u.id
WHERE b.status = 'ACTIVE'

UNION ALL

SELECT
  'evaluations_with_businesses' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM evaluations e
JOIN businesses b ON e.businessId = b.id
WHERE e.status = 'COMPLETED';

-- Test 3: Aggregation queries work correctly
SELECT
  'avg_business_revenue' as test,
  ROUND(AVG(revenue::numeric), 2) as value,
  CASE WHEN AVG(revenue::numeric) > 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM businesses
WHERE revenue IS NOT NULL AND revenue > 0;
```

### Application Level Compatibility Tests

#### Prisma Model Compatibility

```typescript
// prisma-compatibility.test.ts
describe('Prisma Model Compatibility', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Core Model Operations', () => {
    test('User model - all existing fields accessible', async () => {
      const users = await prisma.user.findMany({ take: 1 })

      if (users.length > 0) {
        const user = users[0]

        // Verify all critical fields exist and are typed correctly
        expect(typeof user.id).toBe('string')
        expect(typeof user.email).toBe('string')
        expect(user.userType).toBeDefined()
        expect(user.status).toBeDefined()
        expect(user.createdAt).toBeInstanceOf(Date)

        // New fields should be optional
        expect(() => user.healthScore).not.toThrow() // May be undefined, that's OK
      }
    })

    test('Business model - existing relationships intact', async () => {
      const business = await prisma.business.findFirst({
        include: {
          owner: true,
          evaluations: true,
          favorites: true,
          inquiries: true,
        },
      })

      if (business) {
        // Verify core fields
        expect(typeof business.id).toBe('string')
        expect(typeof business.title).toBe('string')
        expect(typeof business.ownerId).toBe('string')

        // Verify relationships still work
        expect(business.owner).toBeDefined()
        expect(business.owner.id).toBe(business.ownerId)
        expect(Array.isArray(business.evaluations)).toBe(true)
        expect(Array.isArray(business.favorites)).toBe(true)
        expect(Array.isArray(business.inquiries)).toBe(true)

        // New optional fields
        if (business.healthScore !== undefined) {
          expect(typeof business.healthScore).toBe('number')
          expect(business.healthScore).toBeGreaterThanOrEqual(0)
          expect(business.healthScore).toBeLessThanOrEqual(100)
        }
      }
    })

    test('Evaluation model - unchanged functionality', async () => {
      const evaluation = await prisma.evaluation.findFirst({
        include: {
          business: true,
          evaluator: true,
        },
      })

      if (evaluation) {
        // Core fields preserved
        expect(typeof evaluation.id).toBe('string')
        expect(typeof evaluation.businessId).toBe('string')
        expect(typeof evaluation.evaluatorId).toBe('string')
        expect(typeof evaluation.financialScore).toBe('number')
        expect(typeof evaluation.operationalScore).toBe('number')
        expect(typeof evaluation.marketScore).toBe('number')

        // Relationships preserved
        expect(evaluation.business).toBeDefined()
        expect(evaluation.evaluator).toBeDefined()
        expect(evaluation.business.id).toBe(evaluation.businessId)
      }
    })
  })

  describe('Query Operations', () => {
    test('Complex queries with joins still work', async () => {
      const businessesWithEvaluations = await prisma.business.findMany({
        include: {
          evaluations: {
            where: {
              status: 'COMPLETED',
            },
          },
          owner: true,
        },
        where: {
          status: 'ACTIVE',
        },
        take: 5,
      })

      expect(Array.isArray(businessesWithEvaluations)).toBe(true)

      businessesWithEvaluations.forEach(business => {
        expect(business.owner).toBeDefined()
        expect(Array.isArray(business.evaluations)).toBe(true)
      })
    })

    test('Aggregation queries function correctly', async () => {
      const businessStats = await prisma.business.aggregate({
        where: {
          status: 'ACTIVE',
          revenue: {
            gt: 0,
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          revenue: true,
        },
      })

      expect(businessStats._count.id).toBeGreaterThanOrEqual(0)
      if (businessStats._avg.revenue) {
        expect(businessStats._avg.revenue.toNumber()).toBeGreaterThan(0)
      }
    })
  })

  describe('Transaction Operations', () => {
    test('Database transactions work with existing models', async () => {
      const testEmail = `test-${Date.now()}@compatibility.test`

      await prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            email: testEmail,
            userType: 'BUSINESS_OWNER',
          },
        })

        const business = await tx.business.create({
          data: {
            title: 'Compatibility Test Business',
            description: 'Testing transaction compatibility',
            ownerId: user.id,
          },
        })

        // Verify relationship works in transaction
        const businessWithOwner = await tx.business.findUnique({
          where: { id: business.id },
          include: { owner: true },
        })

        expect(businessWithOwner?.owner.email).toBe(testEmail)

        // Clean up - rollback is handled by test framework
        await tx.business.delete({ where: { id: business.id } })
        await tx.user.delete({ where: { id: user.id } })
      })
    })
  })
})
```

### API Endpoint Compatibility Tests

#### REST API Contract Testing

```typescript
// api-compatibility.test.ts
describe('API Endpoint Compatibility', () => {
  const baseURL = 'http://localhost:3000'
  let authToken: string

  beforeAll(async () => {
    // Get auth token for testing
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@goodbuyhq.com',
        password: 'testpassword',
      }),
    })
    const loginData = await loginResponse.json()
    authToken = loginData.token
  })

  describe('Business Endpoints', () => {
    test('GET /api/businesses - response structure unchanged', async () => {
      const response = await fetch(`${baseURL}/api/businesses?limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)

      if (data.length > 0) {
        const business = data[0]

        // Verify required fields still present
        expect(business).toHaveProperty('id')
        expect(business).toHaveProperty('title')
        expect(business).toHaveProperty('description')
        expect(business).toHaveProperty('ownerId')
        expect(business).toHaveProperty('status')
        expect(business).toHaveProperty('createdAt')
        expect(business).toHaveProperty('updatedAt')

        // Optional fields should not break existing clients
        if (business.healthScore !== undefined) {
          expect(typeof business.healthScore).toBe('number')
        }
      }
    })

    test('GET /api/businesses/{id} - detailed response structure', async () => {
      // First get a business ID
      const listResponse = await fetch(`${baseURL}/api/businesses?limit=1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const businesses = await listResponse.json()

      if (businesses.length === 0) return // Skip if no businesses

      const businessId = businesses[0].id
      const response = await fetch(`${baseURL}/api/businesses/${businessId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.status).toBe(200)
      const business = await response.json()

      // Verify all existing fields present
      expect(business.id).toBe(businessId)
      expect(typeof business.title).toBe('string')
      expect(typeof business.description).toBe('string')
      expect(typeof business.ownerId).toBe('string')

      // Verify optional financial fields still work
      if (business.revenue !== null) {
        expect(typeof business.revenue).toBe('number')
      }
      if (business.profit !== null) {
        expect(typeof business.profit).toBe('number')
      }
    })

    test('POST /api/businesses - creation still works', async () => {
      const newBusiness = {
        title: 'Compatibility Test Business',
        description: 'Testing backward compatibility',
        industry: 'TECHNOLOGY',
        location: 'San Francisco, CA',
      }

      const response = await fetch(`${baseURL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newBusiness),
      })

      expect(response.status).toBe(201)
      const business = await response.json()

      expect(business.title).toBe(newBusiness.title)
      expect(business.description).toBe(newBusiness.description)
      expect(business.id).toBeDefined()
      expect(business.ownerId).toBeDefined()

      // Clean up
      await fetch(`${baseURL}/api/businesses/${business.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
    })
  })

  describe('Evaluation Endpoints', () => {
    test('GET /api/evaluations - response structure preserved', async () => {
      const response = await fetch(`${baseURL}/api/evaluations?limit=3`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)

      if (data.length > 0) {
        const evaluation = data[0]

        // Core evaluation fields must be present
        expect(evaluation).toHaveProperty('id')
        expect(evaluation).toHaveProperty('businessId')
        expect(evaluation).toHaveProperty('evaluatorId')
        expect(evaluation).toHaveProperty('financialScore')
        expect(evaluation).toHaveProperty('operationalScore')
        expect(evaluation).toHaveProperty('marketScore')
        expect(evaluation).toHaveProperty('status')
      }
    })
  })

  describe('User Endpoints', () => {
    test('GET /api/users/me - profile structure unchanged', async () => {
      const response = await fetch(`${baseURL}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.status).toBe(200)
      const user = await response.json()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('userType')
      expect(user).toHaveProperty('status')

      // Sensitive fields should not be exposed
      expect(user).not.toHaveProperty('hashedPassword')
    })
  })

  describe('Search Endpoints', () => {
    test('GET /api/search - search functionality preserved', async () => {
      const response = await fetch(
        `${baseURL}/api/search?q=test&type=business&limit=5`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('results')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('limit')
      expect(Array.isArray(data.results)).toBe(true)
    })
  })
})
```

### User Workflow Compatibility Tests

#### Critical User Journey Tests

```typescript
// user-workflow-compatibility.test.ts
describe('User Workflow Compatibility', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()

    // Login
    await page.goto('http://localhost:3000/login')
    await page.type('[name="email"]', 'test@goodbuyhq.com')
    await page.type('[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Business Owner Workflow', () => {
    test('Create new business listing', async () => {
      // Navigate to create business page
      await page.goto('http://localhost:3000/dashboard/businesses/new')
      await page.waitForSelector('form')

      // Fill out business form with required fields only
      await page.type('[name="title"]', 'E2E Compatibility Test Business')
      await page.type('[name="description"]', 'Testing workflow compatibility')
      await page.select('[name="industry"]', 'TECHNOLOGY')
      await page.type('[name="location"]', 'San Francisco, CA')
      await page.type('[name="revenue"]', '1000000')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to business detail page
      await page.waitForNavigation()
      expect(page.url()).toContain('/businesses/')

      // Verify business was created successfully
      const title = await page.$eval('h1', el => el.textContent)
      expect(title).toContain('E2E Compatibility Test Business')
    })

    test('View business dashboard', async () => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForSelector('[data-testid="business-list"]')

      // Should see list of user's businesses
      const businessCards = await page.$$('[data-testid="business-card"]')
      expect(businessCards.length).toBeGreaterThan(0)

      // Each business card should have expected elements
      for (const card of businessCards.slice(0, 3)) {
        // Test first 3
        const title = await card.$eval(
          '[data-testid="business-title"]',
          el => el.textContent
        )
        const status = await card.$eval(
          '[data-testid="business-status"]',
          el => el.textContent
        )

        expect(title).toBeTruthy()
        expect(status).toBeTruthy()
      }
    })

    test('Request business evaluation', async () => {
      // Go to first business detail page
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForSelector('[data-testid="business-card"]')

      const firstBusinessLink = await page.$('[data-testid="business-card"] a')
      await firstBusinessLink?.click()
      await page.waitForNavigation()

      // Look for evaluation section
      await page.waitForSelector('[data-testid="evaluations-section"]')

      // Should be able to request new evaluation
      const requestEvalButton = await page.$(
        '[data-testid="request-evaluation"]'
      )
      if (requestEvalButton) {
        await requestEvalButton.click()
        await page.waitForSelector('[data-testid="evaluation-form"]')

        // Fill basic evaluation request
        await page.type('[name="title"]', 'Compatibility Test Evaluation')
        await page.click('button[type="submit"]')

        // Should show success message or redirect
        await page.waitForSelector(
          '[data-testid="evaluation-success"], [data-testid="evaluations-list"]',
          {
            timeout: 5000,
          }
        )
      }
    })
  })

  describe('Buyer Workflow', () => {
    test('Browse and search businesses', async () => {
      await page.goto('http://localhost:3000/marketplace')
      await page.waitForSelector('[data-testid="business-listings"]')

      // Should see business listings
      const listings = await page.$$('[data-testid="business-listing"]')
      expect(listings.length).toBeGreaterThan(0)

      // Test search functionality
      await page.type('[data-testid="search-input"]', 'restaurant')
      await page.click('[data-testid="search-button"]')
      await page.waitForSelector('[data-testid="search-results"]')

      // Should show filtered results
      const searchResults = await page.$$('[data-testid="business-listing"]')
      expect(searchResults.length).toBeGreaterThanOrEqual(0)
    })

    test('View business details', async () => {
      await page.goto('http://localhost:3000/marketplace')
      await page.waitForSelector('[data-testid="business-listing"]')

      // Click on first business
      const firstListing = await page.$('[data-testid="business-listing"] a')
      await firstListing?.click()
      await page.waitForNavigation()

      // Should see business details
      await page.waitForSelector('[data-testid="business-detail"]')

      const title = await page.$eval('h1', el => el.textContent)
      expect(title).toBeTruthy()

      // Should see key business information
      await page.waitForSelector('[data-testid="business-info"]')
      await page.waitForSelector('[data-testid="business-financials"]')
    })

    test('Send inquiry about business', async () => {
      // Navigate to a business detail page
      await page.goto('http://localhost:3000/marketplace')
      await page.waitForSelector('[data-testid="business-listing"]')

      const firstListing = await page.$('[data-testid="business-listing"] a')
      await firstListing?.click()
      await page.waitForNavigation()

      // Look for inquiry form or button
      const inquiryButton = await page.$('[data-testid="send-inquiry"]')
      if (inquiryButton) {
        await inquiryButton.click()
        await page.waitForSelector('[data-testid="inquiry-form"]')

        // Fill out inquiry form
        await page.type('[name="subject"]', 'Interest in Business Purchase')
        await page.type(
          '[name="message"]',
          'I am interested in learning more about this business opportunity.'
        )
        await page.type('[name="contactName"]', 'Test Buyer')
        await page.type('[name="contactEmail"]', 'buyer@test.com')

        await page.click('button[type="submit"]')

        // Should show success message
        await page.waitForSelector('[data-testid="inquiry-success"]')
      }
    })
  })
})
```

---

## Performance Regression Testing

### Query Performance Validation

#### Automated Performance Comparison

```typescript
// performance-regression.test.ts
describe('Performance Regression Testing', () => {
  let performanceBaseline: QueryBenchmark[]
  let performanceMonitor: PerformanceMonitor

  beforeAll(async () => {
    performanceBaseline = await loadPerformanceBaseline()
    performanceMonitor = new PerformanceMonitor()
  })

  describe('Critical Query Performance', () => {
    test('Business listing query performance', async () => {
      const query = `
        SELECT b.id, b.title, b.revenue, b.askingPrice, u.name as owner_name
        FROM businesses b 
        JOIN users u ON b.ownerId = u.id 
        WHERE b.status = 'ACTIVE' 
        ORDER BY b.updatedAt DESC 
        LIMIT 20
      `

      const currentBenchmark = await performanceMonitor.benchmarkQuery(
        'business_listing',
        query
      )
      const baseline = performanceBaseline.find(
        b => b.queryName === 'business_listing'
      )

      if (baseline) {
        // Allow up to 10% performance regression
        const regressionThreshold = baseline.percentile95 * 1.1

        expect(currentBenchmark.percentile95).toBeLessThan(regressionThreshold)
        expect(currentBenchmark.averageExecutionTime).toBeLessThan(
          baseline.averageExecutionTime * 1.1
        )

        console.log(`Query: ${currentBenchmark.queryName}`)
        console.log(`Baseline P95: ${baseline.percentile95}ms`)
        console.log(`Current P95: ${currentBenchmark.percentile95}ms`)
        console.log(
          `Regression: ${(((currentBenchmark.percentile95 - baseline.percentile95) / baseline.percentile95) * 100).toFixed(2)}%`
        )
      }
    })

    test('User dashboard query performance', async () => {
      const query = `
        SELECT 
          b.id, b.title, b.revenue,
          COUNT(e.id) as evaluation_count,
          COUNT(i.id) as inquiry_count
        FROM businesses b 
        LEFT JOIN evaluations e ON b.id = e.businessId
        LEFT JOIN inquiries i ON b.id = i.businessId
        WHERE b.ownerId = $1
        GROUP BY b.id, b.title, b.revenue
      `

      const currentBenchmark = await performanceMonitor.benchmarkQuery(
        'user_dashboard',
        query
      )
      const baseline = performanceBaseline.find(
        b => b.queryName === 'user_dashboard'
      )

      if (baseline) {
        expect(currentBenchmark.percentile95).toBeLessThan(
          baseline.percentile95 * 1.1
        )
        expect(currentBenchmark.averageExecutionTime).toBeLessThan(
          baseline.averageExecutionTime * 1.1
        )
      }
    })

    test('Business search query performance', async () => {
      const query = `
        SELECT b.id, b.title, b.description 
        FROM businesses b
        WHERE b.status = 'ACTIVE' 
          AND (b.title ILIKE '%restaurant%' OR b.description ILIKE '%restaurant%')
        ORDER BY b.priority DESC, b.updatedAt DESC
        LIMIT 50
      `

      const currentBenchmark = await performanceMonitor.benchmarkQuery(
        'business_search',
        query
      )
      const baseline = performanceBaseline.find(
        b => b.queryName === 'business_search'
      )

      if (baseline) {
        expect(currentBenchmark.percentile95).toBeLessThan(
          baseline.percentile95 * 1.15
        ) // Allow 15% for search queries
      }
    })
  })

  describe('New Query Performance', () => {
    test('Business with optional health score query', async () => {
      const query = `
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
        LIMIT 20
      `

      const benchmark = await performanceMonitor.benchmarkQuery(
        'business_with_health',
        query
      )

      // New query should be reasonable - target <150ms for 95th percentile
      expect(benchmark.percentile95).toBeLessThan(150)
      expect(benchmark.averageExecutionTime).toBeLessThan(100)
    })
  })
})
```

---

## Rollback Compatibility Validation

### Rollback Impact Testing

#### Rollback Simulation Tests

```bash
#!/bin/bash
# rollback-compatibility-test.sh

echo "Testing rollback compatibility..."

# 1. Capture current state
echo "Capturing pre-rollback state..."
pg_dump $DATABASE_URL > pre_rollback_state.sql

# 2. Execute migration
echo "Applying migration..."
psql $DATABASE_URL -f migration.sql

# 3. Validate migration works
echo "Testing migration functionality..."
npm run test:integration:new-features

# 4. Execute rollback
echo "Testing rollback procedure..."
./emergency-rollback.sh

# 5. Validate rollback success
echo "Validating rollback..."

# Check that all existing functionality still works
npm run test:compatibility:full

# Check that new tables/columns are properly removed or backed up
psql $DATABASE_URL -c "
SELECT
  CASE
    WHEN NOT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'health_metrics')
    THEN 'PASS: health_metrics table removed'
    ELSE 'FAIL: health_metrics table still exists'
  END as test_result;
"

# Check that existing data is untouched
psql $DATABASE_URL -c "
SELECT
  'businesses' as table_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as test_result
FROM businesses

UNION ALL

SELECT
  'users' as table_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as test_result
FROM users;
"

echo "Rollback compatibility testing complete"
```

---

## Continuous Compatibility Monitoring

### Automated Compatibility Checks

#### CI/CD Integration

```yaml
# .github/workflows/compatibility-testing.yml
name: Database Compatibility Testing

on:
  pull_request:
    paths:
      - 'prisma/**'
      - 'migrations/**'
      - 'src/lib/db/**'

jobs:
  compatibility-testing:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: goodbuy_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Setup baseline database
        run: |
          export DATABASE_URL="postgresql://postgres:testpass@localhost:5432/goodbuy_test"
          psql $DATABASE_URL -f tests/fixtures/baseline-schema.sql
          psql $DATABASE_URL -f tests/fixtures/baseline-data.sql

      - name: Capture performance baseline
        run: |
          export DATABASE_URL="postgresql://postgres:testpass@localhost:5432/goodbuy_test"
          npm run test:performance:baseline

      - name: Run compatibility tests
        run: |
          export DATABASE_URL="postgresql://postgres:testpass@localhost:5432/goodbuy_test"
          npm run test:compatibility:schema
          npm run test:compatibility:prisma
          npm run test:compatibility:api
          npm run test:compatibility:performance

      - name: Test rollback procedures
        run: |
          export DATABASE_URL="postgresql://postgres:testpass@localhost:5432/goodbuy_test"
          npm run test:rollback:emergency
          npm run test:rollback:planned

      - name: Generate compatibility report
        run: npm run test:compatibility:report

      - name: Upload compatibility report
        uses: actions/upload-artifact@v3
        with:
          name: compatibility-report
          path: reports/compatibility-report.html
```

### Monitoring Dashboard

#### Real-time Compatibility Monitoring

```typescript
// compatibility-monitor.ts
class CompatibilityMonitor {
  private metrics: CompatibilityMetrics[] = []
  private alertThresholds: AlertThresholds

  constructor() {
    this.alertThresholds = {
      performanceRegression: 0.15, // 15% regression triggers alert
      errorRateIncrease: 0.05, // 5% error rate increase
      responseTimeIncrease: 0.2, // 20% response time increase
    }
  }

  async monitorContinuously(): Promise<void> {
    setInterval(
      async () => {
        const metrics = await this.collectMetrics()
        await this.evaluateCompatibility(metrics)
        await this.alertIfNecessary(metrics)

        this.metrics.push(metrics)

        // Keep only last 24 hours of metrics
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
        this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
      },
      5 * 60 * 1000
    ) // Every 5 minutes
  }

  private async collectMetrics(): Promise<CompatibilityMetrics> {
    return {
      timestamp: new Date(),
      apiResponseTimes: await this.measureAPIResponseTimes(),
      databaseQueryPerformance: await this.measureDatabasePerformance(),
      errorRates: await this.collectErrorRates(),
      userExperienceMetrics: await this.collectUXMetrics(),
      schemaValidation: await this.validateSchemaIntegrity(),
    }
  }

  private async evaluateCompatibility(
    metrics: CompatibilityMetrics
  ): Promise<CompatibilityEvaluation> {
    const baseline = await this.getBaselineMetrics()

    return {
      performanceCompatibility: this.evaluatePerformanceCompatibility(
        metrics,
        baseline
      ),
      functionalCompatibility: this.evaluateFunctionalCompatibility(metrics),
      dataIntegrity: this.evaluateDataIntegrity(metrics),
      userExperience: this.evaluateUserExperience(metrics, baseline),
      overallScore: this.calculateOverallCompatibilityScore(metrics, baseline),
    }
  }

  private async alertIfNecessary(metrics: CompatibilityMetrics): Promise<void> {
    const evaluation = await this.evaluateCompatibility(metrics)

    if (evaluation.overallScore < 0.8) {
      // 80% compatibility threshold
      await this.sendCompatibilityAlert({
        severity: 'high',
        message: `Compatibility score dropped to ${(evaluation.overallScore * 100).toFixed(1)}%`,
        metrics,
        evaluation,
        recommendedActions: this.getRecommendedActions(evaluation),
      })
    }
  }
}
```

---

## Conclusion

These backward compatibility testing procedures ensure that the AI Financial Health Analyzer database migrations maintain complete compatibility with existing GoodBuy HQ functionality. The comprehensive testing strategy validates compatibility at every level from database schema to user workflows.

### Key Compatibility Guarantees

1. **Schema Compatibility**: All existing tables, columns, and relationships preserved
2. **Query Compatibility**: All existing SQL queries continue to work unchanged
3. **API Compatibility**: All existing endpoints maintain exact same behavior
4. **Performance Compatibility**: No degradation beyond acceptable thresholds
5. **User Workflow Compatibility**: All existing user journeys function seamlessly

### Success Criteria

- [ ] 100% existing API contract compliance
- [ ] <10% performance regression for existing queries
- [ ] Zero breaking changes to existing functionality
- [ ] Complete rollback capability within 5 minutes
- [ ] All existing user workflows operational

This comprehensive testing approach provides confidence that the database migration can be executed safely in the production environment while preserving the integrity and functionality that existing users depend on.
