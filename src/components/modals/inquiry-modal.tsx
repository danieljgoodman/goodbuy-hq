'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Send, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toastService } from '@/lib/toast'

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  open,
  onOpenChange,
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
        onOpenChange(false)
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-secondary-900 mb-2">
                Inquiry Sent Successfully!
              </DialogTitle>
              <DialogDescription className="text-secondary-600 mb-4">
                Your inquiry has been sent to {business.owner.name}. They will
                receive an email notification and should respond soon.
              </DialogDescription>
            </DialogHeader>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary-900">
            Contact Business Owner
          </DialogTitle>
          <DialogDescription className="text-sm text-secondary-600">
            Send an inquiry to {business.owner.name} about "{business.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
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
                <li>• Mention your budget range to show you're serious</li>
                <li>• Share relevant experience in the industry</li>
                <li>• Ask thoughtful questions about the business</li>
                <li>• Be professional and courteous</li>
              </ul>
            </div>
          </div>
        </form>

        <DialogFooter className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.contactName.trim() ||
              !formData.contactEmail.trim() ||
              !formData.message.trim() ||
              formData.message.length < 10
            }
            onClick={handleSubmit}
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
          </Button>
        </DialogFooter>

        <div className="p-3 bg-secondary-50 rounded-lg">
          <p className="text-xs text-secondary-600">
            By sending this inquiry, you agree to share your contact information
            with the business owner. They will be able to contact you directly
            via the information provided above.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
