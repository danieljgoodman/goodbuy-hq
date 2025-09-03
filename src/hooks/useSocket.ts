'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface SocketEvents {
  new_message: (data: any) => void
  message_updated: (data: any) => void
  message_deleted: (data: any) => void
  thread_updated: (data: any) => void
  new_notification: (data: any) => void
  meeting_invitation: (data: any) => void
  document_shared: (data: any) => void
  user_typing: (data: any) => void
  user_stopped_typing: (data: any) => void
  presence_update: (data: any) => void
}

export function useSocket() {
  const { data: session, status } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const eventListenersRef = useRef<Map<keyof SocketEvents, Set<Function>>>(
    new Map()
  )

  // Initialize socket connection
  useEffect(() => {
    if (status === 'loading' || !session?.user?.id) return

    if (!socketRef.current) {
      // Create socket connection with authentication
      socketRef.current = io({
        transports: ['websocket', 'polling'],
        auth: {
          token: session.user.id, // In production, use proper JWT token
        },
        autoConnect: true,
      })

      socketRef.current.on('connect_error', error => {
        console.error('Socket connection error:', error)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      eventListenersRef.current.clear()
    }
  }, [session, status])

  // Generic event listener manager
  const addEventListener = useCallback(
    <K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]) => {
      if (!socketRef.current) return

      // Add to our tracking
      if (!eventListenersRef.current.has(event)) {
        eventListenersRef.current.set(event, new Set())
      }
      eventListenersRef.current.get(event)!.add(listener)

      // Add to socket
      socketRef.current.on(event, listener as any)

      // Return cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, listener as any)
        }
        eventListenersRef.current.get(event)?.delete(listener)
      }
    },
    []
  )

  const removeEventListener = useCallback(
    <K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]) => {
      if (!socketRef.current) return

      socketRef.current.off(event, listener as any)
      eventListenersRef.current.get(event)?.delete(listener)
    },
    []
  )

  // Specific socket methods
  const joinThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_thread', { threadId })
    }
  }, [])

  const leaveThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_thread', { threadId })
    }
  }, [])

  const startTyping = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { threadId })
    }
  }, [])

  const stopTyping = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { threadId })
    }
  }, [])

  const updatePresence = useCallback((status: 'online' | 'away' | 'busy') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_presence', { status })
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    addEventListener,
    removeEventListener,
    joinThread,
    leaveThread,
    startTyping,
    stopTyping,
    updatePresence,
  }
}

// Hook for message-specific socket events
export function useMessageSocket(threadId: string | null) {
  const {
    addEventListener,
    removeEventListener,
    joinThread,
    leaveThread,
    startTyping,
    stopTyping,
  } = useSocket()

  useEffect(() => {
    if (threadId) {
      joinThread(threadId)
      return () => {
        leaveThread(threadId)
      }
    }
  }, [threadId, joinThread, leaveThread])

  const onNewMessage = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('new_message', callback)
    },
    [addEventListener]
  )

  const onMessageUpdated = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('message_updated', callback)
    },
    [addEventListener]
  )

  const onMessageDeleted = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('message_deleted', callback)
    },
    [addEventListener]
  )

  const onUserTyping = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('user_typing', callback)
    },
    [addEventListener]
  )

  const onUserStoppedTyping = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('user_stopped_typing', callback)
    },
    [addEventListener]
  )

  return {
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onUserTyping,
    onUserStoppedTyping,
    startTyping: () => threadId && startTyping(threadId),
    stopTyping: () => threadId && stopTyping(threadId),
  }
}

// Hook for notification-specific socket events
export function useNotificationSocket() {
  const { addEventListener } = useSocket()

  const onNewNotification = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('new_notification', callback)
    },
    [addEventListener]
  )

  const onMeetingInvitation = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('meeting_invitation', callback)
    },
    [addEventListener]
  )

  const onDocumentShared = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('document_shared', callback)
    },
    [addEventListener]
  )

  return {
    onNewNotification,
    onMeetingInvitation,
    onDocumentShared,
  }
}

// Hook for presence/online status
export function usePresenceSocket() {
  const { addEventListener, updatePresence } = useSocket()

  const onPresenceUpdate = useCallback(
    (callback: (data: any) => void) => {
      return addEventListener('presence_update', callback)
    },
    [addEventListener]
  )

  return {
    onPresenceUpdate,
    updatePresence,
  }
}
