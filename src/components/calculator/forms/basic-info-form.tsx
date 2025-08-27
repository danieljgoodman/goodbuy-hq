'use client'

import { BusinessInfo } from '@/types/valuation'
import { Input } from '@/components/ui/input'
import { INDUSTRY_OPTIONS } from '@/lib/industry-data'

interface BasicInfoFormProps {
  data?: Partial<BusinessInfo>
  onUpdate: (data: BusinessInfo) => void
  errors: Record<string, string>
}

export function BasicInfoForm({ data = {}, onUpdate, errors }: BasicInfoFormProps) {
  const updateField = (field: keyof BusinessInfo, value: any) => {
    onUpdate({
      companyName: '',
      industry: '',
      businessType: 'B2B',
      foundedYear: new Date().getFullYear(),
      employeeCount: 1,
      location: '',
      description: '',
      ...data,
      [field]: value
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
          Basic Company Information
        </h2>
        <p className="text-secondary-600">
          Tell us about your company to get started with the evaluation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-secondary-700 mb-2">
            Company Name *
          </label>
          <Input
            id="companyName"
            value={data.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="Enter your company name"
            className={errors.companyName ? 'border-error-500' : ''}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-error-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-secondary-700 mb-2">
            Industry *
          </label>
          <select
            id="industry"
            value={data.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              errors.industry ? 'border-error-500' : 'border-secondary-300'
            }`}
          >
            <option value="">Select an industry</option>
            {INDUSTRY_OPTIONS.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-error-600">{errors.industry}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-secondary-700 mb-2">
            Business Type *
          </label>
          <select
            id="businessType"
            value={data.businessType || 'B2B'}
            onChange={(e) => updateField('businessType', e.target.value as 'B2B' | 'B2C' | 'B2B2C')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <option value="B2B">B2B (Business to Business)</option>
            <option value="B2C">B2C (Business to Consumer)</option>
            <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
          </select>
        </div>

        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-secondary-700 mb-2">
            Founded Year *
          </label>
          <Input
            id="foundedYear"
            type="number"
            value={data.foundedYear || new Date().getFullYear()}
            onChange={(e) => updateField('foundedYear', parseInt(e.target.value))}
            min="1800"
            max={new Date().getFullYear()}
            className={errors.foundedYear ? 'border-error-500' : ''}
          />
          {errors.foundedYear && (
            <p className="mt-1 text-sm text-error-600">{errors.foundedYear}</p>
          )}
        </div>

        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-secondary-700 mb-2">
            Employee Count
          </label>
          <Input
            id="employeeCount"
            type="number"
            value={data.employeeCount || 1}
            onChange={(e) => updateField('employeeCount', parseInt(e.target.value))}
            min="1"
            placeholder="Number of employees"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-2">
            Primary Location
          </label>
          <Input
            id="location"
            value={data.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, State/Country"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
          Business Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Briefly describe what your company does, its main products/services, and key differentiators..."
          className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        />
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="font-medium text-primary-800 mb-2">Why we need this information</h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Industry determines appropriate valuation multiples</li>
          <li>• Business type affects customer acquisition and retention models</li>
          <li>• Company age influences risk assessment and growth expectations</li>
          <li>• Size and location impact market reach and operational complexity</li>
        </ul>
      </div>
    </div>
  )
}