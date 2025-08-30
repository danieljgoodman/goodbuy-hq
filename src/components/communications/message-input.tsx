'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile, AtSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (
    content: string,
    messageType?: string,
    replyToId?: string
  ) => Promise<void>
  isLoading?: boolean
  placeholder?: string
  threadId: string
  replyingTo?: {
    id: string
    content: string
    senderName: string
  } | null
  onCancelReply?: () => void
}

export default function MessageInput({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type a message...',
  threadId,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return

    try {
      await onSendMessage(message.trim(), 'text', replyingTo?.id)
      setMessage('')
      onCancelReply?.()

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Auto-resize textarea
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const insertAtMention = () => {
    // TODO: Implement @mention functionality
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage =
      message.substring(0, start) + emoji + message.substring(end)

    setMessage(newMessage)
    setShowEmojiPicker(false)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const commonEmojis = ['😊', '👍', '❤️', '😂', '🔥', '👏', '🎉', '💯']

  return (
    <div className="border-t border-secondary-200 bg-white">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-secondary-50 border-b border-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary-600 mb-1">
                Replying to{' '}
                <span className="font-medium">{replyingTo.senderName}</span>
              </p>
              <p className="text-sm text-secondary-700 truncate">
                {replyingTo.content}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              className="ml-2 text-secondary-400 hover:text-secondary-600 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onInput={handleInput}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="
                w-full resize-none rounded-lg border border-secondary-300 px-4 py-3 
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:bg-secondary-50 disabled:text-secondary-500
                min-h-[44px] max-h-[120px]
              "
              disabled={isLoading}
              rows={1}
            />

            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {/* Attachment Button */}
              <button
                type="button"
                className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* At Mention Button */}
              <button
                type="button"
                onClick={insertAtMention}
                className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100"
                title="Mention someone"
              >
                <AtSign className="w-4 h-4" />
              </button>

              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Simple Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-secondary-200 rounded-lg shadow-lg p-2 z-10">
                    <div className="grid grid-cols-4 gap-1">
                      {commonEmojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-2 text-lg hover:bg-secondary-100 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn(
              'p-3',
              message.trim() && !isLoading
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
            )}
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-secondary-600 hover:text-primary-600 h-auto p-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule meeting
          </Button>
        </div>

        {/* Character Count */}
        {message.length > 9000 && (
          <div className="text-right mt-2">
            <span
              className={`text-xs ${message.length > 10000 ? 'text-error-600' : 'text-secondary-500'}`}
            >
              {message.length}/10000
            </span>
          </div>
        )}
      </div>

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  )
}
