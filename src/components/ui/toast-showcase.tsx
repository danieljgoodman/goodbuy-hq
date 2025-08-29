'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToastDemo } from '@/components/ui/toast-demo'
import { ToastHistory } from '@/components/ui/toast-history'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { toastService } from '@/lib/toast'
import {
  Bell,
  Settings,
  Code2,
  Palette,
  Zap,
  Shield,
  Accessibility,
} from 'lucide-react'

export function ToastShowcase() {
  const handleClearHistory = () => {
    toastService.clearHistory()
  }

  const handleTestAccessibility = () => {
    toastService.info(
      'Accessibility Test',
      'This toast tests screen reader compatibility and keyboard navigation',
      {
        duration: 8000,
        action: {
          label: 'Learn More',
          onClick: () =>
            toastService.info(
              'ARIA Support',
              'All toasts include proper ARIA labels and roles'
            ),
        },
      }
    )
  }

  const handlePositionTest = () => {
    toastService.success(
      'Position Test',
      'Testing toast positioning and stacking'
    )
    setTimeout(() => {
      toastService.warning(
        'Stacking Test',
        'Multiple toasts should stack properly'
      )
    }, 500)
    setTimeout(() => {
      toastService.info('Auto-dismiss Test', 'This tests auto-dismiss timing')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Toast Notification System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A comprehensive toast notification system built with ShadCN UI and
          Sonner, featuring business-specific messages, progress tracking,
          accessibility support, and toast history management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feature Cards */}
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-medium mb-2">5 Toast Types</h3>
            <p className="text-sm text-gray-600">
              Success, Error, Warning, Info, and Progress notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Business Context</h3>
            <p className="text-sm text-gray-600">
              Pre-built messages for common business operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium mb-2">History & Undo</h3>
            <p className="text-sm text-gray-600">
              Track notifications and provide undo functionality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Accessibility className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Accessible</h3>
            <p className="text-sm text-gray-600">
              Full keyboard navigation and screen reader support
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="history">Toast History</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          <ToastDemo />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Notification History</h3>
            <Button onClick={handleClearHistory} variant="outline" size="sm">
              Clear All History
            </Button>
          </div>
          <ToastHistory />
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Usage Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Basic Success Toast</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {`toastService.success('Operation Complete', 'Your data has been saved')`}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Business-Specific Toast</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {`toastService.businessSaved('Sunny Cafe', () => undoSave())`}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Progress Toast</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {`const toastId = toastService.fileUploadProgress('document.pdf')
// Later...
toastService.completeProgress(toastId, 'Upload Complete')`}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Form Validation Error</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {`toastService.formValidationError('Email', 'Invalid format')`}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">With Action Button</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {`toastService.success('Changes Saved', 'Your settings have been updated', {
  action: {
    label: 'View Changes',
    onClick: () => router.push('/settings')
  }
})`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Toast Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Position</span>
                  <Badge variant="secondary">top-right</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Theme</span>
                  <Badge variant="secondary">system</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Visible</span>
                  <Badge variant="secondary">3</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Default Duration</span>
                  <Badge variant="secondary">4000ms</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Close Button</span>
                  <Badge variant="secondary">enabled</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Rich Colors</span>
                  <Badge variant="secondary">enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Visual Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Test Accessibility</h4>
                  <Button
                    onClick={handleTestAccessibility}
                    variant="outline"
                    size="sm"
                  >
                    Test Screen Reader Support
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Test Positioning</h4>
                  <Button
                    onClick={handlePositionTest}
                    variant="outline"
                    size="sm"
                  >
                    Test Stacking & Positioning
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Toast Types</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Success</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="secondary">Warning</Badge>
                    <Badge variant="outline">Info</Badge>
                    <Badge>Progress</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Special Features</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Undo functionality</li>
                    <li>• Progress tracking</li>
                    <li>• Auto-dismiss timing</li>
                    <li>• Action buttons</li>
                    <li>• History management</li>
                    <li>• Keyboard navigation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
