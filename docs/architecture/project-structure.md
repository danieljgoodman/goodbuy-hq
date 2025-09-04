# Project Structure

Based on your existing Next.js 14 App Router architecture, I'm defining the enhanced project structure that preserves current organization while adding AI SaaS capabilities. This structure follows Next.js best practices and maintains backward compatibility.

```
goodbuy-hq/
├── app/                          # Next.js 14 App Router (existing)
│   ├── (auth)/                   # Auth route group (existing)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main app route group (existing)
│   │   ├── dashboard/            # Current dashboard (preserved)
│   │   ├── businesses/           # Business management (existing)
│   │   └── settings/             # User settings (enhanced with subscriptions)
│   ├── ai-tools/                 # NEW: AI SaaS features route group
│   │   ├── dashboard/            # AI tools hub and overview
│   │   ├── analysis/             # Real-time AI analysis interface
│   │   │   └── [businessId]/     # Dynamic business analysis routes
│   │   ├── portfolio/            # Portfolio management dashboard
│   │   │   └── [portfolioId]/    # Individual portfolio views
│   │   ├── reports/              # Professional report builder
│   │   │   ├── builder/          # Report customization interface
│   │   │   └── [reportId]/       # Generated report views
│   │   └── subscription/         # Usage analytics and billing
│   ├── api/                      # API routes (existing + enhanced)
│   │   ├── auth/                 # NextAuth routes (existing)
│   │   ├── businesses/           # Business CRUD (existing)
│   │   ├── ai/                   # NEW: AI analysis endpoints
│   │   │   ├── analyze/          # Real-time analysis API
│   │   │   ├── stream/           # WebSocket streaming handlers
│   │   │   ├── health/           # Health scoring API
│   │   │   └── portfolio/        # Bulk analysis endpoints
│   │   ├── reports/              # NEW: Professional report generation
│   │   │   ├── generate/         # PDF/Excel export API
│   │   │   └── templates/        # White-label template management
│   │   ├── subscription/         # NEW: Stripe billing integration
│   │   │   ├── webhook/          # Billing event handlers
│   │   │   └── usage/            # Usage tracking endpoints
│   │   └── upload/               # File processing (enhanced for CSV/Excel)
│   ├── globals.css               # Global styles with AI component themes
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Landing page
├── components/                   # React components (existing + enhanced)
│   ├── ui/                       # ShadCN UI components (existing)
│   ├── forms/                    # Form components (enhanced validation)
│   ├── charts/                   # Data visualization (existing)
│   ├── ai/                       # NEW: AI-specific components
│   │   ├── analysis/             # Real-time analysis components
│   │   │   ├── StreamingProgress.tsx
│   │   │   ├── HealthScoreRing.tsx
│   │   │   └── ConfidenceIndicator.tsx
│   │   ├── dashboard/            # AI dashboard components
│   │   │   ├── ToolCard.tsx
│   │   │   ├── UsageTracker.tsx
│   │   │   └── RecentAnalyses.tsx
│   │   ├── portfolio/            # Portfolio management components
│   │   │   ├── BusinessGrid.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── BulkActions.tsx
│   │   └── reports/              # Professional reporting components
│   │       ├── ReportBuilder.tsx
│   │       ├── TemplateSelector.tsx
│   │       └── WhiteLabelConfig.tsx
│   ├── subscription/             # NEW: Subscription management components
│   │   ├── PlanSelector.tsx
│   │   ├── UsageMetrics.tsx
│   │   └── BillingHistory.tsx
│   └── navigation/               # Enhanced navigation with AI tools
├── lib/                          # Utility libraries (existing + enhanced)
│   ├── auth.ts                   # NextAuth configuration (existing)
│   ├── db.ts                     # Prisma client (existing)
│   ├── ai/                       # NEW: AI analysis utilities
│   │   ├── analysis-engine.ts    # Core AI analysis algorithms
│   │   ├── health-calculator.ts  # Health scoring logic
│   │   ├── confidence-scorer.ts  # Analysis confidence calculation
│   │   └── streaming-client.ts   # WebSocket streaming utilities
│   ├── reports/                  # NEW: Report generation utilities
│   │   ├── pdf-generator.ts      # Professional PDF creation
│   │   ├── excel-exporter.ts     # Excel report generation
│   │   └── template-engine.ts    # White-label template processing
│   ├── subscription/             # NEW: Subscription management
│   │   ├── stripe-client.ts      # Stripe API integration
│   │   ├── usage-tracker.ts      # Credit consumption tracking
│   │   └── tier-manager.ts       # Feature access control
│   ├── validation/               # Enhanced Zod schemas
│   └── utils.ts                  # Utility functions (existing)
├── prisma/                       # Database schema (existing + enhanced)
│   ├── schema.prisma             # Enhanced with subscription tables
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets (existing + AI assets)
│   ├── images/
│   ├── ai-icons/                 # NEW: AI tool icons and illustrations
│   └── report-templates/         # NEW: Professional report assets
├── hooks/                        # Custom React hooks (existing + enhanced)
│   ├── use-auth.ts               # Authentication hook (existing)
│   ├── use-ai-analysis.ts        # NEW: AI analysis state management
│   ├── use-streaming.ts          # NEW: Real-time streaming hook
│   ├── use-subscription.ts       # NEW: Subscription management hook
│   └── use-portfolio.ts          # NEW: Portfolio management hook
├── types/                        # TypeScript definitions (enhanced)
│   ├── auth.ts                   # Authentication types (existing)
│   ├── business.ts               # Business data types (existing)
│   ├── ai.ts                     # NEW: AI analysis types
│   ├── subscription.ts           # NEW: Subscription and billing types
│   └── reports.ts                # NEW: Professional reporting types
├── styles/                       # Styling configuration (existing)
│   └── globals.css               # Enhanced with AI component styles
└── tests/                        # Testing (existing + enhanced)
    ├── components/               # Component tests
    ├── api/                      # API route tests
    ├── ai/                       # NEW: AI algorithm validation tests
    └── integration/              # End-to-end tests
```

---
