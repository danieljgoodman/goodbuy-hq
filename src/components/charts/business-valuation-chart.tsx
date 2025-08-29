'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Brush,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Download,
  Maximize2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartConfig, ValuationData, BUSINESS_COLORS } from './chart-types'

interface BusinessValuationChartProps {
  data: ValuationData[]
  config?: Partial<ChartConfig>
  className?: string
  showControls?: boolean
  interactive?: boolean
  realTime?: boolean
}

// Mock valuation data generator
const generateValuationData = (businessName: string, industry: string) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const baseValue = Math.random() * 2000000 + 500000 // $500K - $2.5M base

  return months.map((month, index) => {
    const growth = (Math.random() - 0.5) * 0.1 // -5% to +5% monthly variance
    const seasonality = Math.sin((index / 12) * Math.PI * 2) * 0.05 // seasonal variation
    const trend = index * 0.02 // gradual growth trend

    const currentValue = baseValue * (1 + growth + seasonality + trend)
    const projectedValue = currentValue * (1.05 + Math.random() * 0.1) // 5-15% projection

    return {
      month,
      date: `2024-${(index + 1).toString().padStart(2, '0')}-01`,
      currentValue: Math.round(currentValue),
      projectedValue: Math.round(projectedValue),
      marketValue: Math.round(currentValue * (0.9 + Math.random() * 0.2)), // market range
      confidence: Math.round(80 + Math.random() * 15), // 80-95% confidence
      volume: Math.round(Math.random() * 50 + 10), // transaction volume
      industry: industry,
      businessName: businessName,
    }
  })
}

const sampleBusinesses = [
  { name: 'TechCorp Solutions', industry: 'Technology' },
  { name: 'Green Energy Co', industry: 'Energy' },
  { name: 'Health Plus Clinics', industry: 'Healthcare' },
  { name: 'Metro Restaurant Group', industry: 'Food & Beverage' },
  { name: 'Manufacturing Pro', industry: 'Manufacturing' },
]

export default function BusinessValuationChart({
  data = [],
  config = {},
  className = '',
  showControls = true,
  interactive = true,
  realTime = false,
}: BusinessValuationChartProps) {
  const [selectedBusiness, setSelectedBusiness] = useState('TechCorp Solutions')
  const [viewMode, setViewMode] = useState<'line' | 'area'>('area')
  const [timeRange, setTimeRange] = useState('12m')
  const [showProjection, setShowProjection] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const chartData = useMemo(() => {
    if (data.length > 0) return data
    const business =
      sampleBusinesses.find(b => b.name === selectedBusiness) ||
      sampleBusinesses[0]
    return generateValuationData(business.name, business.industry)
  }, [data, selectedBusiness])

  const stats = useMemo(() => {
    if (!chartData.length) return null

    const latest = chartData[chartData.length - 1]
    const previous = chartData[chartData.length - 2]
    const change = previous
      ? ((latest.currentValue - previous.currentValue) /
          previous.currentValue) *
        100
      : 0
    const avgConfidence =
      chartData.reduce((acc, item) => acc + item.confidence, 0) /
      chartData.length

    return {
      currentValue: latest.currentValue,
      projectedValue: latest.projectedValue,
      change: change,
      trend: change >= 0 ? 'up' : 'down',
      confidence: Math.round(avgConfidence),
      growth:
        ((latest.currentValue - chartData[0].currentValue) /
          chartData[0].currentValue) *
        100,
    }
  }, [chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-slate-600">{entry.name}:</span>
              <span className="font-medium">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2">
            <div className="text-sm text-slate-600">
              Confidence:{' '}
              <span className="font-medium">{data.confidence}%</span>
            </div>
            <div className="text-sm text-slate-600">
              Volume: <span className="font-medium">{data.volume}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const exportChart = (format: string) => {
    // Implementation for chart export
    console.log(`Exporting chart as ${format}`)
  }

  const ChartComponent = viewMode === 'area' ? AreaChart : LineChart

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-8' : ''} ${className}`}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Business Valuation Trends
              </CardTitle>
              {stats && (
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    variant={stats.trend === 'up' ? 'default' : 'destructive'}
                  >
                    {stats.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stats.change > 0 ? '+' : ''}
                    {stats.change.toFixed(1)}%
                  </Badge>
                  <span className="text-sm text-slate-600">
                    Current: ${stats.currentValue.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">
                    Confidence: {stats.confidence}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showControls && (
                <>
                  <Select
                    value={selectedBusiness}
                    onValueChange={setSelectedBusiness}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleBusinesses.map(business => (
                        <SelectItem key={business.name} value={business.name}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={viewMode}
                    onValueChange={(value: 'line' | 'area') =>
                      setViewMode(value)
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChart('png')}
                    className="px-3"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="px-3"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} w-full`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickFormatter={value => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />

                {viewMode === 'area' ? (
                  <>
                    <defs>
                      <linearGradient
                        id="currentValueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={BUSINESS_COLORS.primary}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={BUSINESS_COLORS.primary}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="projectedValueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={BUSINESS_COLORS.secondary}
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor={BUSINESS_COLORS.secondary}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="currentValue"
                      stroke={BUSINESS_COLORS.primary}
                      strokeWidth={2}
                      fill="url(#currentValueGradient)"
                      name="Current Value"
                    />
                    {showProjection && (
                      <Area
                        type="monotone"
                        dataKey="projectedValue"
                        stroke={BUSINESS_COLORS.secondary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#projectedValueGradient)"
                        name="Projected Value"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="currentValue"
                      stroke={BUSINESS_COLORS.primary}
                      strokeWidth={3}
                      dot={{
                        fill: BUSINESS_COLORS.primary,
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{ r: 6, fill: BUSINESS_COLORS.primary }}
                      name="Current Value"
                    />
                    {showProjection && (
                      <Line
                        type="monotone"
                        dataKey="projectedValue"
                        stroke={BUSINESS_COLORS.secondary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{
                          fill: BUSINESS_COLORS.secondary,
                          strokeWidth: 2,
                          r: 3,
                        }}
                        name="Projected Value"
                      />
                    )}
                  </>
                )}

                <Line
                  type="monotone"
                  dataKey="marketValue"
                  stroke={BUSINESS_COLORS.success}
                  strokeWidth={1}
                  dot={false}
                  name="Market Average"
                />

                {interactive && (
                  <Brush
                    dataKey="month"
                    height={30}
                    stroke={BUSINESS_COLORS.primary}
                  />
                )}
              </ChartComponent>
            </ResponsiveContainer>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  ${stats.currentValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Current Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${stats.projectedValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Projected Value</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stats.growth > 0 ? '+' : ''}
                  {stats.growth.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">YTD Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.confidence}%
                </div>
                <div className="text-sm text-slate-600">Confidence</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
