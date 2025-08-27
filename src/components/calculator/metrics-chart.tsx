'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface MetricsChartProps {
  metrics: {
    revenueMultiple: number
    profitMargin: number
    returnOnAssets: number
    debtToEquity: number
    growthRate: number
  }
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  const chartRef = useRef<ChartJS<'radar'>>(null)

  // Normalize metrics for radar chart (0-100 scale)
  const normalizeMetrics = () => {
    return {
      'Revenue Multiple': Math.min(metrics.revenueMultiple * 10, 100), // Cap at 10x
      'Profit Margin': Math.min(Math.max(metrics.profitMargin, 0), 100),
      'Return on Assets': Math.min(Math.max(metrics.returnOnAssets + 50, 0), 100), // Shift to positive scale
      'Growth Rate': Math.min(Math.max(metrics.growthRate + 50, 0), 100), // Shift to positive scale
      'Financial Stability': Math.min(Math.max(100 - (metrics.debtToEquity * 20), 0), 100) // Invert debt ratio
    }
  }

  const normalizedData = normalizeMetrics()

  const data = {
    labels: Object.keys(normalizedData),
    datasets: [
      {
        label: 'Performance Metrics',
        data: Object.values(normalizedData),
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(14, 165, 233, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label
            let actualValue: string
            
            switch (label) {
              case 'Revenue Multiple':
                actualValue = `${metrics.revenueMultiple.toFixed(1)}x`
                break
              case 'Profit Margin':
                actualValue = `${metrics.profitMargin.toFixed(1)}%`
                break
              case 'Return on Assets':
                actualValue = `${metrics.returnOnAssets.toFixed(1)}%`
                break
              case 'Growth Rate':
                actualValue = `${metrics.growthRate.toFixed(1)}%`
                break
              case 'Financial Stability':
                actualValue = `D/E: ${metrics.debtToEquity.toFixed(2)}`
                break
              default:
                actualValue = context.raw.toFixed(1)
            }
            
            return `${label}: ${actualValue}`
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12
          },
          color: 'rgba(0, 0, 0, 0.7)'
        },
        ticks: {
          display: false,
          beginAtZero: true,
          max: 100
        }
      }
    }
  }

  return (
    <div className="h-64">
      <Radar ref={chartRef} data={data} options={options} />
    </div>
  )
}