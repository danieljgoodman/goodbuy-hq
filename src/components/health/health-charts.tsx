'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  Target,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Zap,
} from 'lucide-react'

export interface HealthMetricData {
  overallScore: number
  growthScore: number
  operationalScore: number
  financialScore: number
  saleReadinessScore: number
  confidenceLevel?: number
  trajectory?: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE'
  benchmarks?: {
    growth: number
    operational: number
    financial: number
    saleReadiness: number
  }
}

interface HealthChartsProps {
  data: HealthMetricData
  className?: string
  showBenchmarks?: boolean
  interactive?: boolean
}

const COLORS = {
  excellent: '#10b981', // emerald
  good: '#22c55e', // green
  fair: '#eab308', // yellow
  poor: '#f97316', // orange
  critical: '#ef4444', // red
  benchmark: '#6b7280', // gray
  confidence: '#8b5cf6', // violet
}

function getScoreColor(score: number): string {
  if (score >= 90) return COLORS.excellent
  if (score >= 75) return COLORS.good
  if (score >= 60) return COLORS.fair
  if (score >= 40) return COLORS.poor
  return COLORS.critical
}

function getTrajectoryColor(trajectory?: string): string {
  switch (trajectory) {
    case 'IMPROVING':
      return COLORS.excellent
    case 'STABLE':
      return COLORS.good
    case 'DECLINING':
      return COLORS.poor
    case 'VOLATILE':
      return COLORS.fair
    default:
      return COLORS.benchmark
  }
}

export function HealthCharts({
  data,
  className,
  showBenchmarks = true,
  interactive = true,
}: HealthChartsProps) {
  // Prepare data for radar chart
  const radarData = [
    {
      dimension: 'Financial',
      score: data.financialScore,
      benchmark: data.benchmarks?.financial || 70,
      fullMark: 100,
    },
    {
      dimension: 'Growth',
      score: data.growthScore,
      benchmark: data.benchmarks?.growth || 65,
      fullMark: 100,
    },
    {
      dimension: 'Operational',
      score: data.operationalScore,
      benchmark: data.benchmarks?.operational || 75,
      fullMark: 100,
    },
    {
      dimension: 'Sale Ready',
      score: data.saleReadinessScore,
      benchmark: data.benchmarks?.saleReadiness || 60,
      fullMark: 100,
    },
  ]

  // Prepare data for bar chart
  const barData = radarData.map(item => ({
    ...item,
    color: getScoreColor(item.score),
  }))

  // Prepare data for pie chart (score distribution)
  const pieData = [
    {
      name: 'Achieved Score',
      value: data.overallScore,
      color: getScoreColor(data.overallScore),
    },
    {
      name: 'Remaining Potential',
      value: 100 - data.overallScore,
      color: '#f3f4f6',
    },
  ]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Health Score Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive visual breakdown of business health metrics
            </CardDescription>
          </div>

          {data.trajectory && (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
              style={{ borderColor: getTrajectoryColor(data.trajectory) }}
            >
              <Activity className="w-3 h-3" />
              {data.trajectory.toLowerCase()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="radar" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="radar" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Radar
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Bars
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieIcon className="w-3 h-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trend
            </TabsTrigger>
          </TabsList>

          {/* Radar Chart */}
          <TabsContent value="radar" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  />
                  <PolarRadiusAxis
                    angle={0}
                    domain={[0, 100]}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />

                  {showBenchmarks && (
                    <Radar
                      name="Industry Benchmark"
                      dataKey="benchmark"
                      stroke={COLORS.benchmark}
                      fill={COLORS.benchmark}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}

                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke={getScoreColor(data.overallScore)}
                    fill={getScoreColor(data.overallScore)}
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />

                  {interactive && <Tooltip content={<CustomTooltip />} />}

                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Radar view shows performance across all dimensions with industry
              benchmarks
            </div>
          </TabsContent>

          {/* Bar Chart */}
          <TabsContent value="bar" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="dimension"
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />

                  {showBenchmarks && (
                    <Bar
                      dataKey="benchmark"
                      name="Industry Avg"
                      fill={COLORS.benchmark}
                      opacity={0.5}
                      radius={[2, 2, 0, 0]}
                    />
                  )}

                  <Bar dataKey="score" name="Your Score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>

                  {interactive && <Tooltip content={<CustomTooltip />} />}

                  <Legend />

                  <ReferenceLine
                    y={75}
                    stroke={COLORS.good}
                    strokeDasharray="2 2"
                    label="Good"
                  />
                  <ReferenceLine
                    y={60}
                    stroke={COLORS.fair}
                    strokeDasharray="2 2"
                    label="Fair"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Bar chart comparison with reference lines for performance levels
            </div>
          </TabsContent>

          {/* Pie Chart */}
          <TabsContent value="pie" className="space-y-4">
            <div className="h-[400px] flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {interactive && <Tooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>

                {/* Center score display */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(data.overallScore)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Score
                  </div>
                  {data.confidenceLevel && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {Math.round(data.confidenceLevel)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Financial
                  </span>
                  <span className="font-medium">
                    {Math.round(data.financialScore)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Growth</span>
                  <span className="font-medium">
                    {Math.round(data.growthScore)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Operational
                  </span>
                  <span className="font-medium">
                    {Math.round(data.operationalScore)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sale Readiness
                  </span>
                  <span className="font-medium">
                    {Math.round(data.saleReadinessScore)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trend Analysis */}
          <TabsContent value="trend" className="space-y-4">
            <div className="h-[400px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{
                        backgroundColor: getTrajectoryColor(data.trajectory),
                      }}
                    >
                      <Zap className="w-8 h-8" />
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {data.trajectory || 'STABLE'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Business Trajectory
                    </div>
                  </div>

                  <div className="max-w-md text-center text-sm text-muted-foreground">
                    {data.trajectory === 'IMPROVING' &&
                      'Your business metrics show positive momentum with improving trends across multiple dimensions.'}
                    {data.trajectory === 'STABLE' &&
                      'Your business maintains consistent performance levels with minimal fluctuation in key metrics.'}
                    {data.trajectory === 'DECLINING' &&
                      'Some business metrics show concerning downward trends that may require attention.'}
                    {data.trajectory === 'VOLATILE' &&
                      'Your business metrics show significant fluctuation, indicating potential instability or rapid changes.'}
                    {!data.trajectory &&
                      'Trajectory analysis requires more historical data points for accurate assessment.'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default HealthCharts
