import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-utils'
import MessagingInterface from '@/components/communications/messaging-interface'

export const metadata: Metadata = {
  title: 'Messages - GoodBuy HQ',
  description: 'Secure messaging platform for business communications',
}

export default async function MessagesPage() {
  // Require authentication
  const session = await requireAuth()

  return (
    <div className="h-screen">
      <MessagingInterface />
    </div>
  )
}
