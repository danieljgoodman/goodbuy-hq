'use client'

import { BusinessDetails } from '@/types/valuation'
import { COMPETITIVE_ADVANTAGES, RISK_FACTORS } from '@/lib/industry-data'

interface BusinessDetailsFormProps {
  data?: Partial<BusinessDetails>
  onUpdate: (data: BusinessDetails) => void
  errors: Record<string, string>
}

export function BusinessDetailsForm({
  data = {},
  onUpdate,
  errors,
}: BusinessDetailsFormProps) {
  const updateField = (field: keyof BusinessDetails, value: any) => {
    onUpdate({
      marketPosition: 'follower',
      growthStage: 'mature',
      competitiveAdvantage: [],
      riskFactors: [],
      customerConcentration: 'medium',
      technologyDependence: 'medium',
      regulatoryRisk: 'low',
      marketSize: 'medium',
      geographicDiversification: 'local',
      ...data,
      [field]: value,
    })
  }

  const toggleArrayItem = (
    field: 'competitiveAdvantage' | 'riskFactors',
    item: string
  ) => {
    const currentArray = data[field] || []
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]

    updateField(field, newArray)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
          Business Details & Market Position
        </h2>
        <p className="text-secondary-600">
          Help us understand your market position and competitive landscape.
        </p>
      </div>

      {/* Market Position Section */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
          Market Position & Stage
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Market Position *
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'leader',
                  label: 'Market Leader',
                  description: 'Top 1-2 players in your market',
                },
                {
                  value: 'challenger',
                  label: 'Challenger',
                  description: 'Strong player competing with leaders',
                },
                {
                  value: 'follower',
                  label: 'Follower',
                  description: 'Established but not market leading',
                },
                {
                  value: 'niche',
                  label: 'Niche Player',
                  description: 'Specialized in specific segment',
                },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="marketPosition"
                    value={option.value}
                    checked={data.marketPosition === option.value}
                    onChange={e =>
                      updateField('marketPosition', e.target.value)
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-secondary-800">
                      {option.label}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Growth Stage *
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'startup',
                  label: 'Startup',
                  description: 'Early stage, proving concept',
                },
                {
                  value: 'growth',
                  label: 'Growth',
                  description: 'Scaling rapidly, gaining market share',
                },
                {
                  value: 'mature',
                  label: 'Mature',
                  description: 'Established with stable operations',
                },
                {
                  value: 'decline',
                  label: 'Decline',
                  description: 'Facing market or competitive challenges',
                },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="growthStage"
                    value={option.value}
                    checked={data.growthStage === option.value}
                    onChange={e => updateField('growthStage', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-secondary-800">
                      {option.label}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Characteristics */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
          Market Characteristics
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Market Size
            </label>
            <select
              value={data.marketSize || 'medium'}
              onChange={e => updateField('marketSize', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
            >
              <option value="small">Small (&lt;$1B)</option>
              <option value="medium">Medium ($1B-$10B)</option>
              <option value="large">Large ($10B-$100B)</option>
              <option value="massive">Massive (&gt;$100B)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Geographic Reach
            </label>
            <select
              value={data.geographicDiversification || 'local'}
              onChange={e =>
                updateField('geographicDiversification', e.target.value)
              }
              className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
            >
              <option value="local">Local/Regional</option>
              <option value="national">National</option>
              <option value="international">International</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Customer Concentration Risk
            </label>
            <select
              value={data.customerConcentration || 'medium'}
              onChange={e =>
                updateField('customerConcentration', e.target.value)
              }
              className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
            >
              <option value="low">Low (No customer &gt;5% of revenue)</option>
              <option value="medium">
                Medium (Top customer 5-20% of revenue)
              </option>
              <option value="high">
                High (Top customer &gt;20% of revenue)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Technology Dependence
            </label>
            <select
              value={data.technologyDependence || 'medium'}
              onChange={e =>
                updateField('technologyDependence', e.target.value)
              }
              className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
            >
              <option value="low">Low (Traditional business model)</option>
              <option value="medium">
                Medium (Some technology integration)
              </option>
              <option value="high">High (Tech-enabled or tech-native)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
          Competitive Advantages
        </h3>
        <p className="text-sm text-secondary-600 mb-4">
          Select all competitive advantages that apply to your business:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPETITIVE_ADVANTAGES.map(advantage => (
            <label
              key={advantage}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  data.competitiveAdvantage?.includes(advantage) || false
                }
                onChange={() =>
                  toggleArrayItem('competitiveAdvantage', advantage)
                }
                className="rounded border-secondary-300"
              />
              <span className="text-sm text-secondary-700">{advantage}</span>
            </label>
          ))}
        </div>

        {data.competitiveAdvantage && data.competitiveAdvantage.length > 0 && (
          <div className="mt-4 p-3 bg-success-50 rounded-lg">
            <p className="text-sm text-success-700">
              Selected {data.competitiveAdvantage.length} competitive
              advantage(s)
            </p>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-error-500 rounded-full mr-3"></div>
          Risk Factors
        </h3>
        <p className="text-sm text-secondary-600 mb-4">
          Select all significant risk factors affecting your business:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RISK_FACTORS.map(risk => (
            <label
              key={risk}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data.riskFactors?.includes(risk) || false}
                onChange={() => toggleArrayItem('riskFactors', risk)}
                className="rounded border-secondary-300"
              />
              <span className="text-sm text-secondary-700">{risk}</span>
            </label>
          ))}
        </div>

        {data.riskFactors && data.riskFactors.length > 0 && (
          <div className="mt-4 p-3 bg-warning-50 rounded-lg">
            <p className="text-sm text-warning-700">
              Selected {data.riskFactors.length} risk factor(s)
            </p>
          </div>
        )}
      </div>

      {/* Regulatory Risk */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-secondary-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
          Regulatory Environment
        </h3>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-3">
            Regulatory Risk Level
          </label>
          <div className="space-y-2">
            {[
              {
                value: 'low',
                label: 'Low Risk',
                description:
                  'Minimal regulatory oversight or stable regulations',
              },
              {
                value: 'medium',
                label: 'Medium Risk',
                description: 'Some regulatory requirements, occasional changes',
              },
              {
                value: 'high',
                label: 'High Risk',
                description:
                  'Heavy regulation, frequent changes, compliance costs',
              },
            ].map(option => (
              <label
                key={option.value}
                className="flex items-start space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="regulatoryRisk"
                  value={option.value}
                  checked={data.regulatoryRisk === option.value}
                  onChange={e => updateField('regulatoryRisk', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-secondary-800">
                    {option.label}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="font-medium text-primary-800 mb-2">
          How this affects your valuation
        </h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>
            • Market leaders and growth-stage companies typically receive higher
            multiples
          </li>
          <li>
            • Strong competitive advantages can increase valuation by 10-30%
          </li>
          <li>
            • Risk factors may reduce valuation through higher discount rates
          </li>
          <li>
            • Geographic diversification and larger markets generally increase
            value
          </li>
          <li>
            • High regulatory risk can significantly impact certain industries
          </li>
        </ul>
      </div>
    </div>
  )
}
