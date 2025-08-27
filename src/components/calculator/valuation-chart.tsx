'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ValuationMethod } from '@/types/valuation'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ValuationChartProps {
  methods: ValuationMethod[]
}

export function ValuationChart({ methods }: ValuationChartProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  const data = {
    labels: methods.map(method => method.name),
    datasets: [
      {
        label: 'Valuation ($)',
        data: methods.map(method => method.value),
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const method = methods[context.dataIndex]
            return [
              `Value: ${formatCurrency(context.raw)}`,
              `Confidence: ${method.confidence.toFixed(0)}%`,
            ]
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value)
          },
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  )
}
