'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Camera,
  Save,
  Eye,
  Send,
} from 'lucide-react'
import ImageUpload from '../ui/image-upload'

interface BusinessFormData {
  // Basic Information
  title: string
  description: string
  category: string
  listingType: string

  // Location
  address: string
  city: string
  state: string
  zipCode: string

  // Contact
  website: string
  phone: string
  email: string

  // Financial Information
  askingPrice: string
  revenue: string
  profit: string
  cashFlow: string
  ebitda: string
  grossMargin: string
  netMargin: string

  // Business Details
  established: string
  employees: string
  monthlyRevenue: string
  yearlyGrowth: string
  customerBase: string

  // Assets
  inventory: string
  equipment: string
  realEstate: string
  totalAssets: string
  liabilities: string

  // Operations
  hoursOfOperation: string
  daysOpen: string[]
  seasonality: string
  competition: string

  // Sale Details
  reasonForSelling: string
  timeframe: string
  negotiations: string
  financing: string

  // Images and Documents
  images: any[]
  documents: any[]
}

const BUSINESS_CATEGORIES = [
  'RESTAURANT',
  'RETAIL',
  'ECOMMERCE',
  'TECHNOLOGY',
  'MANUFACTURING',
  'SERVICES',
  'HEALTHCARE',
  'REAL_ESTATE',
  'AUTOMOTIVE',
  'ENTERTAINMENT',
  'EDUCATION',
  'OTHER',
]

const LISTING_TYPES = [
  'BUSINESS_SALE',
  'ASSET_SALE',
  'FRANCHISE',
  'PARTNERSHIP',
  'INVESTMENT',
]

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function BusinessListingForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<BusinessFormData>({
    title: '',
    description: '',
    category: '',
    listingType: 'BUSINESS_SALE',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    phone: '',
    email: '',
    askingPrice: '',
    revenue: '',
    profit: '',
    cashFlow: '',
    ebitda: '',
    grossMargin: '',
    netMargin: '',
    established: '',
    employees: '',
    monthlyRevenue: '',
    yearlyGrowth: '',
    customerBase: '',
    inventory: '',
    equipment: '',
    realEstate: '',
    totalAssets: '',
    liabilities: '',
    hoursOfOperation: '',
    daysOpen: [],
    seasonality: '',
    competition: '',
    reasonForSelling: '',
    timeframe: '',
    negotiations: '',
    financing: '',
    images: [],
    documents: [],
  })

  const steps = [
    { id: 1, title: 'Basic Information', icon: Building2 },
    { id: 2, title: 'Location & Contact', icon: MapPin },
    { id: 3, title: 'Financial Details', icon: DollarSign },
    { id: 4, title: 'Business Operations', icon: Users },
    { id: 5, title: 'Sale Information', icon: FileText },
    { id: 6, title: 'Media & Documents', icon: Camera },
  ]

  const updateFormData = (updates: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleDayToggle = (day: string) => {
    const currentDays = formData.daysOpen
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    updateFormData({ daysOpen: updatedDays })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.category)
      case 2:
        return !!(formData.city && formData.state)
      case 3:
        return !!(formData.askingPrice || formData.revenue)
      case 4:
        return true // Optional fields
      case 5:
        return true // Optional fields
      case 6:
        return true // Optional fields
      default:
        return true
    }
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'DRAFT',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const result = await response.json()
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const submitForReview = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'UNDER_REVIEW',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit listing')
      }

      const result = await response.json()
      alert('Listing submitted for review!')
      router.push('/dashboard/listings')
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit listing')
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Business Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateFormData({ title: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter an attractive business title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.description}
                onChange={e => updateFormData({ description: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Provide a detailed description of your business, its operations, and what makes it unique..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => updateFormData({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) +
                        cat.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Listing Type
                </label>
                <select
                  value={formData.listingType}
                  onChange={e =>
                    updateFormData({ listingType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {LISTING_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0) +
                        type.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => updateFormData({ address: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => updateFormData({ city: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => updateFormData({ state: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={e => updateFormData({ zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => updateFormData({ website: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateFormData({ phone: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData({ email: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="contact@business.com"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Asking Price *
                </label>
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={e =>
                    updateFormData({ askingPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Annual Revenue
                </label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={e => updateFormData({ revenue: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Annual Profit
                </label>
                <input
                  type="number"
                  value={formData.profit}
                  onChange={e => updateFormData({ profit: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Cash Flow
                </label>
                <input
                  type="number"
                  value={formData.cashFlow}
                  onChange={e => updateFormData({ cashFlow: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  EBITDA
                </label>
                <input
                  type="number"
                  value={formData.ebitda}
                  onChange={e => updateFormData({ ebitda: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Monthly Revenue
                </label>
                <input
                  type="number"
                  value={formData.monthlyRevenue}
                  onChange={e =>
                    updateFormData({ monthlyRevenue: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Gross Margin (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  value={formData.grossMargin}
                  onChange={e =>
                    updateFormData({ grossMargin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Net Margin (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  value={formData.netMargin}
                  onChange={e => updateFormData({ netMargin: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Year Established
                </label>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.established}
                  onChange={e =>
                    updateFormData({ established: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Number of Employees
                </label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={e => updateFormData({ employees: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Customer Base Size
                </label>
                <input
                  type="number"
                  value={formData.customerBase}
                  onChange={e =>
                    updateFormData({ customerBase: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Days Open
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-medium transition-colors
                      ${
                        formData.daysOpen.includes(day)
                          ? 'bg-primary-500 text-white'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Hours of Operation
              </label>
              <input
                type="text"
                value={formData.hoursOfOperation}
                onChange={e =>
                  updateFormData({ hoursOfOperation: e.target.value })
                }
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Seasonality
              </label>
              <textarea
                value={formData.seasonality}
                onChange={e => updateFormData({ seasonality: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe any seasonal variations in business performance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Competition Analysis
              </label>
              <textarea
                value={formData.competition}
                onChange={e => updateFormData({ competition: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the competitive landscape and your advantages..."
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Reason for Selling
              </label>
              <textarea
                value={formData.reasonForSelling}
                onChange={e =>
                  updateFormData({ reasonForSelling: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Why are you selling this business?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sale Timeframe
                </label>
                <select
                  value={formData.timeframe}
                  onChange={e => updateFormData({ timeframe: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select timeframe</option>
                  <option value="immediate">Immediate (within 30 days)</option>
                  <option value="1-3_months">1-3 months</option>
                  <option value="3-6_months">3-6 months</option>
                  <option value="6-12_months">6-12 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Negotiations
                </label>
                <select
                  value={formData.negotiations}
                  onChange={e =>
                    updateFormData({ negotiations: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="firm_price">Price is firm</option>
                  <option value="negotiable">Price negotiable</option>
                  <option value="open_to_offers">Open to all offers</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Financing Options
              </label>
              <textarea
                value={formData.financing}
                onChange={e => updateFormData({ financing: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe available financing options (seller financing, SBA loans, etc.)"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Business Images
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Add high-quality photos of your business, storefront, interior,
                equipment, and products.
              </p>
              <ImageUpload
                onUpload={images => updateFormData({ images })}
                maxImages={15}
                folder="businesses"
                existingImages={formData.images}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Business Documents
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Upload financial statements, tax returns, and other relevant
                documents. These will be shared with qualified buyers.
              </p>
              {/* Document upload component would go here */}
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                <FileText className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-secondary-600">
                  Document upload coming soon
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-600">
          Please sign in to create a business listing.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${
                    step.id <= currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-200 text-secondary-600'
                  }
                `}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  ml-2 text-sm font-medium
                  ${step.id <= currentStep ? 'text-primary-600' : 'text-secondary-500'}
                `}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-px mx-4
                    ${step.id < currentStep ? 'bg-primary-500' : 'bg-secondary-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">
            {steps.find(s => s.id === currentStep)?.title}
          </h2>
          <p className="text-secondary-600 mt-1">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`
              px-4 py-2 rounded-lg font-medium
              ${
                currentStep === 1
                  ? 'text-secondary-400 cursor-not-allowed'
                  : 'text-secondary-600 hover:text-secondary-800'
              }
            `}
            disabled={currentStep === 1}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            {currentStep === steps.length ? (
              <button
                type="button"
                onClick={submitForReview}
                disabled={saving || !validateStep(currentStep)}
                className="flex items-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                Next
                <Eye className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
