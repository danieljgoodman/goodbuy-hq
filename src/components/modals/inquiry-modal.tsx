'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, Send, AlertCircle } from 'lucide-react'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  business: {
    id: string
    title: string
    owner: {
      name: string
    }
  }
  onSuccess?: () => void
}

export default function InquiryModal({
  isOpen,
  onClose,
  business,
  onSuccess,
}: InquiryModalProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    subject: `Inquiry about ${business.title}`,
    message: '',
    contactName: session?.user?.name || '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/businesses/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send inquiry')
      }

      setSuccess(true)

      setTimeout(() => {
        onClose()
        onSuccess?.()
        // Reset form
        setFormData({
          subject: `Inquiry about ${business.title}`,
          message: '',
          contactName: session?.user?.name || '',
          contactEmail: session?.user?.email || '',
          contactPhone: '',
        })
        setSuccess(false)
      }, 2000)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to send inquiry'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Inquiry Sent Successfully!
          </h3>
          <p className="text-secondary-600 mb-4">
            Your inquiry has been sent to {business.owner.name}. They will
            receive an email notification and should respond soon.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">
              Contact Business Owner
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              Send an inquiry to {business.owner.name} about &ldquo;
              {business.title}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Your Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={e =>
                      updateFormData({ contactName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={e =>
                      updateFormData({ contactEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e =>
                    updateFormData({ contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Inquiry Details */}
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Your Inquiry
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => updateFormData({ subject: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What would you like to know?"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={e => updateFormData({ message: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Please provide details about your inquiry. Consider including:&#10;• Your budget range&#10;• Timeline for purchase&#10;• Specific questions about the business&#10;• Your background/experience&#10;• Preferred contact method"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-secondary-500 mt-2">
                  Minimum 10 characters. Be specific to get a better response.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                💡 Tips for a Great Inquiry:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about your interest and timeline</li>
                <li>• Mention your budget range to show you&apos;re serious</li>
                <li>• Share relevant experience in the industry</li>
                <li>• Ask thoughtful questions about the business</li>
                <li>• Be professional and courteous</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.contactName.trim() ||
                !formData.contactEmail.trim() ||
                !formData.message.trim() ||
                formData.message.length < 10
              }
              className="flex items-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
            <p className="text-xs text-secondary-600">
              By sending this inquiry, you agree to share your contact
              information with the business owner. They will be able to contact
              you directly via the information provided above.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
