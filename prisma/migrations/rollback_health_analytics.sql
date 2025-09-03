-- Rollback script for health analytics tables
-- Execute this if you need to revert the migration

-- Drop foreign key constraints first
ALTER TABLE "public"."health_alerts" DROP CONSTRAINT IF EXISTS "health_alerts_userId_fkey";
ALTER TABLE "public"."health_alerts" DROP CONSTRAINT IF EXISTS "health_alerts_businessId_fkey";
ALTER TABLE "public"."quickbooks_connections" DROP CONSTRAINT IF EXISTS "quickbooks_connections_businessId_fkey";
ALTER TABLE "public"."forecast_results" DROP CONSTRAINT IF EXISTS "forecast_results_businessId_fkey";
ALTER TABLE "public"."health_metrics" DROP CONSTRAINT IF EXISTS "health_metrics_businessId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "public"."idx_health_alerts_business_severity";
DROP INDEX IF EXISTS "public"."idx_quickbooks_connections_company";
DROP INDEX IF EXISTS "public"."quickbooks_connections_businessId_key";
DROP INDEX IF EXISTS "public"."idx_forecast_results_business_type";
DROP INDEX IF EXISTS "public"."idx_health_metrics_business_date";

-- Drop tables
DROP TABLE IF EXISTS "public"."health_alerts";
DROP TABLE IF EXISTS "public"."quickbooks_connections";
DROP TABLE IF EXISTS "public"."forecast_results";
DROP TABLE IF EXISTS "public"."health_metrics";

-- Drop enums
DROP TYPE IF EXISTS "public"."AlertSeverity";
DROP TYPE IF EXISTS "public"."AlertType";
DROP TYPE IF EXISTS "public"."SyncStatus";
DROP TYPE IF EXISTS "public"."ForecastType";
DROP TYPE IF EXISTS "public"."HealthTrajectory";