import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calculator, TrendingUp, Award } from 'lucide-react'

interface ValuationMethod {
  name: string
  value: number
  weight: number
  confidence: number
}

interface ValuationSummaryProps {
  title?: string
  finalValuation: number
  currency?: string
  confidenceScore: number
  methods: ValuationMethod[]
  lastUpdated?: Date
  className?: string
}

export function ValuationSummary({
  title = 'Business Valuation',
  finalValuation,
  currency = 'USD',
  confidenceScore,
  methods,
  lastUpdated = new Date(),
  className,
}: ValuationSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High'
    if (score >= 60) return 'Medium'
    return 'Low'
  }

  return (
    <Card
      className={className}
      role="region"
      aria-label="Business valuation summary"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          {title}
        </CardTitle>
        <CardDescription>
          Comprehensive valuation analysis as of{' '}
          {lastUpdated.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Final Valuation */}
        <div className="text-center p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Estimated Value
          </p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(finalValuation)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Award
              className={`w-4 h-4 ${getConfidenceColor(confidenceScore)}`}
            />
            <span
              className={`text-sm font-medium ${getConfidenceColor(confidenceScore)}`}
            >
              {getConfidenceLabel(confidenceScore)} Confidence
            </span>
            <Badge variant="outline" className="ml-2">
              {confidenceScore}%
            </Badge>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Score</span>
            <span className="text-sm text-muted-foreground">
              {confidenceScore}%
            </span>
          </div>
          <Progress value={confidenceScore} className="h-2" />
        </div>

        {/* Valuation Methods */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Valuation Methods</h4>
          {methods.map((method, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-md bg-muted/30"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{method.name}</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {method.weight}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {formatCurrency(method.value)}
                </p>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      method.confidence >= 75
                        ? 'bg-green-500'
                        : method.confidence >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {method.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-semibold">Key Insights</h4>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">
              Multiple methodology validation increases accuracy
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ValuationSummary
