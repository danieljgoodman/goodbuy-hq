# Performance Impact Monitoring Guidelines

**Version:** 1.0  
**Date:** September 3, 2025  
**Author:** Performance Engineering Team  
**Classification:** OPERATIONAL GUIDELINES

---

## Executive Summary

This document provides comprehensive guidelines for monitoring performance impact during and after database migrations in the GoodBuy HQ brownfield environment. The guidelines ensure that any performance degradation is detected immediately and addressed before it impacts user experience.

### Monitoring Objectives

1. **Early Detection**: Identify performance issues within minutes of occurrence
2. **Impact Quantification**: Measure the exact performance impact of changes
3. **Automated Response**: Trigger automated remediation for known issues
4. **Trend Analysis**: Track performance trends over time to predict issues
5. **User Experience Protection**: Ensure users experience consistent performance

---

## Performance Monitoring Architecture

### Monitoring Stack Overview

#### Core Monitoring Components

```yaml
# monitoring-stack.yml
monitoring_architecture:
  application_layer:
    - application_performance_monitoring: 'New Relic'
    - custom_metrics: 'Prometheus'
    - error_tracking: 'Sentry'
    - user_session_tracking: 'Custom analytics'

  database_layer:
    - query_performance: 'pg_stat_statements'
    - connection_monitoring: 'pg_stat_activity'
    - index_usage: 'pg_stat_user_indexes'
    - table_statistics: 'pg_stat_user_tables'

  infrastructure_layer:
    - system_metrics: 'CloudWatch'
    - container_metrics: 'Docker Stats'
    - network_monitoring: 'VPC Flow Logs'
    - storage_performance: 'EBS Metrics'

  alerting_layer:
    - immediate_alerts: 'PagerDuty'
    - trending_alerts: 'Slack'
    - dashboard_notifications: 'Custom UI'
    - email_reports: 'Daily/Weekly summaries'
```

### Performance Metrics Hierarchy

#### Tier 1: Critical Performance Metrics (Real-time Monitoring)

```typescript
// critical-performance-metrics.ts
interface CriticalPerformanceMetrics {
  // API Response Times (Target: <200ms p95)
  apiResponseTimes: {
    businessListingEndpoint: number
    businessDetailEndpoint: number
    userDashboardEndpoint: number
    searchEndpoint: number
  }

  // Database Query Performance (Target: <100ms p95)
  databaseQueryTimes: {
    businessListingQuery: number
    userDashboardQuery: number
    evaluationQueries: number
    searchQueries: number
  }

  // System Health (Target: <80% utilization)
  systemHealth: {
    cpuUtilization: number
    memoryUtilization: number
    databaseConnections: number
    diskIOLatency: number
  }

  // Error Rates (Target: <1% error rate)
  errorRates: {
    apiErrorRate: number
    databaseErrorRate: number
    authenticationErrors: number
    validationErrors: number
  }
}

class CriticalMetricsMonitor {
  private readonly thresholds = {
    apiResponseTime: {
      warning: 150, // ms
      critical: 300, // ms
    },
    databaseQueryTime: {
      warning: 75, // ms
      critical: 200, // ms
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.1, // 10%
    },
    systemUtilization: {
      warning: 0.7, // 70%
      critical: 0.85, // 85%
    },
  }

  async collectCriticalMetrics(): Promise<CriticalPerformanceMetrics> {
    return {
      apiResponseTimes: await this.collectAPIResponseTimes(),
      databaseQueryTimes: await this.collectDatabaseQueryTimes(),
      systemHealth: await this.collectSystemHealth(),
      errorRates: await this.collectErrorRates(),
    }
  }

  async evaluateThresholds(
    metrics: CriticalPerformanceMetrics
  ): Promise<ThresholdEvaluation[]> {
    const evaluations: ThresholdEvaluation[] = []

    // Evaluate API response times
    for (const [endpoint, responseTime] of Object.entries(
      metrics.apiResponseTimes
    )) {
      const evaluation = this.evaluateMetric(
        `api_response_time.${endpoint}`,
        responseTime,
        this.thresholds.apiResponseTime
      )
      evaluations.push(evaluation)
    }

    // Evaluate database query times
    for (const [query, queryTime] of Object.entries(
      metrics.databaseQueryTimes
    )) {
      const evaluation = this.evaluateMetric(
        `database_query_time.${query}`,
        queryTime,
        this.thresholds.databaseQueryTime
      )
      evaluations.push(evaluation)
    }

    return evaluations
  }
}
```

#### Tier 2: Important Performance Metrics (5-minute intervals)

```sql
-- important-performance-metrics.sql
-- Collect important metrics every 5 minutes

-- Database connection pool health
SELECT
  'db_connection_pool' as metric_name,
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
  COUNT(*) FILTER (WHERE waiting) as waiting_connections,
  EXTRACT(EPOCH FROM (NOW() - min(query_start))) as longest_running_query_seconds
FROM pg_stat_activity
WHERE datname = current_database();

-- Table growth and size monitoring
SELECT
  'table_growth_' || tablename as metric_name,
  n_live_tup as current_row_count,
  n_dead_tup as dead_row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_total_relation_size(schemaname||'.'||tablename) as table_size_bytes
FROM pg_stat_user_tables
WHERE tablename IN ('businesses', 'users', 'evaluations', 'health_metrics', 'forecast_results');

-- Index usage and effectiveness
SELECT
  'index_usage_' || indexname as metric_name,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE
    WHEN idx_scan > 0 THEN idx_tup_fetch / idx_scan
    ELSE 0
  END as avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY idx_scan DESC;

-- Query performance statistics
SELECT
  'query_performance' as metric_name,
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  stddev_exec_time,
  max_exec_time,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
  AND calls > 10
ORDER BY mean_exec_time DESC
LIMIT 20;
```

#### Tier 3: Trend Analysis Metrics (15-minute intervals)

```typescript
// trend-analysis-metrics.ts
interface TrendAnalysisMetrics {
  userActivityTrends: UserActivityTrend[]
  businessMetricsTrends: BusinessMetricsTrend[]
  systemResourceTrends: SystemResourceTrend[]
  featureUsageTrends: FeatureUsageTrend[]
}

class TrendAnalysisMonitor {
  async collectTrendMetrics(): Promise<TrendAnalysisMetrics> {
    const timeWindow = 15 * 60 * 1000 // 15 minutes
    const currentTime = new Date()
    const previousTime = new Date(currentTime.getTime() - timeWindow)

    return {
      userActivityTrends: await this.analyzeUserActivityTrends(
        previousTime,
        currentTime
      ),
      businessMetricsTrends: await this.analyzeBusinessMetricsTrends(
        previousTime,
        currentTime
      ),
      systemResourceTrends: await this.analyzeSystemResourceTrends(
        previousTime,
        currentTime
      ),
      featureUsageTrends: await this.analyzeFeatureUsageTrends(
        previousTime,
        currentTime
      ),
    }
  }

  private async analyzeUserActivityTrends(
    startTime: Date,
    endTime: Date
  ): Promise<UserActivityTrend[]> {
    // Analyze user session patterns, page views, API calls
    const currentPeriodActivity = await this.getUserActivity(startTime, endTime)
    const previousPeriodActivity = await this.getUserActivity(
      new Date(startTime.getTime() - (endTime.getTime() - startTime.getTime())),
      startTime
    )

    return [
      {
        metric: 'active_users',
        currentValue: currentPeriodActivity.activeUsers,
        previousValue: previousPeriodActivity.activeUsers,
        percentChange: this.calculatePercentChange(
          previousPeriodActivity.activeUsers,
          currentPeriodActivity.activeUsers
        ),
        trend: this.determineTrend(
          previousPeriodActivity.activeUsers,
          currentPeriodActivity.activeUsers
        ),
      },
    ]
  }

  private calculatePercentChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
}
```

---

## Pre-Migration Performance Baseline

### Baseline Establishment Process

#### Performance Baseline Capture

```bash
#!/bin/bash
# establish-performance-baseline.sh
# Run this script 1 week before migration to establish baseline

echo "Establishing performance baseline for migration..."

# Create baseline directory
BASELINE_DIR="baselines/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BASELINE_DIR

# Database performance baseline
echo "Capturing database performance baseline..."
psql $DATABASE_URL << EOF > $BASELINE_DIR/database_baseline.txt
-- Query performance baseline
SELECT
  'database_baseline' as baseline_type,
  now() as captured_at,
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  stddev_exec_time,
  max_exec_time,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
  AND calls > 100
ORDER BY mean_exec_time DESC
LIMIT 50;

-- Connection and activity baseline
SELECT
  'connection_baseline' as baseline_type,
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  AVG(EXTRACT(EPOCH FROM (now() - query_start))) as avg_query_duration
FROM pg_stat_activity
WHERE datname = current_database();

-- Table size baseline
SELECT
  'table_size_baseline' as baseline_type,
  tablename,
  n_live_tup as row_count,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_stat_user_tables
WHERE schemaname = 'public';
EOF

# API performance baseline
echo "Capturing API performance baseline..."
node scripts/api-baseline-capture.js > $BASELINE_DIR/api_baseline.json

# System resource baseline
echo "Capturing system resource baseline..."
cat > $BASELINE_DIR/system_baseline.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "cpu_usage": $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//'),
  "memory_usage": $(ps -A -o %mem | awk '{s+=$1} END {print s}'),
  "disk_usage": $(df -h / | awk 'NR==2{printf "%.2f", $5}' | sed 's/%//'),
  "load_average": "$(uptime | awk -F'load averages:' '{print $2}')"
}
EOF

echo "Performance baseline established in $BASELINE_DIR"
echo "Use this baseline for comparison after migration"
```

#### Baseline Analysis and Thresholds

```typescript
// baseline-analysis.ts
interface PerformanceBaseline {
  timestamp: Date
  databaseMetrics: DatabaseBaselineMetrics
  apiMetrics: APIBaselineMetrics
  systemMetrics: SystemBaselineMetrics
  calculatedThresholds: PerformanceThresholds
}

class BaselineAnalyzer {
  async analyzeBaseline(
    baselineData: RawBaselineData
  ): Promise<PerformanceBaseline> {
    const databaseMetrics = await this.analyzeDatabaseBaseline(
      baselineData.database
    )
    const apiMetrics = await this.analyzeAPIBaseline(baselineData.api)
    const systemMetrics = await this.analyzeSystemBaseline(baselineData.system)

    const calculatedThresholds = this.calculateDynamicThresholds({
      databaseMetrics,
      apiMetrics,
      systemMetrics,
    })

    return {
      timestamp: new Date(),
      databaseMetrics,
      apiMetrics,
      systemMetrics,
      calculatedThresholds,
    }
  }

  private calculateDynamicThresholds(
    baseline: BaselineMetrics
  ): PerformanceThresholds {
    return {
      // API response time thresholds (baseline + buffer)
      apiResponseTime: {
        warning: baseline.apiMetrics.p95ResponseTime * 1.2, // 20% above baseline
        critical: baseline.apiMetrics.p95ResponseTime * 1.5, // 50% above baseline
      },

      // Database query time thresholds
      databaseQueryTime: {
        warning: baseline.databaseMetrics.avgQueryTime * 1.3, // 30% above baseline
        critical: baseline.databaseMetrics.avgQueryTime * 2.0, // 100% above baseline
      },

      // System resource thresholds
      systemResources: {
        cpuWarning: Math.max(baseline.systemMetrics.avgCpuUsage * 1.5, 70), // 50% above baseline or 70%
        cpuCritical: Math.max(baseline.systemMetrics.avgCpuUsage * 2.0, 85), // 100% above baseline or 85%
        memoryWarning: Math.max(
          baseline.systemMetrics.avgMemoryUsage * 1.3,
          80
        ),
        memoryCritical: Math.max(
          baseline.systemMetrics.avgMemoryUsage * 1.5,
          90
        ),
      },

      // Error rate thresholds
      errorRate: {
        warning: Math.max(baseline.apiMetrics.baselineErrorRate * 2, 0.02), // Double baseline or 2%
        critical: Math.max(baseline.apiMetrics.baselineErrorRate * 5, 0.05), // 5x baseline or 5%
      },
    }
  }
}
```

---

## Real-Time Performance Monitoring

### Migration Phase Monitoring

#### Pre-Migration Monitoring Setup

```typescript
// pre-migration-monitoring.ts
class PreMigrationMonitor {
  private monitoringActive = false
  private alertsEnabled = true

  async startPreMigrationMonitoring(): Promise<void> {
    console.log('Starting pre-migration monitoring...')

    // Initialize monitoring systems
    await this.initializeRealTimeMonitoring()
    await this.setupMigrationSpecificAlerts()
    await this.enableEnhancedLogging()

    this.monitoringActive = true

    // Start monitoring loops
    this.startCriticalMetricsLoop()
    this.startPerformanceAnalysisLoop()
    this.startHealthCheckLoop()

    console.log('Pre-migration monitoring active')
  }

  private async initializeRealTimeMonitoring(): Promise<void> {
    // Setup Prometheus metrics collection
    await this.prometheusClient.startMetricsCollection({
      interval: 5000, // 5 seconds
      metrics: [
        'api_request_duration_seconds',
        'database_query_duration_seconds',
        'active_database_connections',
        'system_cpu_usage',
        'system_memory_usage',
      ],
    })

    // Setup custom database monitoring
    await this.databaseMonitor.startPerformanceTracking({
      slowQueryThreshold: 100, // ms
      connectionThreshold: 80, // % of max connections
      lockTimeout: 10000, // ms
    })
  }

  private startCriticalMetricsLoop(): void {
    const criticalMetricsInterval = setInterval(async () => {
      if (!this.monitoringActive) {
        clearInterval(criticalMetricsInterval)
        return
      }

      try {
        const metrics = await this.collectCriticalMetrics()
        const evaluations = await this.evaluateThresholds(metrics)

        // Check for critical issues
        const criticalIssues = evaluations.filter(e => e.level === 'CRITICAL')
        if (criticalIssues.length > 0) {
          await this.handleCriticalIssues(criticalIssues)
        }

        // Store metrics for trending
        await this.storeMetrics(metrics)
      } catch (error) {
        console.error('Error collecting critical metrics:', error)
        await this.alertMonitoringError(error)
      }
    }, 10000) // Every 10 seconds during migration
  }
}
```

#### During-Migration Monitoring

```sql
-- during-migration-monitoring.sql
-- Real-time monitoring queries during migration execution

-- Monitor long-running operations
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state,
  waiting
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 minute'
  AND state != 'idle';

-- Monitor table locks during migration
SELECT
  t.relname as table_name,
  l.locktype,
  l.mode,
  l.granted,
  l.pid,
  pg_stat_activity.query
FROM pg_locks l
JOIN pg_class t ON l.relation = t.oid
JOIN pg_stat_activity ON l.pid = pg_stat_activity.pid
WHERE t.relkind = 'r'
  AND l.granted = false;

-- Monitor migration progress (if applicable)
SELECT
  schemaname,
  tablename,
  n_live_tup as current_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE tablename IN ('businesses', 'health_metrics', 'forecast_results');

-- Monitor connection pool status
SELECT
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active,
  COUNT(*) FILTER (WHERE state = 'idle') as idle,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
  COUNT(*) FILTER (WHERE waiting) as waiting
FROM pg_stat_activity
WHERE datname = current_database();
```

### Post-Migration Monitoring

#### Performance Validation Phase

```typescript
// post-migration-validation.ts
class PostMigrationValidator {
  async validatePerformanceImpact(
    baseline: PerformanceBaseline
  ): Promise<PerformanceValidationReport> {
    console.log('Starting post-migration performance validation...')

    // Collect current metrics
    const currentMetrics = await this.collectCurrentMetrics()

    // Compare with baseline
    const comparison = await this.compareWithBaseline(currentMetrics, baseline)

    // Validate against thresholds
    const thresholdValidation = await this.validateThresholds(comparison)

    // Generate detailed report
    const report = await this.generateValidationReport({
      currentMetrics,
      baseline,
      comparison,
      thresholdValidation,
    })

    // Alert if critical issues found
    if (report.criticalIssues.length > 0) {
      await this.alertCriticalPerformanceIssues(report)
    }

    return report
  }

  private async compareWithBaseline(
    current: CurrentMetrics,
    baseline: PerformanceBaseline
  ): Promise<PerformanceComparison> {
    return {
      apiResponseTimeComparison: {
        businessListing: {
          baselineP95: baseline.apiMetrics.businessListingP95,
          currentP95: current.apiMetrics.businessListingP95,
          percentChange: this.calculatePercentChange(
            baseline.apiMetrics.businessListingP95,
            current.apiMetrics.businessListingP95
          ),
          withinThreshold:
            current.apiMetrics.businessListingP95 <=
            baseline.calculatedThresholds.apiResponseTime.warning,
        },
        userDashboard: {
          baselineP95: baseline.apiMetrics.userDashboardP95,
          currentP95: current.apiMetrics.userDashboardP95,
          percentChange: this.calculatePercentChange(
            baseline.apiMetrics.userDashboardP95,
            current.apiMetrics.userDashboardP95
          ),
          withinThreshold:
            current.apiMetrics.userDashboardP95 <=
            baseline.calculatedThresholds.apiResponseTime.warning,
        },
      },

      databasePerformanceComparison: {
        avgQueryTime: {
          baseline: baseline.databaseMetrics.avgQueryTime,
          current: current.databaseMetrics.avgQueryTime,
          percentChange: this.calculatePercentChange(
            baseline.databaseMetrics.avgQueryTime,
            current.databaseMetrics.avgQueryTime
          ),
          withinThreshold:
            current.databaseMetrics.avgQueryTime <=
            baseline.calculatedThresholds.databaseQueryTime.warning,
        },
        connectionUtilization: {
          baseline: baseline.databaseMetrics.avgConnectionUtilization,
          current: current.databaseMetrics.avgConnectionUtilization,
          percentChange: this.calculatePercentChange(
            baseline.databaseMetrics.avgConnectionUtilization,
            current.databaseMetrics.avgConnectionUtilization
          ),
          withinThreshold:
            current.databaseMetrics.avgConnectionUtilization <= 0.8, // 80% threshold
        },
      },
    }
  }

  async runExtendedValidation(
    duration: number = 3600000
  ): Promise<ExtendedValidationReport> {
    // Run extended validation for 1 hour by default
    console.log(
      `Starting extended validation for ${duration / 60000} minutes...`
    )

    const startTime = Date.now()
    const validationResults: ValidationDataPoint[] = []

    while (Date.now() - startTime < duration) {
      const dataPoint = await this.collectValidationDataPoint()
      validationResults.push(dataPoint)

      // Sleep for 30 seconds between collections
      await new Promise(resolve => setTimeout(resolve, 30000))
    }

    return this.analyzeExtendedValidationResults(validationResults)
  }
}
```

---

## Performance Alert Configuration

### Alert Severity Levels

#### Critical Alerts (Immediate Response Required)

```yaml
# critical-alerts.yml
critical_alerts:
  api_response_time_critical:
    condition: 'p95_response_time > baseline_p95 * 2 OR p95_response_time > 500ms'
    notification_channels: ['pagerduty', 'slack_critical', 'sms_on_call']
    escalation_time: '5 minutes'
    auto_actions: ['enable_circuit_breaker', 'scale_up_resources']

  database_performance_critical:
    condition: 'avg_query_time > baseline * 3 OR connection_utilization > 90%'
    notification_channels: ['pagerduty', 'slack_critical', 'email_dba']
    escalation_time: '3 minutes'
    auto_actions: ['kill_long_queries', 'scale_database']

  error_rate_spike:
    condition: 'error_rate > 10% OR error_count > 100/minute'
    notification_channels: ['pagerduty', 'slack_critical', 'email_team']
    escalation_time: '2 minutes'
    auto_actions: ['enable_maintenance_mode', 'trigger_rollback_evaluation']

  system_resource_exhaustion:
    condition: 'cpu_usage > 95% OR memory_usage > 95% OR disk_usage > 95%'
    notification_channels: ['pagerduty', 'slack_critical', 'aws_support']
    escalation_time: '5 minutes'
    auto_actions: ['scale_infrastructure', 'enable_resource_limits']
```

#### Warning Alerts (Attention Required)

```yaml
# warning-alerts.yml
warning_alerts:
  performance_degradation:
    condition: 'p95_response_time > baseline_p95 * 1.5 AND duration > 5_minutes'
    notification_channels: ['slack_warnings', 'email_team']
    escalation_time: '15 minutes'
    auto_actions: ['log_detailed_metrics', 'run_diagnostics']

  resource_usage_high:
    condition: 'cpu_usage > 80% OR memory_usage > 80% AND duration > 10_minutes'
    notification_channels: ['slack_warnings', 'email_ops']
    escalation_time: '20 minutes'
    auto_actions: ['collect_performance_profile', 'check_scaling_rules']

  database_connections_high:
    condition: 'connection_utilization > 70% AND duration > 5_minutes'
    notification_channels: ['slack_warnings', 'email_dba']
    escalation_time: '10 minutes'
    auto_actions: ['analyze_connection_usage', 'optimize_connection_pool']
```

### Alert Implementation

#### Real-time Alerting System

```typescript
// performance-alerting.ts
class PerformanceAlertManager {
  private alertRules: AlertRule[] = []
  private activeAlerts: Map<string, ActiveAlert> = new Map()
  private alertHistory: AlertEvent[] = []

  async initializeAlerting(): Promise<void> {
    // Load alert configuration
    this.alertRules = await this.loadAlertRules()

    // Start alert evaluation loop
    this.startAlertEvaluationLoop()

    // Setup notification channels
    await this.setupNotificationChannels()
  }

  private startAlertEvaluationLoop(): void {
    setInterval(async () => {
      try {
        const currentMetrics = await this.collectCurrentMetrics()

        for (const rule of this.alertRules) {
          await this.evaluateAlertRule(rule, currentMetrics)
        }

        // Cleanup resolved alerts
        await this.cleanupResolvedAlerts()
      } catch (error) {
        console.error('Error in alert evaluation loop:', error)
      }
    }, 10000) // Every 10 seconds
  }

  private async evaluateAlertRule(
    rule: AlertRule,
    metrics: CurrentMetrics
  ): Promise<void> {
    const isTriggered = await this.evaluateCondition(rule.condition, metrics)
    const existingAlert = this.activeAlerts.get(rule.id)

    if (isTriggered && !existingAlert) {
      // New alert triggered
      const alert = await this.createAlert(rule, metrics)
      this.activeAlerts.set(rule.id, alert)
      await this.sendNotifications(alert)
      await this.executeAutoActions(rule.autoActions, metrics)
    } else if (!isTriggered && existingAlert) {
      // Alert resolved
      await this.resolveAlert(existingAlert)
      this.activeAlerts.delete(rule.id)
    } else if (isTriggered && existingAlert) {
      // Alert still active, check for escalation
      await this.checkEscalation(existingAlert, rule)
    }
  }

  private async executeAutoActions(
    actions: string[],
    metrics: CurrentMetrics
  ): Promise<void> {
    for (const action of actions) {
      try {
        switch (action) {
          case 'enable_circuit_breaker':
            await this.circuitBreakerService.enableCircuitBreaker(
              'health_analyzer'
            )
            break

          case 'scale_up_resources':
            await this.autoScalingService.scaleUp('web-servers', 2)
            break

          case 'kill_long_queries':
            await this.databaseService.killLongRunningQueries(300000) // 5 minutes
            break

          case 'trigger_rollback_evaluation':
            await this.rollbackService.evaluateRollbackNeed(metrics)
            break

          case 'enable_maintenance_mode':
            await this.maintenanceService.enableMaintenanceMode(
              'performance_issue'
            )
            break

          default:
            console.warn(`Unknown auto action: ${action}`)
        }
      } catch (error) {
        console.error(`Error executing auto action ${action}:`, error)
      }
    }
  }
}
```

---

## Performance Dashboard and Reporting

### Real-time Performance Dashboard

#### Dashboard Components

```typescript
// performance-dashboard.ts
interface PerformanceDashboard {
  realTimeMetrics: RealTimeMetrics
  trendCharts: TrendChart[]
  alertStatus: AlertStatus
  migrationProgress: MigrationProgressStatus
  systemHealth: SystemHealthStatus
}

class PerformanceDashboardService {
  async getDashboardData(): Promise<PerformanceDashboard> {
    return {
      realTimeMetrics: await this.getRealTimeMetrics(),
      trendCharts: await this.generateTrendCharts(),
      alertStatus: await this.getAlertStatus(),
      migrationProgress: await this.getMigrationProgress(),
      systemHealth: await this.getSystemHealth(),
    }
  }

  private async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const [apiMetrics, dbMetrics, systemMetrics] = await Promise.all([
      this.getAPIMetrics(),
      this.getDatabaseMetrics(),
      this.getSystemMetrics(),
    ])

    return {
      timestamp: new Date(),
      apiResponseTimes: {
        businessListing: {
          current: apiMetrics.businessListing.p95,
          baseline: this.baseline.apiMetrics.businessListingP95,
          status: this.getMetricStatus(
            apiMetrics.businessListing.p95,
            this.baseline.apiMetrics.businessListingP95
          ),
        },
        userDashboard: {
          current: apiMetrics.userDashboard.p95,
          baseline: this.baseline.apiMetrics.userDashboardP95,
          status: this.getMetricStatus(
            apiMetrics.userDashboard.p95,
            this.baseline.apiMetrics.userDashboardP95
          ),
        },
      },
      databasePerformance: {
        avgQueryTime: {
          current: dbMetrics.avgQueryTime,
          baseline: this.baseline.databaseMetrics.avgQueryTime,
          status: this.getMetricStatus(
            dbMetrics.avgQueryTime,
            this.baseline.databaseMetrics.avgQueryTime
          ),
        },
        connectionUtilization: {
          current: dbMetrics.connectionUtilization,
          threshold: 0.8,
          status: dbMetrics.connectionUtilization > 0.8 ? 'WARNING' : 'HEALTHY',
        },
      },
      systemResources: {
        cpuUsage: {
          current: systemMetrics.cpuUsage,
          threshold: 80,
          status: systemMetrics.cpuUsage > 80 ? 'WARNING' : 'HEALTHY',
        },
        memoryUsage: {
          current: systemMetrics.memoryUsage,
          threshold: 80,
          status: systemMetrics.memoryUsage > 80 ? 'WARNING' : 'HEALTHY',
        },
      },
    }
  }

  async generatePerformanceReport(
    timeframe: 'hourly' | 'daily' | 'weekly'
  ): Promise<PerformanceReport> {
    const startTime = this.getReportStartTime(timeframe)
    const endTime = new Date()

    const metrics = await this.collectMetricsForTimeframe(startTime, endTime)
    const analysis = await this.analyzePerformanceTrends(metrics)

    return {
      timeframe,
      startTime,
      endTime,
      summary: {
        overallHealth: analysis.overallHealth,
        keyMetrics: analysis.keyMetrics,
        significantEvents: analysis.significantEvents,
        recommendations: analysis.recommendations,
      },
      detailedAnalysis: {
        apiPerformance: analysis.apiPerformance,
        databasePerformance: analysis.databasePerformance,
        systemPerformance: analysis.systemPerformance,
        errorAnalysis: analysis.errorAnalysis,
      },
      charts: await this.generatePerformanceCharts(metrics),
      alerts: await this.getAlertsForTimeframe(startTime, endTime),
    }
  }
}
```

### Performance Reporting

#### Automated Report Generation

```bash
#!/bin/bash
# generate-performance-reports.sh
# Automated performance report generation

REPORT_DIR="reports/performance/$(date +%Y%m%d)"
mkdir -p $REPORT_DIR

# Generate hourly report
echo "Generating hourly performance report..."
node scripts/generate-performance-report.js --timeframe=hourly --output=$REPORT_DIR/hourly-$(date +%H).html

# Generate daily report (if it's midnight)
if [ $(date +%H) -eq "00" ]; then
  echo "Generating daily performance report..."
  node scripts/generate-performance-report.js --timeframe=daily --output=$REPORT_DIR/daily-$(date +%Y%m%d).html

  # Email daily report to stakeholders
  cat > $REPORT_DIR/email-body.txt << EOF
Subject: Daily Performance Report - $(date +%Y-%m-%d)

Please find attached the daily performance report for the GoodBuy HQ system.

Key highlights:
- System availability: $(grep "availability" $REPORT_DIR/daily-*.html | sed 's/.*>//' | sed 's/<.*//')
- Average API response time: $(grep "avg_api_response" $REPORT_DIR/daily-*.html | sed 's/.*>//' | sed 's/<.*//')
- Database performance: $(grep "db_performance" $REPORT_DIR/daily-*.html | sed 's/.*>//' | sed 's/<.*//')

Please review and contact the performance team with any concerns.

Best regards,
Automated Performance Monitoring System
EOF

  # Send email with attachment
  sendmail performance-team@goodbuyhq.com < $REPORT_DIR/email-body.txt
fi

# Generate weekly report (if it's Sunday midnight)
if [ $(date +%u) -eq "7" ] && [ $(date +%H) -eq "00" ]; then
  echo "Generating weekly performance report..."
  node scripts/generate-performance-report.js --timeframe=weekly --output=$REPORT_DIR/weekly-$(date +%Y-week-%V).html
fi

echo "Performance reports generated in $REPORT_DIR"
```

---

## Performance Optimization Recommendations

### Automatic Performance Optimization

#### Query Optimization Engine

```typescript
// query-optimization.ts
class QueryOptimizationEngine {
  private slowQueryThreshold = 100 // ms
  private optimizationRules: OptimizationRule[] = []

  async analyzeAndOptimizeQueries(): Promise<OptimizationReport> {
    // Identify slow queries
    const slowQueries = await this.identifySlowQueries()

    // Analyze each slow query
    const analysisResults: QueryAnalysis[] = []
    for (const query of slowQueries) {
      const analysis = await this.analyzeQuery(query)
      analysisResults.push(analysis)
    }

    // Generate optimization recommendations
    const recommendations =
      await this.generateOptimizationRecommendations(analysisResults)

    // Auto-apply safe optimizations
    const autoAppliedOptimizations =
      await this.applyAutomaticOptimizations(recommendations)

    return {
      slowQueriesAnalyzed: analysisResults.length,
      recommendationsGenerated: recommendations.length,
      automaticOptimizationsApplied: autoAppliedOptimizations.length,
      manualReviewRequired: recommendations.filter(r => r.requiresManualReview),
      estimatedPerformanceImprovement:
        this.estimatePerformanceImprovement(recommendations),
    }
  }

  private async identifySlowQueries(): Promise<SlowQuery[]> {
    const result = await this.database.query(
      `
      SELECT 
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        stddev_exec_time,
        rows
      FROM pg_stat_statements
      WHERE mean_exec_time > $1
        AND calls > 10
      ORDER BY mean_exec_time DESC
      LIMIT 20
    `,
      [this.slowQueryThreshold]
    )

    return result.rows.map(row => ({
      query: row.query,
      calls: row.calls,
      totalExecutionTime: row.total_exec_time,
      meanExecutionTime: row.mean_exec_time,
      standardDeviation: row.stddev_exec_time,
      averageRows: row.rows / row.calls,
    }))
  }

  private async generateOptimizationRecommendations(
    analyses: QueryAnalysis[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    for (const analysis of analyses) {
      // Check for missing indexes
      if (analysis.missingIndexes.length > 0) {
        recommendations.push({
          type: 'ADD_INDEX',
          priority: 'HIGH',
          query: analysis.query,
          recommendation: `Add indexes: ${analysis.missingIndexes.join(', ')}`,
          estimatedImprovement: '50-80% query time reduction',
          requiresManualReview: false,
          autoApplicable: true,
          sqlStatements: analysis.missingIndexes.map(
            index =>
              `CREATE INDEX CONCURRENTLY ${index.name} ON ${index.table} (${index.columns.join(', ')});`
          ),
        })
      }

      // Check for suboptimal query patterns
      if (analysis.suboptimalPatterns.length > 0) {
        recommendations.push({
          type: 'QUERY_REWRITE',
          priority: 'MEDIUM',
          query: analysis.query,
          recommendation: `Optimize query patterns: ${analysis.suboptimalPatterns.join(', ')}`,
          estimatedImprovement: '20-40% query time reduction',
          requiresManualReview: true,
          autoApplicable: false,
          suggestedRewrite: this.generateQueryRewrite(analysis),
        })
      }
    }

    return recommendations
  }
}
```

#### Resource Optimization

```typescript
// resource-optimization.ts
class ResourceOptimizationManager {
  async optimizeSystemResources(): Promise<OptimizationResult> {
    const currentMetrics = await this.collectResourceMetrics()
    const optimizations = await this.identifyOptimizations(currentMetrics)

    return {
      databaseOptimizations: await this.optimizeDatabase(
        optimizations.database
      ),
      applicationOptimizations: await this.optimizeApplication(
        optimizations.application
      ),
      infrastructureOptimizations: await this.optimizeInfrastructure(
        optimizations.infrastructure
      ),
    }
  }

  private async optimizeDatabase(
    dbOptimizations: DatabaseOptimization[]
  ): Promise<DatabaseOptimizationResult> {
    const results: DatabaseOptimizationResult = {
      appliedOptimizations: [],
      skippedOptimizations: [],
      errors: [],
    }

    for (const optimization of dbOptimizations) {
      try {
        switch (optimization.type) {
          case 'VACUUM_ANALYZE':
            await this.performVacuumAnalyze(optimization.tables)
            results.appliedOptimizations.push(optimization)
            break

          case 'UPDATE_STATISTICS':
            await this.updateTableStatistics(optimization.tables)
            results.appliedOptimizations.push(optimization)
            break

          case 'REINDEX':
            if (optimization.safeToApply) {
              await this.performReindex(optimization.indexes)
              results.appliedOptimizations.push(optimization)
            } else {
              results.skippedOptimizations.push(optimization)
            }
            break

          case 'CONNECTION_POOL_TUNING':
            await this.tuneConnectionPool(optimization.settings)
            results.appliedOptimizations.push(optimization)
            break
        }
      } catch (error) {
        results.errors.push({ optimization, error: error.message })
      }
    }

    return results
  }
}
```

---

## Monitoring Data Retention and Analytics

### Data Retention Policy

#### Metrics Data Lifecycle

```yaml
# metrics-retention-policy.yml
metrics_retention:
  real_time_metrics:
    retention_period: '24 hours'
    resolution: '10 seconds'
    storage: 'redis'

  short_term_metrics:
    retention_period: '30 days'
    resolution: '1 minute'
    storage: 'timeseries_db'

  medium_term_metrics:
    retention_period: '6 months'
    resolution: '5 minutes'
    storage: 'postgresql'

  long_term_metrics:
    retention_period: '2 years'
    resolution: '1 hour'
    storage: 'data_warehouse'

  baseline_metrics:
    retention_period: 'indefinite'
    storage: 'archive'
    purpose: 'historical_comparison'

automated_cleanup:
  schedule: 'daily at 02:00 UTC'
  compression_threshold: '7 days'
  archival_threshold: '90 days'
  deletion_threshold: '2 years'
```

### Performance Analytics

#### Trend Analysis Engine

```sql
-- performance-analytics.sql
-- Advanced analytics queries for performance trend analysis

-- Performance trend analysis over time
WITH performance_trends AS (
  SELECT
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(api_response_time) as avg_api_response,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY api_response_time) as p95_api_response,
    AVG(database_query_time) as avg_db_query_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY database_query_time) as p95_db_query_time,
    AVG(cpu_usage) as avg_cpu,
    AVG(memory_usage) as avg_memory,
    COUNT(*) as sample_count
  FROM performance_metrics
  WHERE timestamp >= NOW() - INTERVAL '7 days'
  GROUP BY DATE_TRUNC('hour', timestamp)
  ORDER BY hour
)
SELECT
  hour,
  avg_api_response,
  p95_api_response,
  avg_db_query_time,
  p95_db_query_time,
  avg_cpu,
  avg_memory,
  -- Calculate hour-over-hour change
  LAG(avg_api_response) OVER (ORDER BY hour) as prev_api_response,
  (avg_api_response - LAG(avg_api_response) OVER (ORDER BY hour)) / LAG(avg_api_response) OVER (ORDER BY hour) * 100 as api_response_change_pct,
  -- Identify performance anomalies
  CASE
    WHEN avg_api_response > (SELECT AVG(avg_api_response) * 1.5 FROM performance_trends) THEN 'ANOMALY'
    WHEN avg_api_response > (SELECT AVG(avg_api_response) * 1.2 FROM performance_trends) THEN 'WARNING'
    ELSE 'NORMAL'
  END as performance_status
FROM performance_trends;

-- Correlation analysis between different metrics
SELECT
  CORR(api_response_time, cpu_usage) as api_cpu_correlation,
  CORR(api_response_time, memory_usage) as api_memory_correlation,
  CORR(database_query_time, api_response_time) as db_api_correlation,
  CORR(error_rate, api_response_time) as error_api_correlation,
  CORR(concurrent_users, api_response_time) as users_api_correlation
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- Performance impact analysis by feature
SELECT
  feature_flag,
  COUNT(*) as request_count,
  AVG(api_response_time) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY api_response_time) as p95_response_time,
  AVG(database_query_time) as avg_db_time,
  AVG(CASE WHEN error_occurred THEN 1 ELSE 0 END) as error_rate
FROM performance_metrics pm
JOIN feature_usage fu ON pm.request_id = fu.request_id
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY feature_flag
ORDER BY avg_response_time DESC;
```

---

## Conclusion

These comprehensive performance impact monitoring guidelines ensure that the AI Financial Health Analyzer database migration maintains system performance within acceptable thresholds while providing detailed visibility into any performance changes.

### Key Monitoring Benefits

1. **Proactive Detection**: Issues identified within minutes of occurrence
2. **Quantified Impact**: Precise measurement of performance changes
3. **Automated Response**: Immediate action on critical issues
4. **Trend Analysis**: Long-term performance visibility and prediction
5. **Continuous Optimization**: Automated identification and resolution of performance issues

### Implementation Success Factors

- **Comprehensive Baseline**: Accurate pre-migration performance baseline
- **Real-time Monitoring**: Continuous monitoring during and after migration
- **Intelligent Alerting**: Context-aware alerts with appropriate severity levels
- **Automated Optimization**: Self-healing performance optimization
- **Data-driven Decisions**: Analytics-based performance management

These guidelines provide the framework for maintaining optimal performance throughout the migration process and beyond, ensuring that users experience consistent, high-quality service while the system evolves to support advanced AI-powered features.
