# Monitoring Thresholds & Rollback Triggers

## AI Financial Health Analyzer - Automated Decision Criteria

**Version:** 1.0  
**Date:** September 3, 2025  
**Document Owner:** DevOps & Engineering Teams  
**Status:** Production Ready

---

## Executive Summary

This document defines comprehensive monitoring thresholds and automated rollback triggers for the AI Financial Health Analyzer. These metrics enable proactive detection of issues and automated rollback decisions to maintain system reliability and user experience while preserving the existing GoodBuy HQ platform.

## Monitoring Architecture

### Monitoring Stack

- **Application Monitoring:** DataDog APM
- **Error Tracking:** Sentry
- **Infrastructure Monitoring:** AWS CloudWatch + Grafana
- **Business Metrics:** Custom dashboards + Mixpanel
- **Logs Aggregation:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alerting:** PagerDuty + Slack integrations

### Data Collection Points

```yaml
monitoring_layers:
  application:
    - 'Next.js frontend performance metrics'
    - 'API response times and error rates'
    - 'Database query performance'
    - 'Health calculation execution times'

  infrastructure:
    - 'Server CPU, memory, disk usage'
    - 'Database connection pools'
    - 'Network latency and throughput'
    - 'Container resource utilization'

  business:
    - 'User engagement and satisfaction'
    - 'Feature adoption rates'
    - 'Calculation accuracy metrics'
    - 'Integration success rates'

  external:
    - 'QuickBooks API performance'
    - 'OpenAI API response times'
    - 'Third-party service availability'
```

## Performance Thresholds

### Application Performance Metrics

#### Frontend Performance

```yaml
dashboard_load_time:
  warning: 3000ms # 3 seconds
  critical: 5000ms # 5 seconds
  rollback: 8000ms # 8 seconds
  measurement: 'Time to interactive for health dashboard'

health_score_display:
  warning: 2000ms # 2 seconds
  critical: 4000ms # 4 seconds
  rollback: 6000ms # 6 seconds
  measurement: 'Time from request to score visualization'

chart_rendering:
  warning: 1500ms # 1.5 seconds
  critical: 3000ms # 3 seconds
  rollback: 5000ms # 5 seconds
  measurement: 'Chart.js rendering time for complex visualizations'

bundle_size:
  warning: 2048kb # 2MB
  critical: 3072kb # 3MB
  rollback: 4096kb # 4MB
  measurement: 'Total JavaScript bundle size for AI features'
```

#### API Performance

```yaml
health_calculation_api:
  warning: 2000ms # 2 seconds
  critical: 5000ms # 5 seconds
  rollback: 10000ms # 10 seconds
  measurement: 'Health score calculation endpoint response time'

forecast_generation_api:
  warning: 5000ms # 5 seconds
  critical: 10000ms # 10 seconds
  rollback: 20000ms # 20 seconds
  measurement: 'Forecast generation endpoint response time'

quickbooks_sync_api:
  warning: 10000ms # 10 seconds
  critical: 30000ms # 30 seconds
  rollback: 60000ms # 60 seconds
  measurement: 'QuickBooks data sync endpoint response time'

ai_recommendations_api:
  warning: 8000ms # 8 seconds
  critical: 15000ms # 15 seconds
  rollback: 30000ms # 30 seconds
  measurement: 'AI recommendation generation response time'
```

#### Database Performance

```yaml
health_metrics_query:
  warning: 1000ms # 1 second
  critical: 3000ms # 3 seconds
  rollback: 5000ms # 5 seconds
  measurement: 'Health metrics table query response time'

business_data_aggregation:
  warning: 2000ms # 2 seconds
  critical: 5000ms # 5 seconds
  rollback: 8000ms # 8 seconds
  measurement: 'Business data aggregation queries'

forecast_data_insert:
  warning: 500ms # 0.5 seconds
  critical: 1000ms # 1 second
  rollback: 2000ms # 2 seconds
  measurement: 'Forecast results insertion time'

connection_pool_usage:
  warning: 70% # 70% of pool utilized
  critical: 85% # 85% of pool utilized
  rollback: 95% # 95% of pool utilized
  measurement: 'PostgreSQL connection pool utilization'
```

### Reliability Thresholds

#### Error Rates

```yaml
api_error_rate:
  warning: 2% # 2% of requests failing
  critical: 5% # 5% of requests failing
  rollback: 10% # 10% of requests failing
  window: 300 # 5-minute rolling window
  measurement: 'HTTP 5xx errors across all AI endpoints'

health_calculation_failures:
  warning: 5% # 5% calculation failures
  critical: 10% # 10% calculation failures
  rollback: 20% # 20% calculation failures
  window: 300 # 5-minute rolling window
  measurement: 'Failed health score calculations'

quickbooks_sync_failures:
  warning: 10% # 10% sync failures
  critical: 25% # 25% sync failures
  rollback: 50% # 50% sync failures
  window: 600 # 10-minute rolling window
  measurement: 'Failed QuickBooks synchronization attempts'

ai_service_failures:
  warning: 15% # 15% AI service failures
  critical: 30% # 30% AI service failures
  rollback: 50% # 50% AI service failures
  window: 300 # 5-minute rolling window
  measurement: 'OpenAI API and recommendation service failures'
```

#### Availability Metrics

```yaml
system_uptime:
  warning: 99.5% # 99.5% uptime
  critical: 99.0% # 99% uptime
  rollback: 98.0% # 98% uptime
  window: 3600 # 1-hour rolling window
  measurement: 'Overall system availability'

health_dashboard_availability:
  warning: 99.0% # 99% dashboard availability
  critical: 97.0% # 97% dashboard availability
  rollback: 95.0% # 95% dashboard availability
  window: 1800 # 30-minute rolling window
  measurement: 'Health dashboard component availability'

database_connectivity:
  warning: 99.8% # 99.8% connectivity
  critical: 99.5% # 99.5% connectivity
  rollback: 99.0% # 99% connectivity
  window: 900 # 15-minute rolling window
  measurement: 'Database connection success rate'
```

#### Consecutive Failure Tracking

```yaml
consecutive_failures:
  health_calculation:
    warning: 3 # 3 consecutive failures
    critical: 5 # 5 consecutive failures
    rollback: 10 # 10 consecutive failures

  api_timeouts:
    warning: 3 # 3 consecutive timeouts
    critical: 5 # 5 consecutive timeouts
    rollback: 8 # 8 consecutive timeouts

  database_connections:
    warning: 2 # 2 consecutive connection failures
    critical: 3 # 3 consecutive connection failures
    rollback: 5 # 5 consecutive connection failures

  external_api_calls:
    warning: 5 # 5 consecutive external API failures
    critical: 10 # 10 consecutive external API failures
    rollback: 15 # 15 consecutive external API failures
```

## Resource Utilization Thresholds

### Infrastructure Metrics

```yaml
cpu_utilization:
  warning: 70% # 70% average CPU usage
  critical: 85% # 85% average CPU usage
  rollback: 95% # 95% average CPU usage
  window: 300 # 5-minute rolling average
  measurement: 'Server CPU utilization across all nodes'

memory_utilization:
  warning: 75% # 75% memory usage
  critical: 90% # 90% memory usage
  rollback: 95% # 95% memory usage
  window: 300 # 5-minute rolling average
  measurement: 'Server memory utilization'

disk_usage:
  warning: 80% # 80% disk usage
  critical: 90% # 90% disk usage
  rollback: 95% # 95% disk usage
  measurement: 'Primary storage disk utilization'

memory_leaks:
  warning: 10% # 10% memory growth per hour
  critical: 25% # 25% memory growth per hour
  rollback: 50% # 50% memory growth per hour
  window: 3600 # 1-hour window
  measurement: 'Sustained memory growth indicating leaks'
```

### Application Resource Metrics

```yaml
node_js_heap_usage:
  warning: 512MB # 512MB heap usage
  critical: 768MB # 768MB heap usage
  rollback: 1024MB # 1GB heap usage
  measurement: 'Node.js heap memory usage'

database_cache_hit_ratio:
  warning: 85% # Below 85% cache hit ratio
  critical: 75% # Below 75% cache hit ratio
  rollback: 60% # Below 60% cache hit ratio
  measurement: 'PostgreSQL buffer cache hit ratio'

concurrent_users:
  warning: 500 # 500 concurrent users
  critical: 750 # 750 concurrent users
  rollback: 1000 # 1000 concurrent users
  measurement: 'Concurrent users using AI features'
```

## Business Metrics Thresholds

### User Experience Metrics

```yaml
user_satisfaction_score:
  warning: 4.0 # Below 4.0/5.0 rating
  critical: 3.5 # Below 3.5/5.0 rating
  rollback: 3.0 # Below 3.0/5.0 rating
  window: 86400 # 24-hour rolling window
  measurement: 'Average user satisfaction rating'

feature_adoption_rate:
  warning: 40% # Below 40% adoption of new AI features
  critical: 25% # Below 25% adoption
  rollback: 15% # Below 15% adoption
  window: 604800 # 7-day rolling window
  measurement: 'Percentage of active users using AI features'

user_complaint_rate:
  warning: 1% # 1% of users filing complaints
  critical: 3% # 3% of users filing complaints
  rollback: 5% # 5% of users filing complaints
  window: 86400 # 24-hour rolling window
  measurement: 'Support tickets related to AI features'

session_abandonment_rate:
  warning: 15% # 15% of users leaving dashboard without interaction
  critical: 25% # 25% session abandonment
  rollback: 40% # 40% session abandonment
  window: 3600 # 1-hour rolling window
  measurement: 'Users leaving health dashboard immediately'
```

### Data Quality Metrics

```yaml
calculation_accuracy:
  warning: 90% # Below 90% accuracy vs manual calculations
  critical: 85% # Below 85% accuracy
  rollback: 80% # Below 80% accuracy
  window: 86400 # 24-hour window
  measurement: 'Health score accuracy against manual validation'

data_freshness:
  warning: 3600 # Data older than 1 hour
  critical: 7200 # Data older than 2 hours
  rollback: 14400 # Data older than 4 hours
  measurement: 'Age of most recent financial data sync'

forecast_accuracy:
  warning: 80% # Below 80% forecast accuracy
  critical: 70% # Below 70% forecast accuracy
  rollback: 60% # Below 60% forecast accuracy
  window: 2592000 # 30-day rolling window
  measurement: 'Forecast vs actual performance accuracy'

data_completeness:
  warning: 90% # Below 90% complete data for calculations
  critical: 80% # Below 80% complete data
  rollback: 70% # Below 70% complete data
  measurement: 'Percentage of required data fields populated'
```

### Cost Control Thresholds

```yaml
openai_api_costs:
  warning: 100 # $100/day in OpenAI API costs
  critical: 200 # $200/day in OpenAI API costs
  rollback: 500 # $500/day in OpenAI API costs
  window: 86400 # Daily window
  measurement: 'Daily OpenAI API usage costs'

cost_per_calculation:
  warning: 0.05 # $0.05 per health score calculation
  critical: 0.10 # $0.10 per calculation
  rollback: 0.25 # $0.25 per calculation
  measurement: 'Average cost per health score calculation'

infrastructure_costs:
  warning: 500 # $500/day infrastructure costs
  critical: 750 # $750/day infrastructure costs
  rollback: 1000 # $1000/day infrastructure costs
  window: 86400 # Daily window
  measurement: 'Daily AWS infrastructure costs for AI features'
```

## Security & Compliance Thresholds

### Security Metrics

```yaml
authentication_failures:
  warning: 10 # 10 failed auth attempts per minute
  critical: 25 # 25 failed auth attempts per minute
  rollback: 50 # 50 failed auth attempts per minute
  window: 60 # 1-minute window
  measurement: 'Failed authentication attempts'

data_access_anomalies:
  warning: 5 # 5 unusual data access patterns per hour
  critical: 10 # 10 unusual patterns per hour
  rollback: 20 # 20 unusual patterns per hour
  window: 3600 # 1-hour window
  measurement: 'Anomalous data access patterns'

api_abuse_detection:
  warning: 100 # 100 requests per minute from single IP
  critical: 250 # 250 requests per minute
  rollback: 500 # 500 requests per minute
  window: 60 # 1-minute window
  measurement: 'API abuse detection threshold'
```

### Data Privacy Compliance

```yaml
data_retention_violations:
  warning: 1 # Any data retention policy violation
  critical: 1 # Any violation is critical
  rollback: 1 # Immediate rollback on violation
  measurement: 'Data retention policy violations'

unauthorized_data_access:
  warning: 1 # Any unauthorized access attempt
  critical: 1 # Any attempt is critical
  rollback: 1 # Immediate rollback on detection
  measurement: 'Unauthorized data access attempts'

encryption_failures:
  warning: 1 # Any encryption failure
  critical: 1 # Any failure is critical
  rollback: 1 # Immediate rollback on failure
  measurement: 'Data encryption/decryption failures'
```

## Automated Rollback Triggers

### Immediate Rollback Triggers (No Human Approval)

```yaml
immediate_rollback_conditions:
  security_breach:
    trigger: 'unauthorized_data_access > 0'
    action: 'immediate_full_rollback'
    notification: 'security_team + c_suite'

  data_corruption:
    trigger: 'data_integrity_check_failure > 0'
    action: 'immediate_database_rollback'
    notification: 'engineering_team + dba'

  system_outage:
    trigger: 'system_uptime < 95% AND duration > 300'
    action: 'immediate_service_rollback'
    notification: 'on_call_team + engineering_manager'

  critical_performance:
    trigger: 'dashboard_load_time > 8000 AND consecutive_failures > 5'
    action: 'immediate_feature_rollback'
    notification: 'engineering_team'
```

### Escalated Rollback Triggers (Human Approval Required)

```yaml
escalated_rollback_conditions:
  performance_degradation:
    trigger: 'dashboard_load_time > 5000 AND user_complaint_rate > 3%'
    approval_required: 'tech_lead OR engineering_manager'
    escalation_timeout: 900 # 15 minutes
    default_action: 'automatic_rollback'

  business_impact:
    trigger: 'user_satisfaction_score < 3.5 AND feature_adoption_rate < 25%'
    approval_required: 'product_manager AND tech_lead'
    escalation_timeout: 1800 # 30 minutes
    default_action: 'continue_monitoring'

  cost_overrun:
    trigger: 'openai_api_costs > 200 OR cost_per_calculation > 0.10'
    approval_required: 'finance_team AND engineering_manager'
    escalation_timeout: 3600 # 60 minutes
    default_action: 'disable_cost_intensive_features'

  accuracy_concerns:
    trigger: 'calculation_accuracy < 85% OR forecast_accuracy < 70%'
    approval_required: 'product_manager AND data_science_lead'
    escalation_timeout: 3600 # 60 minutes
    default_action: 'continue_monitoring_with_warnings'
```

### Graduated Response System

```yaml
graduated_responses:
  level_1_warnings:
    conditions: "Any 'warning' threshold exceeded"
    actions:
      - 'Send alert to engineering team'
      - 'Increase monitoring frequency'
      - 'Log detailed metrics'
    duration: 300 # 5 minutes before escalation

  level_2_critical:
    conditions: "Any 'critical' threshold exceeded"
    actions:
      - 'Page on-call engineer'
      - 'Notify product manager'
      - 'Prepare rollback scripts'
      - 'Increase health check frequency'
    duration: 600 # 10 minutes before escalation

  level_3_emergency:
    conditions: "Any 'rollback' threshold exceeded"
    actions:
      - 'Execute automated rollback (if configured)'
      - 'Page engineering manager'
      - 'Notify all stakeholders'
      - 'Initiate incident response'
    duration: 0 # Immediate action
```

## Monitoring Dashboard Configuration

### Primary Dashboard Metrics

```yaml
real_time_dashboard:
  performance_panel:
    - 'Dashboard load time (current vs target)'
    - 'API response times (all endpoints)'
    - 'Database query performance'
    - 'Error rates (5-minute rolling)'

  reliability_panel:
    - 'System uptime (24-hour)'
    - 'Feature availability status'
    - 'Consecutive failure counts'
    - 'Alert status (all levels)'

  business_panel:
    - 'Active users using AI features'
    - 'User satisfaction metrics'
    - 'Feature adoption rates'
    - 'Cost tracking (daily)'

  infrastructure_panel:
    - 'CPU/Memory utilization'
    - 'Database connection pools'
    - 'Cache hit ratios'
    - 'External API status'
```

### Alert Configuration

```yaml
alert_channels:
  slack_channels:
    - "#ai-alerts" # All AI-related alerts
    - "#engineering-oncall" # Critical alerts
    - "#product-alerts" # Business metric alerts

  pagerduty_services:
    - "AI Health Analyzer Critical" # Critical/Rollback level
    - "AI Health Analyzer Warnings" # Warning level

  email_lists:
    - "ai-engineering-team@goodbuyhq.com"
    - "product-managers@goodbuyhq.com"
    - "executive-team@goodbuyhq.com" (Critical only)

alert_suppression:
  duplicate_suppression: 300  # 5 minutes
  maintenance_mode_suppression: true
  off_hours_suppression:
    warning_level: true
    critical_level: false
    rollback_level: false
```

## Custom Monitoring Scripts

### Health Check Automation

```typescript
// monitoring/health-checks.ts
export class AIHealthMonitor {
  private metrics: MetricsCollector
  private thresholds: MonitoringThresholds

  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const checks = await Promise.allSettled([
      this.checkDashboardPerformance(),
      this.checkAPIResponseTimes(),
      this.checkDatabasePerformance(),
      this.checkExternalIntegrations(),
      this.checkBusinessMetrics(),
      this.checkSecurityMetrics(),
    ])

    return this.processHealthCheckResults(checks)
  }

  private async checkDashboardPerformance(): Promise<PerformanceCheck> {
    const loadTime = await this.metrics.getDashboardLoadTime()
    const status = this.evaluateThreshold(
      loadTime,
      this.thresholds.dashboard_load_time
    )

    return {
      metric: 'dashboard_load_time',
      value: loadTime,
      threshold: this.thresholds.dashboard_load_time,
      status,
      timestamp: new Date(),
    }
  }

  private async checkAPIResponseTimes(): Promise<PerformanceCheck> {
    const endpoints = [
      '/api/health-scores',
      '/api/forecasts',
      '/api/recommendations',
    ]
    const responseTimes = await Promise.all(
      endpoints.map(endpoint => this.metrics.getAPIResponseTime(endpoint))
    )

    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const status = this.evaluateThreshold(
      avgResponseTime,
      this.thresholds.api_response_time
    )

    return {
      metric: 'api_response_time_avg',
      value: avgResponseTime,
      threshold: this.thresholds.api_response_time,
      status,
      details: { endpoints: responseTimes },
      timestamp: new Date(),
    }
  }

  private evaluateThreshold(
    value: number,
    threshold: ThresholdConfig
  ): 'ok' | 'warning' | 'critical' | 'rollback' {
    if (value >= threshold.rollback) return 'rollback'
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'ok'
  }

  async executeRollbackIfTriggered(
    healthResults: HealthCheckResult[]
  ): Promise<RollbackDecision> {
    const rollbackTriggers = healthResults.filter(
      result => result.status === 'rollback'
    )
    const criticalIssues = healthResults.filter(
      result => result.status === 'critical'
    )

    if (rollbackTriggers.length > 0) {
      return this.executeImmediateRollback(rollbackTriggers)
    }

    if (criticalIssues.length >= 2) {
      return this.requestRollbackApproval(criticalIssues)
    }

    return { shouldRollback: false }
  }
}
```

### Rollback Automation Script

```bash
#!/bin/bash
# automated-rollback.sh
# This script is triggered by monitoring alerts

set -e

ROLLBACK_REASON="$1"
AFFECTED_COMPONENTS="$2"
SEVERITY="$3"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/rollback.log
}

log "Automated rollback triggered: $ROLLBACK_REASON"
log "Affected components: $AFFECTED_COMPONENTS"
log "Severity: $SEVERITY"

# Send immediate notifications
./scripts/notify-emergency-contacts.sh "ROLLBACK_INITIATED" "$ROLLBACK_REASON"

# Execute rollback based on severity
case $SEVERITY in
    "immediate")
        log "Executing immediate full rollback"
        ./scripts/emergency-full-rollback.sh "$ROLLBACK_REASON"
        ;;
    "critical")
        log "Executing critical component rollback"
        ./scripts/component-rollback.sh "$AFFECTED_COMPONENTS" "$ROLLBACK_REASON"
        ;;
    "escalated")
        log "Requesting manual approval for rollback"
        ./scripts/request-rollback-approval.sh "$ROLLBACK_REASON" "$AFFECTED_COMPONENTS"
        ;;
esac

# Validate rollback success
log "Validating rollback execution"
./scripts/validate-rollback.sh

log "Automated rollback procedure completed"
```

## Testing & Validation

### Threshold Testing

```yaml
threshold_testing:
  load_testing:
    - 'Gradually increase load until warning thresholds are reached'
    - 'Verify alert notifications are sent correctly'
    - 'Validate graduated response system'

  failure_injection:
    - 'Introduce database connection failures'
    - 'Simulate API timeouts and errors'
    - 'Test external service outages'
    - 'Validate rollback trigger accuracy'

  cost_simulation:
    - 'Simulate high OpenAI API usage'
    - 'Test cost threshold alerting'
    - 'Validate cost-based rollback logic'

  security_testing:
    - 'Simulate security breach scenarios'
    - 'Test immediate rollback triggers'
    - 'Validate data protection measures'
```

### Monitoring Validation

```bash
#!/bin/bash
# validate-monitoring.sh

echo "Validating monitoring configuration..."

# Test alert channels
./test-alert-channel.sh "slack"
./test-alert-channel.sh "pagerduty"
./test-alert-channel.sh "email"

# Test threshold calculations
./test-threshold-logic.sh "performance"
./test-threshold-logic.sh "reliability"
./test-threshold-logic.sh "business"

# Test rollback automation
./test-rollback-triggers.sh "simulated"

echo "Monitoring validation completed"
```

---

**Document Control:**

- Version: 1.0
- Last Updated: September 3, 2025
- Next Review: September 17, 2025
- Dependencies: Rollback Strategy, Epic Dependency Mapping
- Approved By: DevOps Lead, Engineering Manager, SRE Team

**Monitoring Contacts:**

- Primary On-Call: +1-555-ONCALL-1
- Secondary On-Call: +1-555-ONCALL-2
- DevOps Team: devops@goodbuyhq.com
- Emergency Escalation: emergency-engineering@goodbuyhq.com

**Dashboard URLs:**

- Primary Monitoring: https://monitoring.goodbuyhq.com/ai-health
- Rollback Dashboard: https://monitoring.goodbuyhq.com/rollback-status
- Cost Tracking: https://monitoring.goodbuyhq.com/cost-analysis

This comprehensive monitoring and alerting system ensures proactive detection of issues and enables automated decision-making for rollback procedures while maintaining the reliability and performance of both AI features and the underlying GoodBuy HQ platform.
