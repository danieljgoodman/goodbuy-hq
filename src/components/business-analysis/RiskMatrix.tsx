import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Info } from 'lucide-react'

interface Risk {
  id: string
  category: string
  description: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  mitigation?: string
}

interface RiskMatrixProps {
  title?: string
  risks: Risk[]
  className?: string
}

export function RiskMatrix({
  title = 'Risk Assessment Matrix',
  risks,
  className,
}: RiskMatrixProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return <AlertTriangle className="w-4 h-4" />
      case 'Medium':
        return <Info className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const groupedRisks = risks.reduce(
    (acc, risk) => {
      if (!acc[risk.category]) {
        acc[risk.category] = []
      }
      acc[risk.category].push(risk)
      return acc
    },
    {} as Record<string, Risk[]>
  )

  return (
    <Card
      className={className}
      role="table"
      aria-label="Risk assessment matrix table"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Comprehensive risk analysis across all business areas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedRisks).map(([category, categoryRisks]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-2">
              {categoryRisks.map(risk => (
                <div
                  key={risk.id}
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(risk.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(risk.severity)}
                      <span className="font-medium">{risk.description}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {risk.severity}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Probability: </span>
                      <Badge variant="secondary" className="text-xs">
                        {risk.probability}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Impact: </span>
                      <Badge variant="secondary" className="text-xs">
                        {risk.impact}
                      </Badge>
                    </div>
                  </div>

                  {risk.mitigation && (
                    <div className="text-sm">
                      <span className="font-medium">Mitigation: </span>
                      <span className="text-muted-foreground">
                        {risk.mitigation}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Risk Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Critical', 'High', 'Medium', 'Low'].map(level => {
              const count = risks.filter(r => r.severity === level).length
              return (
                <div key={level} className="space-y-1">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {level} Risk{count !== 1 ? 's' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RiskMatrix
