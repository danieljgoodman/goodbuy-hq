-- CreateEnum
CREATE TYPE "public"."HealthTrajectory" AS ENUM ('IMPROVING', 'STABLE', 'DECLINING', 'VOLATILE');

-- CreateEnum
CREATE TYPE "public"."ForecastType" AS ENUM ('REVENUE', 'EXPENSES', 'PROFIT', 'CASH_FLOW', 'GROWTH_RATE');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('SCORE_DROP', 'FORECAST_ALERT', 'DATA_ANOMALY', 'THRESHOLD_BREACH');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."health_metrics" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "overallScore" SMALLINT NOT NULL,
    "growthScore" SMALLINT NOT NULL,
    "operationalScore" SMALLINT NOT NULL,
    "financialScore" SMALLINT NOT NULL,
    "saleReadinessScore" SMALLINT NOT NULL,
    "confidenceLevel" SMALLINT NOT NULL,
    "trajectory" "public"."HealthTrajectory" NOT NULL DEFAULT 'STABLE',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSources" JSONB,
    "calculationMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."forecast_results" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "forecastType" "public"."ForecastType" NOT NULL,
    "forecastPeriod" SMALLINT NOT NULL,
    "predictedValue" DECIMAL(15,2) NOT NULL,
    "confidenceIntervalLower" DECIMAL(15,2) NOT NULL,
    "confidenceIntervalUpper" DECIMAL(15,2) NOT NULL,
    "confidenceScore" SMALLINT NOT NULL,
    "modelUsed" VARCHAR(50) NOT NULL,
    "actualValue" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecast_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quickbooks_connections" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "companyId" VARCHAR(100) NOT NULL,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncErrors" JSONB,
    "webhookSubscriptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quickbooks_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."health_alerts" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" "public"."AlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "thresholdValue" DECIMAL(10,2),
    "actualValue" DECIMAL(10,2),
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_health_metrics_business_date" ON "public"."health_metrics"("businessId", "calculatedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_forecast_results_business_type" ON "public"."forecast_results"("businessId", "forecastType");

-- CreateIndex
CREATE UNIQUE INDEX "quickbooks_connections_businessId_key" ON "public"."quickbooks_connections"("businessId");

-- CreateIndex
CREATE INDEX "idx_quickbooks_connections_company" ON "public"."quickbooks_connections"("companyId");

-- CreateIndex
CREATE INDEX "idx_health_alerts_business_severity" ON "public"."health_alerts"("businessId", "severity", "triggeredAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."health_metrics" ADD CONSTRAINT "health_metrics_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."forecast_results" ADD CONSTRAINT "forecast_results_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quickbooks_connections" ADD CONSTRAINT "quickbooks_connections_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."health_alerts" ADD CONSTRAINT "health_alerts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."health_alerts" ADD CONSTRAINT "health_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;