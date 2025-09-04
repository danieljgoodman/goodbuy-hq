# Frontend Developer Standards

## Critical Coding Rules

Based on your existing codebase patterns and the complexity of AI SaaS features, these rules prevent common implementation mistakes while ensuring financial data accuracy and professional user experience quality.

### Universal Critical Rules

1. **Financial Data Precision**: Always use `Decimal` or `BigNumber` for financial calculations. Never use JavaScript's native `Number` for currency values, percentages, or business metrics that affect analysis results.

```typescript
// ❌ WRONG - Float precision errors
const profitMargin = ((revenue - costs) / revenue) * 100

// ✅ CORRECT - Decimal precision
import { Decimal } from 'decimal.js'
const profitMargin = new Decimal(revenue).minus(costs).div(revenue).mul(100)
```

2. **TypeScript Strict Mode Enforcement**: All AI analysis components must use strict TypeScript with `noImplicitAny`, `strictNullChecks`, and `strictFunctionTypes`. Financial calculations require explicit type safety.

3. **Real-time State Immutability**: AI streaming components must never mutate state directly. Use Immer or immutable update patterns to prevent race conditions during concurrent analysis operations.

4. **WebSocket Connection Management**: Always implement proper cleanup for WebSocket connections. Memory leaks in streaming components affect performance during long AI analysis sessions.

### Next.js 14 App Router Specific Rules

5. **Server Component Financial Data**: Financial calculations in Server Components must be deterministic and cacheable. Use `unstable_cache` for expensive health score calculations.

6. **Dynamic Route Validation**: All dynamic routes with financial data must validate parameters using Zod schemas. Invalid business IDs must result in proper 404 responses.

### AI Analysis Component Rules

7. **Confidence Score Display**: AI confidence indicators must always show both percentage and qualitative assessment. Never display confidence below 60% without warning.

8. **Streaming Progress Accuracy**: Progress indicators must reflect actual AI analysis stages. Never fake progress for perceived performance.

## Quick Reference

### Common Commands

```bash
# Development server with proper environment
npm run dev

# Build with type checking and AI analysis validation
npm run build && npm run type-check

# Run comprehensive tests including AI algorithms
npm run test && npm run test:integration

# Database operations with AI schema
npm run db:migrate && npm run db:generate
```

### Key Import Patterns

```typescript
// ShadCN UI components (existing patterns)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// AI-specific components
import { AIHealthScoreRing } from '@/components/ai/analysis/health-score-ring'
import { StreamingProgressBar } from '@/components/ai/analysis/streaming-progress-bar'

// Services and utilities
import { aiAnalysisService } from '@/lib/services/ai-analysis-service'
import { subscriptionService } from '@/lib/services/subscription-service'

// State management
import { useAIAnalysis } from '@/hooks/use-ai-analysis'
import { useSubscription } from '@/hooks/use-subscription'
```

### File Naming Conventions

- **AI Components**: `ai-health-score-ring.tsx`, `streaming-progress-indicator.tsx`
- **Subscription Components**: `subscription-plan-card.tsx`, `usage-metrics-display.tsx`
- **Service Files**: `ai-analysis-service.ts`, `subscription-service.ts`
- **Hook Files**: `use-ai-analysis.ts`, `use-streaming-client.ts`
- **Type Files**: `ai-types.ts`, `subscription-types.ts`

### Project-Specific Patterns

- **AI Analysis Results**: Always cache expensive calculations with proper revalidation
- **WebSocket Connections**: Implement heartbeat and reconnection logic for reliability
- **Financial Calculations**: Use Decimal.js for all currency and percentage calculations
- **Subscription Features**: Check feature flags and user tier before rendering premium components
- **Error Boundaries**: Wrap AI components with error boundaries that handle streaming failures gracefully

---
