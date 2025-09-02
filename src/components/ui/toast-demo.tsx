'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toastService } from '@/lib/toast'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Upload,
  Plus,
  Send,
  Calculator,
  FileText,
  Wifi,
  CreditCard,
  Bell,
} from 'lucide-react'

export function ToastDemo() {
  const handleBusinessSaved = () => {
    toastService.businessSaved("Sunny's Cafe", () => {
      // Handle undo business save
    })
  }

  const handleInquirySent = () => {
    toastService.inquirySent('Tech Solutions Inc.')
  }

  const handleEvaluationCompleted = () => {
    toastService.evaluationCompleted('Restaurant Chain', '$2.4M')
  }

  const handleFormError = () => {
    toastService.formValidationError('Email', 'Invalid email format')
  }

  const handleApiError = () => {
    toastService.apiError('save business listing')
  }

  const handleNetworkError = () => {
    toastService.networkError()
  }

  const handleAccountLimit = () => {
    toastService.accountLimitWarning('business listings', 8, 10)
  }

  const handleMissingInfo = () => {
    toastService.missingInfoWarning([
      'Business description',
      'Financial data',
      'Contact info',
    ])
  }

  const handleFeatureAnnouncement = () => {
    toastService.featureAnnouncement(
      'AI Business Analysis',
      'Get detailed insights with our new AI-powered analysis tool'
    )
  }

  const handleTip = () => {
    toastService.tipOfTheDay(
      'Add detailed financial information to get more accurate business valuations'
    )
  }

  const handleFileUpload = () => {
    const toastId = toastService.fileUploadProgress(
      'business-documents.pdf',
      () => {
        // Handle upload cancelled
      }
    )

    // Simulate upload progress
    setTimeout(() => {
      toastService.completeProgress(
        toastId,
        'Upload Complete',
        'business-documents.pdf has been uploaded successfully'
      )
    }, 3000)
  }

  const handleDataProcessing = () => {
    const toastId = toastService.dataProcessing(
      'Business valuation calculation',
      () => {
        // Handle processing cancelled
      }
    )

    // Simulate processing completion
    setTimeout(() => {
      toastService.completeProgress(
        toastId,
        'Analysis Complete',
        'Your business valuation is ready to view'
      )
    }, 4000)
  }

  const handleAiAnalysis = () => {
    const toastId = toastService.aiAnalysisProgress(
      'Retail Store Chain',
      () => {
        // Handle analysis cancelled
      }
    )

    // Simulate AI analysis completion
    setTimeout(() => {
      toastService.completeProgress(
        toastId,
        'AI Analysis Complete',
        'Comprehensive business insights are now available'
      )
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Toast Notification Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Toasts */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Success Notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button onClick={handleBusinessSaved} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Business Saved
              </Button>
              <Button onClick={handleInquirySent} variant="outline" size="sm">
                <Send className="h-4 w-4 mr-1" />
                Inquiry Sent
              </Button>
              <Button
                onClick={handleEvaluationCompleted}
                variant="outline"
                size="sm"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Evaluation Done
              </Button>
            </div>
          </div>

          {/* Error Toasts */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Error Notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button onClick={handleFormError} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Form Error
              </Button>
              <Button onClick={handleApiError} variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-1" />
                API Error
              </Button>
              <Button onClick={handleNetworkError} variant="outline" size="sm">
                <Wifi className="h-4 w-4 mr-1" />
                Network Error
              </Button>
            </div>
          </div>

          {/* Warning Toasts */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Warning Notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button onClick={handleAccountLimit} variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-1" />
                Account Limit
              </Button>
              <Button onClick={handleMissingInfo} variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Missing Info
              </Button>
            </div>
          </div>

          {/* Info Toasts */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Info Notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                onClick={handleFeatureAnnouncement}
                variant="outline"
                size="sm"
              >
                <Info className="h-4 w-4 mr-1" />
                New Feature
              </Button>
              <Button onClick={handleTip} variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Daily Tip
              </Button>
            </div>
          </div>

          {/* Progress Toasts */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              Progress Notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button onClick={handleFileUpload} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                File Upload
              </Button>
              <Button
                onClick={handleDataProcessing}
                variant="outline"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Data Processing
              </Button>
              <Button onClick={handleAiAnalysis} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                AI Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
