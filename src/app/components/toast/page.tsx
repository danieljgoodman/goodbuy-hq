import React from 'react'
import type { Metadata } from 'next'
import { ToastShowcase } from '@/components/ui/toast-showcase'

export const metadata: Metadata = {
  title: 'Toast Notifications - GoodBuy HQ',
  description:
    'Comprehensive toast notification system with business-specific messages, progress tracking, and accessibility support',
}

export default function ToastPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ToastShowcase />
    </div>
  )
}
