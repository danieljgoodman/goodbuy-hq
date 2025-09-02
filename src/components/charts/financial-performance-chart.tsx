'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Percent,
  PieChart,
  BarChart3,
  Download,
  Maximize2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FinancialPerformanceData, BUSINESS_COLORS } from './chart-types'

interface FinancialPerformanceChartProps {
  data?: FinancialPerformanceData[]
  className?: string
  showControls?: boolean
  interactive?: boolean
}

// Mock financial performance data
const generateFinancialData = () => {
  const quarters = [
    'Q1 2023',
    'Q2 2023',
    'Q3 2023',
    'Q4 2023',
    'Q1 2024',
    'Q2 2024',
    'Q3 2024',
    'Q4 2024',
  ]
  const baseRevenue = 500000

  return quarters.map((quarter, index) => {
    const growth = 0.08 + (Math.random() - 0.5) * 0.1 // 3-13% quarterly growth
    const revenue = baseRevenue * Math.pow(1 + growth, index)
    const expenses = revenue * (0.7 + Math.random() * 0.1) // 70-80% of revenue
    const profit = revenue - expenses
    const margin = (profit / revenue) * 100
    const quarterlyGrowth =
      index > 0
        ? ((revenue - baseRevenue * Math.pow(1.08, index - 1)) /
            (baseRevenue * Math.pow(1.08, index - 1))) *
          100
        : 8

    return {
      period: quarter,
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      profit: Math.round(profit),
      margin: Math.round(margin * 100) / 100,
      growth: Math.round(quarterlyGrowth * 100) / 100,
      ebitda: Math.round(profit * 1.15), // Approximate EBITDA
      cashFlow: Math.round(profit * 0.85), // Approximate cash flow
      customers: Math.round(1000 + index * 150 + Math.random() * 100),
      avgOrderValue: Math.round(250 + index * 15 + Math.random() * 30),
    }
  })
}

const CHART_COLORS = {
  revenue: BUSINESS_COLORS.primary,
  profit: BUSINESS_COLORS.success,
  expenses: BUSINESS_COLORS.danger,
  margin: BUSINESS_COLORS.warning,
  growth: BUSINESS_COLORS.secondary,
  ebitda: '#8B5CF6',
  cashFlow: '#06B6D4',
}

export default function FinancialPerformanceChart({
  data,
  className = '',
  showControls = true,
  interactive = true,
}: FinancialPerformanceChartProps) {
  const [selectedView, setSelectedView] = useState('overview')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const chartData = useMemo(() => {
    return data || generateFinancialData()
  }, [data])

  const stats = useMemo(() => {
    if (!chartData.length) return null

    const latest = chartData[chartData.length - 1]
    const previous = chartData[chartData.length - 2]

    return {
      revenue: {
        current: latest.revenue,
        change: previous
          ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
          : 0,
        total: chartData.reduce((sum, item) => sum + item.revenue, 0),
      },
      profit: {
        current: latest.profit,
        change: previous
          ? ((latest.profit - previous.profit) / previous.profit) * 100
          : 0,
        margin: latest.margin,
      },
      growth: {
        current: latest.growth,
        avg:
          chartData.reduce((sum, item) => sum + item.growth, 0) /
          chartData.length,
      },
      efficiency: {
        margin: latest.margin,
        cashFlow: latest.revenue * (latest.margin / 100),
        customerGrowth: 0, // Placeholder - customers field not available
      },
    }
  }, [chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 mb-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-600 capitalize">
                  {entry.dataKey}:
                </span>
              </div>
              <span className="font-medium">
                {entry.dataKey === 'margin' || entry.dataKey === 'growth'
                  ? `${entry.value}%`
                  : `$${entry.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const exportChart = () => {
    // Implementation for chart export
  }

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
                <BarChart3 className="w-5 h-5 text-green-600" />
                Financial Performance
              </CardTitle>
              {stats && (
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-green-600" />
                    Revenue: {stats.revenue.change > 0 ? '+' : ''}
                    {stats.revenue.change.toFixed(1)}%
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-blue-600" />
                    Margin: {stats.profit.margin}%
                  </Badge>
                </div>
              )}
            </div>

            {showControls && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportChart}
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
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={selectedView}
            onValueChange={setSelectedView}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="profitability">Profit</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div
                className={`${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-80'} w-full`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <YAxis
                      yAxisId="money"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      tickFormatter={value => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      yAxisId="percent"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      tickFormatter={value => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Bar
                      yAxisId="money"
                      dataKey="revenue"
                      fill={CHART_COLORS.revenue}
                      name="Revenue"
                    />
                    <Bar
                      yAxisId="money"
                      dataKey="profit"
                      fill={CHART_COLORS.profit}
                      name="Profit"
                    />
                    <Line
                      yAxisId="percent"
                      type="monotone"
                      dataKey="margin"
                      stroke={CHART_COLORS.margin}
                      strokeWidth={3}
                      name="Profit Margin %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${stats.revenue.current.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Current Revenue</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {stats.revenue.change > 0 ? '+' : ''}
                      {stats.revenue.change.toFixed(1)}% QoQ
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${stats.profit.current.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Current Profit</div>
                    <div className="text-xs text-green-600 mt-1">
                      {stats.profit.margin}% margin
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.growth.current.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-700">
                      Current Growth
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {stats.growth.avg.toFixed(1)}% avg
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ${stats.efficiency.cashFlow.toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-700">Cash Flow</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {stats.efficiency.customerGrowth.toFixed(0)}% customer
                      growth
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="revenue">
              <div
                className={`${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-80'} w-full`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={CHART_COLORS.revenue}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={CHART_COLORS.revenue}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="period"
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
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.revenue}
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="profitability">
              <div
                className={`${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-80'} w-full`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="period"
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
                    <Legend />
                    <Bar
                      dataKey="profit"
                      fill={CHART_COLORS.profit}
                      name="Net Profit"
                    />
                    <Bar
                      dataKey="ebitda"
                      fill={CHART_COLORS.ebitda}
                      name="EBITDA"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div
                className={`${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-80'} w-full`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      tickFormatter={value => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="growth"
                      stroke={CHART_COLORS.growth}
                      strokeWidth={3}
                      dot={{ fill: CHART_COLORS.growth, strokeWidth: 2, r: 4 }}
                      name="Growth Rate %"
                    />
                    <Line
                      type="monotone"
                      dataKey="margin"
                      stroke={CHART_COLORS.margin}
                      strokeWidth={3}
                      dot={{ fill: CHART_COLORS.margin, strokeWidth: 2, r: 4 }}
                      name="Profit Margin %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
