'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Plus, Settings, Search, Filter } from 'lucide-react'
import MessageThreadList from './message-thread-list'
import MessageList from './message-list'
import MessageInput from './message-input'

interface Thread {
  id: string
  subject?: string
  createdAt: string
  lastMessageAt: string
  participants: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
      image?: string
      userType: string
    }
  }>
  business?: {
    id: string
    title: string
    slug: string
  }
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      image?: string
    }
  }>
  unreadCount: number
  _count: {
    messages: number
  }
}

interface Message {
  id: string
  content: string
  messageType: string
  status: string
  isEdited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    name: string
    image?: string
    userType: string
  }
}

export default function MessagingInterface() {
  const { data: session } = useSession()
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [isMobileThreadListOpen, setIsMobileThreadListOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    id: string
    content: string
    senderName: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)

  // Close thread list on mobile when a thread is selected
  useEffect(() => {
    if (selectedThread && window.innerWidth < 768) {
      setIsMobileThreadListOpen(false)
    }
  }, [selectedThread])

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread)
    setReplyingTo(null)
  }

  const handleSendMessage = async (
    content: string,
    messageType = 'text',
    replyToId?: string
  ) => {
    if (!selectedThread) return

    try {
      const response = await fetch(
        `/api/communications/threads/${selectedThread.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            messageType,
            replyToId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Message will be automatically added to the list by the MessageList component
      // when it re-fetches messages
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo({
      id: message.id,
      content: message.content,
      senderName: message.sender.name,
    })
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const getThreadTitle = (thread: Thread) => {
    if (thread.subject) return thread.subject
    if (thread.business) return `Re: ${thread.business.title}`

    const otherParticipants = thread.participants.filter(
      p => p.user.id !== session?.user?.id
    )
    if (otherParticipants.length === 1) {
      return otherParticipants[0].user.name
    }
    return `Group chat (${thread.participants.length} members)`
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Mobile Thread List Overlay */}
      {isMobileThreadListOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="bg-white h-full w-80 max-w-[90vw] overflow-hidden">
            <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">
                Messages
              </h2>
              <button
                onClick={() => setIsMobileThreadListOpen(false)}
                className="p-2 hover:bg-secondary-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              <MessageThreadList
                onThreadSelect={handleThreadSelect}
                selectedThreadId={selectedThread?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Thread List Sidebar */}
      <div className="hidden md:flex w-80 border-r border-secondary-200 flex-col bg-secondary-50">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">
              Messages
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-full"
                title="New message"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-full"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          <MessageThreadList
            onThreadSelect={handleThreadSelect}
            selectedThreadId={selectedThread?.id}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-secondary-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileThreadListOpen(true)}
                    className="md:hidden p-2 hover:bg-secondary-100 rounded-full"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {getThreadTitle(selectedThread)}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <span>
                        {selectedThread.participants.length} participant
                        {selectedThread.participants.length !== 1 ? 's' : ''}
                      </span>
                      {selectedThread.business && (
                        <>
                          <span>•</span>
                          <span>Business inquiry</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-full"
                    title="Thread settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              threadId={selectedThread.id}
              onReplyToMessage={handleReplyToMessage}
            />

            {/* Message Input */}
            <MessageInput
              threadId={selectedThread.id}
              onSendMessage={handleSendMessage}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
          </>
        ) : (
          /* No Thread Selected */
          <div className="flex-1 flex items-center justify-center bg-secondary-50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-primary-600" />
              </div>

              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-secondary-600 mb-6">
                Select a conversation from the sidebar to start messaging, or
                create a new conversation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="btn-primary px-6 py-3 rounded-lg"
                >
                  Start New Conversation
                </button>
                <button
                  onClick={() => setIsMobileThreadListOpen(true)}
                  className="md:hidden btn-secondary px-6 py-3 rounded-lg"
                >
                  View All Conversations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal Placeholder */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Conversation</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-2 hover:bg-secondary-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary-600 mb-4">
              New conversation functionality will be implemented here.
            </p>
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
