import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest } from 'next'
import { prisma } from './prisma'

interface AuthenticatedSocket extends Socket {
  userId?: string
  userEmail?: string
}

export class SocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, Set<string>> = new Map() // userId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token

        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify the JWT token (simplified approach)
        // In production, you'd want to verify the token properly
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        
        if (!decoded.sub || !decoded.email) {
          return next(new Error('Invalid token'))
        }

        socket.userId = decoded.sub
        socket.userEmail = decoded.email
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userEmail} connected with socket ${socket.id}`)

      if (socket.userId) {
        // Track connected user
        if (!this.connectedUsers.has(socket.userId)) {
          this.connectedUsers.set(socket.userId, new Set())
        }
        this.connectedUsers.get(socket.userId)!.add(socket.id)

        // Join user to their personal room
        socket.join(`user:${socket.userId}`)

        // Join user to their thread rooms
        this.joinUserThreads(socket)
      }

      // Handle typing indicators
      socket.on('typing_start', (data: { threadId: string }) => {
        socket.to(`thread:${data.threadId}`).emit('user_typing', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          threadId: data.threadId,
        })
      })

      socket.on('typing_stop', (data: { threadId: string }) => {
        socket.to(`thread:${data.threadId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          threadId: data.threadId,
        })
      })

      // Handle joining specific threads
      socket.on('join_thread', (data: { threadId: string }) => {
        socket.join(`thread:${data.threadId}`)
      })

      socket.on('leave_thread', (data: { threadId: string }) => {
        socket.leave(`thread:${data.threadId}`)
      })

      // Handle presence updates
      socket.on('update_presence', (data: { status: 'online' | 'away' | 'busy' }) => {
        this.broadcastPresenceUpdate(socket.userId!, data.status)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userEmail} disconnected from socket ${socket.id}`)

        if (socket.userId) {
          const userSockets = this.connectedUsers.get(socket.userId)
          if (userSockets) {
            userSockets.delete(socket.id)
            
            // If user has no more connections, mark as offline
            if (userSockets.size === 0) {
              this.connectedUsers.delete(socket.userId)
              this.broadcastPresenceUpdate(socket.userId, 'offline')
            }
          }
        }
      })
    })
  }

  private async joinUserThreads(socket: AuthenticatedSocket) {
    if (!socket.userId) return

    try {
      // Get all threads the user participates in
      const userThreads = await prisma.threadParticipant.findMany({
        where: {
          userId: socket.userId,
          isActive: true,
        },
        select: {
          threadId: true,
        },
      })

      // Join each thread room
      userThreads.forEach(({ threadId }) => {
        socket.join(`thread:${threadId}`)
      })
    } catch (error) {
      console.error('Failed to join user threads:', error)
    }
  }

  private broadcastPresenceUpdate(userId: string, status: 'online' | 'away' | 'busy' | 'offline') {
    this.io.emit('presence_update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    })
  }

  // Public methods for broadcasting events
  public notifyNewMessage(threadId: string, message: any) {
    this.io.to(`thread:${threadId}`).emit('new_message', {
      threadId,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  public notifyMessageUpdated(threadId: string, messageId: string, updatedMessage: any) {
    this.io.to(`thread:${threadId}`).emit('message_updated', {
      threadId,
      messageId,
      message: updatedMessage,
      timestamp: new Date().toISOString(),
    })
  }

  public notifyMessageDeleted(threadId: string, messageId: string) {
    this.io.to(`thread:${threadId}`).emit('message_deleted', {
      threadId,
      messageId,
      timestamp: new Date().toISOString(),
    })
  }

  public notifyThreadUpdated(threadId: string, updatedThread: any) {
    this.io.to(`thread:${threadId}`).emit('thread_updated', {
      threadId,
      thread: updatedThread,
      timestamp: new Date().toISOString(),
    })
  }

  public notifyNewNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString(),
    })
  }

  public notifyMeetingInvitation(userIds: string[], meeting: any) {
    userIds.forEach(userId => {
      this.io.to(`user:${userId}`).emit('meeting_invitation', {
        meeting,
        timestamp: new Date().toISOString(),
      })
    })
  }

  public notifyDocumentShared(threadId: string, document: any) {
    this.io.to(`thread:${threadId}`).emit('document_shared', {
      threadId,
      document,
      timestamp: new Date().toISOString(),
    })
  }

  // Get online user count
  public getOnlineUserCount(): number {
    return this.connectedUsers.size
  }

  // Get if a user is online
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  // Get all connected users
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }

  // Get socket server instance
  public getIO(): SocketIOServer {
    return this.io
  }
}

// Global instance
let socketServer: SocketServer | null = null

export function initializeSocketServer(server: HTTPServer): SocketServer {
  if (!socketServer) {
    socketServer = new SocketServer(server)
  }
  return socketServer
}

export function getSocketServer(): SocketServer | null {
  return socketServer
}