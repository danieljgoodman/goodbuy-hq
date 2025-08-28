'use client'

import { FinancialData } from '@/types/valuation'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface FinancialDataFormProps {
  data?: Partial<FinancialData>
  onUpdate: (data: FinancialData) => void
  errors: Record<string, string>
}

export function FinancialDataForm({
  data = {},
  onUpdate,
  errors,
}: FinancialDataFormProps) {
  const updateField = (field: keyof FinancialData, value: any) => {
    onUpdate({
      annualRevenue: 0,
      grossProfit: 0,
      netIncome: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      cashFlow: 0,
      previousYearRevenue: 0,
      debtToEquity: 0,
      currentRatio: 1,
      ...data,
      [field]: value,
    })
  }

  const formatNumber = (value: number) => {
    return value?.toLocaleString() || '0'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
          Financial Information
        </h2>
        <p className="text-secondary-600">
          Provide your company&apos;s financial data for accurate valuation
          calculations.
        </p>
      </div>

      {/* Revenue Section */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
          Revenue & Profitability
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="annualRevenue"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Annual Revenue (Current Year) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="annualRevenue"
                type="number"
                value={data.annualRevenue || ''}
                onChange={e =>
                  updateField('annualRevenue', parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={`pl-8 ${errors.annualRevenue ? 'border-error-500' : ''}`}
              />
            </div>
            {data.annualRevenue && data.annualRevenue > 0 && (
              <p className="mt-1 text-sm text-secondary-500">
                {formatCurrency(data.annualRevenue)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="previousYearRevenue"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Previous Year Revenue
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="previousYearRevenue"
                type="number"
                value={data.previousYearRevenue || ''}
                onChange={e =>
                  updateField(
                    'previousYearRevenue',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
                className="pl-8"
              />
            </div>
            {data.annualRevenue &&
              data.previousYearRevenue &&
              data.previousYearRevenue > 0 && (
                <p className="mt-1 text-sm text-secondary-500">
                  Growth:{' '}
                  {(
                    ((data.annualRevenue - data.previousYearRevenue) /
                      data.previousYearRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="grossProfit"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Gross Profit *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="grossProfit"
                type="number"
                value={data.grossProfit || ''}
                onChange={e =>
                  updateField('grossProfit', parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={`pl-8 ${errors.grossProfit ? 'border-error-500' : ''}`}
              />
            </div>
            {data.annualRevenue &&
              data.grossProfit &&
              data.annualRevenue > 0 && (
                <p className="mt-1 text-sm text-secondary-500">
                  Gross Margin:{' '}
                  {((data.grossProfit / data.annualRevenue) * 100).toFixed(1)}%
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="netIncome"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Net Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="netIncome"
                type="number"
                value={data.netIncome || ''}
                onChange={e =>
                  updateField('netIncome', parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={`pl-8 ${errors.netIncome ? 'border-error-500' : ''}`}
              />
            </div>
            {data.annualRevenue && data.netIncome && data.annualRevenue > 0 && (
              <p className="mt-1 text-sm text-secondary-500">
                Net Margin:{' '}
                {((data.netIncome / data.annualRevenue) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Balance Sheet Section */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
          Balance Sheet
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="totalAssets"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Total Assets *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="totalAssets"
                type="number"
                value={data.totalAssets || ''}
                onChange={e =>
                  updateField('totalAssets', parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={`pl-8 ${errors.totalAssets ? 'border-error-500' : ''}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="totalLiabilities"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Total Liabilities
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="totalLiabilities"
                type="number"
                value={data.totalLiabilities || ''}
                onChange={e =>
                  updateField(
                    'totalLiabilities',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
                className="pl-8"
              />
            </div>
            {data.totalAssets && data.totalLiabilities && (
              <p className="mt-1 text-sm text-secondary-500">
                Equity:{' '}
                {formatCurrency(data.totalAssets - data.totalLiabilities)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="cashFlow"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Operating Cash Flow
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="cashFlow"
                type="number"
                value={data.cashFlow || ''}
                onChange={e =>
                  updateField('cashFlow', parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="monthlyRecurringRevenue"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Monthly Recurring Revenue (if applicable)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                $
              </span>
              <Input
                id="monthlyRecurringRevenue"
                type="number"
                value={data.monthlyRecurringRevenue || ''}
                onChange={e =>
                  updateField(
                    'monthlyRecurringRevenue',
                    parseFloat(e.target.value) || undefined
                  )
                }
                placeholder="0"
                className="pl-8"
              />
            </div>
            <p className="mt-1 text-xs text-secondary-500">
              For subscription-based businesses
            </p>
          </div>
        </div>
      </div>

      {/* Financial Ratios Section */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
          Financial Ratios
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="debtToEquity"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Debt-to-Equity Ratio
            </label>
            <Input
              id="debtToEquity"
              type="number"
              step="0.1"
              value={data.debtToEquity || ''}
              onChange={e =>
                updateField('debtToEquity', parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Total Debt ÷ Total Equity
            </p>
          </div>

          <div>
            <label
              htmlFor="currentRatio"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Current Ratio
            </label>
            <Input
              id="currentRatio"
              type="number"
              step="0.1"
              value={data.currentRatio || ''}
              onChange={e =>
                updateField('currentRatio', parseFloat(e.target.value) || 1)
              }
              placeholder="1.0"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Current Assets ÷ Current Liabilities
            </p>
          </div>
        </div>
      </div>

      <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
        <h3 className="font-medium text-accent-800 mb-2">
          Financial Data Tips
        </h3>
        <ul className="text-sm text-accent-700 space-y-1">
          <li>• Use your most recent complete fiscal year data</li>
          <li>• All figures should be in the same currency</li>
          <li>• Include all revenue streams in annual revenue</li>
          <li>
            • Cash flow should reflect actual cash generated from operations
          </li>
          <li>
            • If you don&apos;t have exact figures, use your best estimates
          </li>
        </ul>
      </div>
    </div>
  )
}
