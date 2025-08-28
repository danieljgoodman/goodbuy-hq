'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow, format } from 'date-fns'
import { MoreVertical, Reply, Edit, Trash2, Check, CheckCheck } from 'lucide-react'

interface MessageAttachment {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
}

interface MessageReadReceipt {
  id: string
  userId: string
  readAt: string
  user: {
    id: string
    name: string
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
  attachments?: MessageAttachment[]
  readReceipts?: MessageReadReceipt[]
  replyTo?: {
    id: string
    content: string
    sender: {
      id: string
      name: string
    }
  }
  replies?: Message[]
  _count?: {
    replies: number
  }
}

interface MessageListProps {
  threadId: string
  onReplyToMessage?: (message: Message) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
}

export default function MessageList({ 
  threadId, 
  onReplyToMessage, 
  onEditMessage, 
  onDeleteMessage 
}: MessageListProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadId) {
      fetchMessages()
    }
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/communications/threads/${threadId}/messages`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (messageId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`/api/communications/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to edit message')
      }

      const updatedMessage = await response.json()
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      )
      
      setEditingMessageId(null)
      setEditContent('')
      
      onEditMessage?.(messageId, editContent.trim())
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/communications/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      onDeleteMessage?.(messageId)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const getReadReceiptStatus = (message: Message) => {
    if (!message.readReceipts || message.sender.id === session?.user?.id) {
      return null
    }

    const currentUserReceipt = message.readReceipts.find(
      receipt => receipt.userId === session?.user?.id
    )

    return currentUserReceipt ? 'read' : 'unread'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600 mb-4">{error}</p>
          <button 
            onClick={fetchMessages}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No messages yet
            </h3>
            <p className="text-secondary-600">
              Start the conversation by sending a message
            </p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.sender.id === session?.user?.id
          const showDate = index === 0 || 
            new Date(message.createdAt).toDateString() !== 
            new Date(messages[index - 1].createdAt).toDateString()
          
          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-secondary-100 text-secondary-600 text-sm px-3 py-1 rounded-full">
                    {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-xs lg:max-w-md xl:max-w-lg
                  ${isCurrentUser ? 'order-2' : 'order-1'}
                `}>
                  {/* Reply Context */}
                  {message.replyTo && (
                    <div className="mb-2 px-3 py-2 bg-secondary-100 rounded-lg border-l-4 border-secondary-300">
                      <p className="text-xs text-secondary-600 mb-1">
                        Replying to {message.replyTo.sender.name}
                      </p>
                      <p className="text-sm text-secondary-700 truncate">
                        {message.replyTo.content}
                      </p>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`
                    px-4 py-2 rounded-lg
                    ${isCurrentUser 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white border border-secondary-200'
                    }
                  `}>
                    {/* Sender Name (for group chats) */}
                    {!isCurrentUser && (
                      <p className="text-xs font-medium text-secondary-600 mb-1">
                        {message.sender.name}
                      </p>
                    )}

                    {/* Message Content */}
                    {editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border border-secondary-300 rounded text-secondary-900 resize-none"
                          rows={2}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(message.id)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-xs bg-secondary-400 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-secondary-900'}`}>
                          {message.content}
                        </p>

                        {/* Message Status */}
                        {message.status === 'DELETED' && (
                          <p className="text-xs italic opacity-75 mt-1">
                            This message was deleted
                          </p>
                        )}

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className={`
                                  p-2 rounded border text-xs
                                  ${isCurrentUser 
                                    ? 'bg-primary-400 border-primary-300' 
                                    : 'bg-secondary-50 border-secondary-200'
                                  }
                                `}
                              >
                                <p className="font-medium">{attachment.originalName}</p>
                                <p className="opacity-75">{formatFileSize(attachment.size)}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Edited Indicator */}
                        {message.isEdited && (
                          <p className="text-xs opacity-75 mt-1">
                            edited {formatDistanceToNow(new Date(message.editedAt!))} ago
                          </p>
                        )}
                      </>
                    )}

                    {/* Message Actions */}
                    {!editingMessageId && message.status !== 'DELETED' && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onReplyToMessage?.(message)}
                            className={`
                              text-xs p-1 rounded-full transition-colors
                              ${isCurrentUser 
                                ? 'text-primary-100 hover:bg-primary-400' 
                                : 'text-secondary-500 hover:bg-secondary-100'
                              }
                            `}
                            title="Reply"
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          
                          {isCurrentUser && (
                            <>
                              <button
                                onClick={() => startEditing(message)}
                                className="text-xs p-1 rounded-full text-primary-100 hover:bg-primary-400 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(message.id)}
                                className="text-xs p-1 rounded-full text-primary-100 hover:bg-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Read Status */}
                        {isCurrentUser && message.readReceipts && (
                          <div className="text-xs opacity-75">
                            {message.readReceipts.length > 0 ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className={`
                    text-xs text-secondary-500 mt-1
                    ${isCurrentUser ? 'text-right' : 'text-left'}
                  `}>
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </p>
                </div>

                {/* Avatar */}
                {!isCurrentUser && (
                  <div className="order-0 mr-3 flex-shrink-0">
                    <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary-600">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}