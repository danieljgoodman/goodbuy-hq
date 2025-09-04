# Component Standards

Based on your existing ShadCN UI foundation and React 18 patterns, I'm defining component standards that maintain consistency while supporting AI SaaS enhancements. These standards preserve your established development patterns while enabling sophisticated AI features.

## Component Template

```typescript
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// AI-specific types building on existing patterns
interface AIAnalysisCardProps {
  businessId: string
  analysisType: 'health' | 'valuation' | 'forecast'
  isStreaming?: boolean
  confidence?: number
  onAnalyze?: () => void
  className?: string
}

// Component following established ShadCN patterns
export function AIAnalysisCard({ 
  businessId, 
  analysisType, 
  isStreaming = false,
  confidence,
  onAnalyze,
  className 
}: AIAnalysisCardProps) {
  // Hooks follow existing patterns
  const [isLoading, setIsLoading] = React.useState(false)

  // Event handlers maintain existing patterns
  const handleAnalyze = React.useCallback(() => {
    setIsLoading(true)
    onAnalyze?.()
  }, [onAnalyze])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {analysisType === 'health' && 'Business Health Analysis'}
          {analysisType === 'valuation' && 'AI Valuation'}
          {analysisType === 'forecast' && 'Financial Forecast'}
          {confidence && (
            <span className="text-sm text-muted-foreground">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI-specific content using existing UI patterns */}
          {isStreaming && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}
          
          <Button 
            onClick={handleAnalyze}
            disabled={isLoading || isStreaming}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Start Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Export component with display name for debugging
AIAnalysisCard.displayName = 'AIAnalysisCard'

// Type exports for reuse
export type { AIAnalysisCardProps }
```

## Naming Conventions

**Component Naming**: 
- **AI Components**: Prefix with `AI` for analysis-specific components (`AIHealthScoreRing`, `AIStreamingProgress`)
- **Generic Components**: Use descriptive names following existing patterns (`SubscriptionPlanCard`, `UsageMetrics`)
- **Page Components**: Suffix with `Page` for route components (`AIToolsDashboardPage`, `PortfolioManagementPage`)

**File Naming**:
- **Components**: PascalCase matching component name (`AIAnalysisCard.tsx`, `ReportBuilder.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-ai-analysis.ts`, `use-subscription.ts`)
- **Utilities**: kebab-case descriptive (`health-calculator.ts`, `streaming-client.ts`)
- **Types**: kebab-case with domain prefix (`ai-types.ts`, `subscription-types.ts`)

**Props and State**:
- **Props**: camelCase with descriptive names (`businessId`, `analysisType`, `isStreaming`)
- **State**: camelCase with action prefixes (`isLoading`, `hasError`, `streamingData`)
- **Handlers**: camelCase with `handle` prefix (`handleAnalyze`, `handleSubscriptionChange`)

**Directory Organization**:
- **Feature Groups**: kebab-case directories (`ai-analysis/`, `subscription-management/`)
- **Component Collections**: plural descriptive names (`charts/`, `forms/`, `dashboards/`)
- **Shared Utilities**: singular descriptive names (`validation/`, `utils/`, `constants/`)

---
