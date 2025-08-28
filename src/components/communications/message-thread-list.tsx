'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Users, Calendar, File, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ThreadParticipant {
  id: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    userType: string
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface Thread {
  id: string
  subject?: string
  createdAt: string
  lastMessageAt: string
  participants: ThreadParticipant[]
  business?: {
    id: string
    title: string
    slug: string
  }
  messages: Message[]
  unreadCount: number
  _count: {
    messages: number
  }
}

interface MessageThreadListProps {
  onThreadSelect: (thread: Thread) => void
  selectedThreadId?: string
}

export default function MessageThreadList({ onThreadSelect, selectedThreadId }: MessageThreadListProps) {
  const { data: session } = useSession()
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/communications/threads')
      
      if (!response.ok) {
        throw new Error('Failed to fetch threads')
      }

      const data = await response.json()
      setThreads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threads')
    } finally {
      setIsLoading(false)
    }
  }

  const getThreadTitle = (thread: Thread) => {
    if (thread.subject) return thread.subject
    if (thread.business) return `Re: ${thread.business.title}`
    
    // Create title from participants
    const otherParticipants = thread.participants.filter(
      p => p.user.id !== session?.user?.id
    )
    if (otherParticipants.length === 1) {
      return `Chat with ${otherParticipants[0].user.name}`
    }
    return `Group chat (${thread.participants.length} members)`
  }

  const getLastMessagePreview = (thread: Thread) => {
    if (thread.messages.length === 0) return 'No messages yet'
    const lastMessage = thread.messages[0]
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content
  }

  const getLastSender = (thread: Thread) => {
    if (thread.messages.length === 0) return null
    return thread.messages[0].sender
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-4">
              <div className="w-12 h-12 bg-secondary-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-4">{error}</p>
        <button 
          onClick={fetchThreads}
          className="btn-primary px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {threads.length === 0 ? (
        <div className="text-center p-8">
          <MessageCircle className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No conversations yet
          </h3>
          <p className="text-secondary-600">
            Start a conversation with business owners or brokers
          </p>
        </div>
      ) : (
        threads.map((thread) => {
          const lastSender = getLastSender(thread)
          const isSelected = selectedThreadId === thread.id
          
          return (
            <div
              key={thread.id}
              onClick={() => onThreadSelect(thread)}
              className={`
                flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-colors
                ${isSelected 
                  ? 'bg-primary-50 border-l-4 border-primary-500' 
                  : 'hover:bg-secondary-50'
                }
              `}
            >
              {/* Avatar or Icon */}
              <div className="flex-shrink-0">
                {thread.participants.length === 2 ? (
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-secondary-600" />
                  </div>
                )}
              </div>

              {/* Thread Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`
                    text-sm font-medium truncate
                    ${thread.unreadCount > 0 ? 'text-secondary-900' : 'text-secondary-700'}
                  `}>
                    {getThreadTitle(thread)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {thread.unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {thread.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-secondary-500">
                      {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {lastSender && (
                    <span className="text-xs text-secondary-600 font-medium">
                      {lastSender.id === session?.user?.id ? 'You' : lastSender.name}:
                    </span>
                  )}
                  <p className={`
                    text-sm truncate
                    ${thread.unreadCount > 0 ? 'text-secondary-900 font-medium' : 'text-secondary-600'}
                  `}>
                    {getLastMessagePreview(thread)}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-3 text-xs text-secondary-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{thread.participants.length}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{thread._count.messages}</span>
                    </span>
                    {thread.business && (
                      <span className="flex items-center space-x-1">
                        <File className="w-3 h-3" />
                        <span>Business</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <button className="p-1 rounded-full hover:bg-secondary-200 transition-colors">
                  <MoreVertical className="w-4 h-4 text-secondary-400" />
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}