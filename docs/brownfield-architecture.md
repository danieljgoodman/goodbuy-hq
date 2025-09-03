# GoodBuy HQ Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the GoodBuy HQ codebase, including technical debt, patterns, and real-world implementation details. It serves as a reference for AI agents working on the AI Financial Health Analyzer enhancement.

### Document Scope

**Primary Focus**: Architecture analysis for implementing the AI Financial Health Analyzer enhancement as defined in `docs/AI_FINANCIAL_HEALTH_ANALYZER_PRD.md`.

**Secondary**: Complete system documentation for future development work.

### Change Log

| Date       | Version | Description                 | Author                |
| ---------- | ------- | --------------------------- | --------------------- |
| 2025-09-03 | 1.0     | Initial brownfield analysis | Business Analyst Mary |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/app/layout.tsx` (Root layout with providers)
- **Home Page**: `src/app/page.tsx` (Landing page composition)
- **Configuration**: `next.config.js`, `tailwind.config.ts`, `.env.example`
- **Database Schema**: `prisma/schema.prisma` (Complete data model)
- **Auth Configuration**: `src/lib/auth-utils.ts`, NextAuth.js integration
- **AI Service**: `src/lib/openai.ts` (Existing OpenAI integration)
- **Core Business Logic**: `src/app/api/` (API routes)

### Enhancement Impact Areas (AI Financial Health Analyzer)

**Files That Will Be Modified:**

- `prisma/schema.prisma` - Add health metrics, forecasts, QuickBooks integration tables
- `src/app/api/` - New API routes for health scoring, forecasting, QuickBooks sync
- `src/app/dashboard/` - Enhanced dashboards with health analytics
- `src/lib/` - New services for health calculation, forecasting, integrations

**New Files/Modules Needed:**

- `src/lib/quickbooks.ts` - QuickBooks API integration service
- `src/lib/health-scoring.ts` - Health calculation algorithms
- `src/lib/forecasting.ts` - Predictive analytics engine
- `src/app/api/health/` - Health scoring API endpoints
- `src/app/api/quickbooks/` - Integration API endpoints
- `src/components/health/` - Health dashboard components

## High Level Architecture

### Technical Summary

GoodBuy HQ is a **modern full-stack Next.js 14 application** with a comprehensive business listing and evaluation platform. The architecture follows **App Router patterns** with server/client component separation, **PostgreSQL database** with Prisma ORM, and **component-based UI** using RadixUI and ShadCN.

### Actual Tech Stack

| Category  | Technology   | Version | Notes                         |
| --------- | ------------ | ------- | ----------------------------- |
| Runtime   | Node.js      | 18+     | Required for Next.js 14       |
| Framework | Next.js      | 14.2.32 | App Router, Server Components |
| Language  | TypeScript   | 5.7.2   | Strict mode enabled           |
| Database  | PostgreSQL   | 14+     | Via Prisma ORM                |
| ORM       | Prisma       | 6.14.0  | Schema-first approach         |
| Auth      | NextAuth.js  | 4.24.11 | Multiple user types           |
| UI        | React        | 18.3.1  | With RadixUI primitives       |
| Styling   | Tailwind CSS | 3.4.17  | Custom color system           |
| AI/ML     | OpenAI       | 5.16.0  | GPT-4 integration             |
| Charts    | Chart.js     | 4.5.0   | Business analytics            |

### Repository Structure Reality Check

- **Type**: Monorepo (single Next.js app)
- **Package Manager**: npm (based on package-lock.json)
- **Notable**: Well-organized with clear separation of concerns

## Source Tree and Module Organization

### Project Structure (Actual)

```text
goodbuy-hq/
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── api/                 # API routes (business, auth, communications)
│   │   ├── auth/                # Authentication pages (signin, signup, verify)
│   │   ├── business/[slug]/     # Dynamic business detail pages
│   │   ├── dashboard/           # Multi-role dashboards (admin, broker, buyer, business-owner)
│   │   ├── calculator/          # Business valuation calculator
│   │   ├── marketplace/         # Business listings marketplace
│   │   ├── messages/            # Communication system
│   │   ├── sell/                # Business selling workflow
│   │   ├── globals.css          # Global styles (23KB - comprehensive)
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Landing page composition
│   ├── components/              # React components
│   │   ├── layout/              # Header, footer, navigation components
│   │   ├── sections/            # Landing page sections (hero, services, testimonials)
│   │   ├── ui/                  # Reusable UI components (buttons, forms, dialogs)
│   │   ├── providers/           # Context providers (session, theme, toast)
│   │   └── seo/                 # SEO components (structured data)
│   ├── lib/                     # Core utilities and services
│   │   ├── prisma.ts            # Database client
│   │   ├── openai.ts            # AI service with rate limiting & cost tracking
│   │   ├── auth-utils.ts        # Authentication utilities
│   │   ├── email.ts             # Email service
│   │   ├── storage.ts           # File storage utilities
│   │   ├── pdf-export.ts        # PDF generation
│   │   └── utils.ts             # Common utilities
│   ├── types/                   # TypeScript definitions
│   │   ├── business.ts          # Business-related types
│   │   ├── valuation.ts         # Valuation algorithm types
│   │   └── next-auth.d.ts       # NextAuth type extensions
│   └── middleware.ts            # Route protection and redirects
├── prisma/                      # Database schema and migrations
│   └── schema.prisma           # Complete data model (20+ models)
├── public/                      # Static assets
├── docs/                        # Project documentation
└── configuration files          # Next.js, TypeScript, ESLint, etc.
```

### Key Modules and Their Purpose

**Authentication & Authorization**:

- `src/lib/auth-utils.ts` - Custom auth utilities
- `src/app/api/auth/` - NextAuth.js configuration
- `src/middleware.ts` - Route protection

**Business Logic**:

- `src/app/api/businesses/` - Business CRUD operations
- `src/app/api/business-analysis/` - Valuation algorithms
- `src/lib/industry-data.ts` - Industry benchmarks

**Communication System**:

- `src/app/api/communications/` - Messaging, meetings, document sharing
- Real-time features with Socket.IO

**AI Integration**:

- `src/lib/openai.ts` - Sophisticated OpenAI service with rate limiting, retry logic, cost tracking
- `src/app/api/ai-usage/` - AI usage tracking

## Data Models and APIs

### Database Models (PostgreSQL + Prisma)

**Core Models**:

- **User** - Multi-role users (Business Owner, Buyer, Broker, Admin)
- **Business** - Comprehensive business listings with 40+ fields
- **Evaluation** - Business evaluation results with SWOT analysis
- **Communication System** - Threads, messages, meetings, documents
- **File Management** - Business images, documents, shared files

**Key Relationships**:

- User → Business (owner relationship)
- Business → Evaluations (multiple evaluations per business)
- Communication threads → Messages, meetings, documents
- Comprehensive audit logging for all interactions

### API Specifications

**Existing API Routes**:

- `/api/auth/` - NextAuth.js authentication
- `/api/businesses/` - Business CRUD operations
- `/api/business-analysis/` - Valuation and analysis
- `/api/communications/` - Messaging and meetings
- `/api/upload/` - File upload handling

**API Patterns**:

- RESTful design with proper HTTP methods
- TypeScript interfaces for request/response
- Error handling and validation
- Rate limiting on AI endpoints

## Integration Points and External Dependencies

### External Services

| Service       | Purpose        | Integration Type | Key Files                         |
| ------------- | -------------- | ---------------- | --------------------------------- |
| OpenAI        | AI Analysis    | REST API + SDK   | `src/lib/openai.ts`               |
| NextAuth      | Authentication | SDK              | `src/app/api/auth/[...nextauth]/` |
| AWS S3        | File Storage   | AWS SDK          | `src/lib/storage.ts`              |
| Email Service | Notifications  | SMTP/API         | `src/lib/email.ts`                |

### Internal Integration Points

**Frontend ↔ Backend**:

- REST API communication
- Server/Client component architecture
- Real-time updates via Socket.IO

**Database Access**:

- Prisma ORM for all database operations
- Type-safe database queries
- Migration-based schema management

## Development and Deployment

### Local Development Setup

**Working Commands**:

```bash
npm install              # Install dependencies
npm run dev             # Development server (localhost:3000)
npm run build           # Production build
npm run type-check      # TypeScript validation
npm run lint            # ESLint checking
npm run db:push         # Push schema to database
npm run db:studio       # Prisma Studio GUI
```

**Environment Variables** (see `.env.example`):

- Database connection string
- NextAuth configuration
- OpenAI API key
- AWS credentials
- Email service config

### Build and Deployment Process

**Build System**:

- Next.js built-in build system
- TypeScript compilation
- Tailwind CSS processing
- Bundle optimization and code splitting

**Quality Checks**:

- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Prettier for code formatting
- No test framework currently configured ⚠️

## Technical Debt and Known Issues

### Areas Needing Attention

1. **Testing Gap**
   - No test framework configured
   - Manual testing only
   - **Impact**: Risk for new feature development

2. **AI Cost Management**
   - OpenAI service has cost tracking but no budget limits
   - **Impact**: Potential runaway costs

3. **Performance Optimization**
   - Large CSS file (23KB globals.css)
   - Bundle analysis available but not regularly used
   - **Impact**: Page load times

4. **Documentation**
   - Comprehensive README but limited API docs
   - No automated documentation generation
   - **Impact**: Development onboarding

### Constraints and Gotchas

**Database**:

- Prisma generates types that must be regenerated after schema changes
- Migration strategy needed for production schema changes

**Authentication**:

- NextAuth.js configuration is complex with multiple user types
- Session management requires careful handling

**AI Integration**:

- Rate limiting configured (10 requests/minute)
- Retry logic with exponential backoff
- Cost tracking implemented

## Enhancement Implementation Strategy (AI Financial Health Analyzer)

### Database Schema Extensions Needed

```sql
-- New tables required for health analyzer
CREATE TABLE health_metrics (
  -- Health scoring data
  overall_score INTEGER,
  growth_score INTEGER,
  operational_score INTEGER,
  financial_score INTEGER,
  sale_readiness_score INTEGER,
  confidence_level INTEGER,
  trajectory health_trajectory_enum,
  -- Reference existing business
  business_id UUID REFERENCES businesses(id)
);

CREATE TABLE forecast_results (
  -- Predictive analytics data
  business_id UUID REFERENCES businesses(id),
  forecast_type forecast_type_enum,
  predicted_value DECIMAL,
  confidence_intervals JSONB
);

CREATE TABLE quickbooks_connections (
  -- OAuth integration data
  business_id UUID REFERENCES businesses(id),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  last_sync_at TIMESTAMP
);
```

### Integration Architecture

**QuickBooks Integration Flow**:

1. OAuth 2.0 authentication
2. Webhook subscription for real-time updates
3. Data synchronization and transformation
4. Health score recalculation triggers

**Health Scoring Pipeline**:

1. Financial data ingestion (QuickBooks or manual)
2. Multi-dimensional scoring algorithms
3. Trend analysis and trajectory calculation
4. Confidence scoring based on data completeness

**Forecasting Engine**:

1. Historical data analysis
2. Multiple prediction models (ARIMA, regression, neural)
3. Ensemble predictions with confidence intervals
4. Scenario modeling capabilities

### Recommended Implementation Approach

**Phase 1: Infrastructure** (1-2 weeks)

- Database schema extensions
- Basic QuickBooks OAuth integration
- Health scoring framework

**Phase 2: Core Features** (2-3 weeks)

- Health calculation algorithms
- Basic forecasting engine
- Dashboard integration

**Phase 3: Polish** (1-2 weeks)

- Advanced analytics
- Alert system
- Performance optimization

### Leveraging Existing Infrastructure

**80% Code Reuse Opportunities**:

- User management and authentication system
- Business data models and relationships
- Dashboard framework and UI components
- API patterns and middleware
- OpenAI integration service
- File upload and storage systems

**Key Integration Points**:

- Extend existing business evaluation system
- Integrate with current dashboard architecture
- Leverage existing OpenAI service for insights
- Use established UI component library

## Appendix - Useful Commands and Scripts

### Development Workflow

```bash
# Database operations
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Create and apply migrations
npm run db:studio      # Open Prisma Studio

# Code quality
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format with Prettier
npm run type-check     # TypeScript validation

# Build and deployment
npm run build          # Production build
npm run start          # Production server
```

### Debugging and Troubleshooting

**Common Issues**:

- Prisma client needs regeneration after schema changes
- Environment variables must be configured for all services
- Build process requires all TypeScript errors to be resolved

**Monitoring**:

- OpenAI service logs API usage and costs
- Next.js provides build analysis with `ANALYZE=true`
- Database queries can be monitored through Prisma

This architecture document provides the foundation for implementing the AI Financial Health Analyzer while leveraging the existing robust infrastructure of GoodBuy HQ.
