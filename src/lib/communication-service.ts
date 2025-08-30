import { prisma } from './prisma'
import {
  sendNewMessageNotification,
  sendMeetingInvitation,
  sendMeetingReminder,
  sendDocumentSharedNotification,
  sendDailyDigest,
} from './email'
import { NotificationType, MessageStatus } from '@prisma/client'

export class CommunicationService {
  // Create in-app notification
  static async createNotification({
    userId,
    type,
    title,
    message,
    actionUrl,
    data,
    priority = 'normal',
    channel = ['in_app'],
    relatedId,
    relatedType,
    scheduledFor,
  }: {
    userId: string
    type: NotificationType
    title: string
    message: string
    actionUrl?: string
    data?: any
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    channel?: string[]
    relatedId?: string
    relatedType?: string
    scheduledFor?: Date
  }) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          actionUrl,
          data,
          priority,
          channel,
          relatedId,
          relatedType,
          scheduledFor,
        },
      })
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  // Send message notifications to thread participants
  static async notifyNewMessage(messageId: string) {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sender: {
            select: { name: true, email: true },
          },
          thread: {
            include: {
              participants: {
                where: {
                  isActive: true,
                  allowDirectMessages: true,
                },
                include: {
                  user: {
                    include: {
                      communicationPreferences: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!message) return

      // Notify all participants except the sender
      const recipients = message.thread.participants.filter(
        p => p.userId !== message.senderId
      )

      for (const participant of recipients) {
        const user = participant.user
        const preferences = user.communicationPreferences

        // Create in-app notification
        await this.createNotification({
          userId: user.id,
          type: 'MESSAGE',
          title: `New message from ${message.sender.name}`,
          message:
            message.content.substring(0, 100) +
            (message.content.length > 100 ? '...' : ''),
          actionUrl: `/messages/${message.threadId}`,
          relatedId: messageId,
          relatedType: 'message',
          data: {
            threadId: message.threadId,
            senderId: message.senderId,
            senderName: message.sender.name,
          },
        })

        // Send email notification if enabled
        if (preferences?.emailNewMessages && user.email) {
          await sendNewMessageNotification(
            user.email,
            user.name || user.email,
            message.sender.name || 'Someone',
            message.thread.subject,
            message.content.substring(0, 200),
            message.threadId
          )
        }
      }
    } catch (error) {
      console.error('Failed to notify new message:', error)
      throw error
    }
  }

  // Send meeting invitation notifications
  static async notifyMeetingInvitation(meetingId: string) {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          organizer: {
            select: { name: true, email: true },
          },
          attendees: {
            include: {
              user: {
                include: {
                  communicationPreferences: true,
                },
              },
            },
          },
        },
      })

      if (!meeting) return

      for (const attendee of meeting.attendees) {
        const user = attendee.user
        const preferences = user.communicationPreferences

        // Create in-app notification
        await this.createNotification({
          userId: user.id,
          type: 'MEETING_INVITE',
          title: `Meeting invitation: ${meeting.title}`,
          message: `${meeting.organizer.name} invited you to a meeting on ${meeting.scheduledStart.toDateString()}`,
          actionUrl: `/meetings/${meetingId}`,
          relatedId: meetingId,
          relatedType: 'meeting',
          data: {
            meetingId,
            organizerId: meeting.organizerId,
            organizerName: meeting.organizer.name,
            scheduledStart: meeting.scheduledStart,
          },
        })

        // Send email notification if enabled
        if (preferences?.emailMeetingInvites && user.email) {
          await sendMeetingInvitation(
            user.email,
            user.name || user.email,
            meeting.organizer.name || 'Someone',
            meeting.title,
            meeting.description,
            meeting.scheduledStart,
            meeting.scheduledEnd,
            meeting.location,
            meetingId
          )
        }
      }
    } catch (error) {
      console.error('Failed to notify meeting invitation:', error)
      throw error
    }
  }

  // Process meeting reminders
  static async processMeetingReminders() {
    try {
      const now = new Date()

      // Get reminders that are due to be sent
      const dueReminders = await prisma.meetingReminder.findMany({
        where: {
          reminderTime: { lte: now },
          isSent: false,
        },
        include: {
          meeting: true,
          user: {
            include: {
              communicationPreferences: true,
            },
          },
        },
      })

      for (const reminder of dueReminders) {
        const meeting = reminder.meeting
        const user = reminder.user
        const hoursUntilMeeting = Math.round(
          (meeting.scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60)
        )

        // Create in-app notification
        await this.createNotification({
          userId: user.id,
          type: 'MEETING_REMINDER',
          title: `Meeting reminder: ${meeting.title}`,
          message: `Your meeting starts in ${hoursUntilMeeting} hour${hoursUntilMeeting !== 1 ? 's' : ''}`,
          actionUrl: `/meetings/${meeting.id}`,
          relatedId: meeting.id,
          relatedType: 'meeting',
          priority: hoursUntilMeeting <= 1 ? 'high' : 'normal',
        })

        // Send email reminder if enabled
        if (user.communicationPreferences?.emailMeetingInvites && user.email) {
          await sendMeetingReminder(
            user.email,
            user.name || user.email,
            meeting.title,
            meeting.scheduledStart,
            meeting.location,
            meeting.id,
            Math.max(hoursUntilMeeting, 0)
          )
        }

        // Mark reminder as sent
        await prisma.meetingReminder.update({
          where: { id: reminder.id },
          data: {
            isSent: true,
            sentAt: now,
          },
        })
      }

    } catch (error) {
      console.error('Failed to process meeting reminders:', error)
      throw error
    }
  }

  // Send document sharing notifications
  static async notifyDocumentShared(documentId: string, threadId?: string) {
    try {
      const document = await prisma.sharedDocument.findUnique({
        where: { id: documentId },
        include: {
          uploader: {
            select: { name: true, email: true },
          },
          thread: {
            include: {
              participants: {
                where: { isActive: true },
                include: {
                  user: {
                    include: {
                      communicationPreferences: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!document) return

      // If document is shared in a thread, notify all participants
      if (document.thread) {
        const recipients = document.thread.participants.filter(
          p => p.userId !== document.uploaderId
        )

        for (const participant of recipients) {
          const user = participant.user
          const preferences = user.communicationPreferences

          // Create in-app notification
          await this.createNotification({
            userId: user.id,
            type: 'DOCUMENT_SHARED',
            title: `Document shared: ${document.originalName}`,
            message: `${document.uploader.name} shared a document with you`,
            actionUrl: `/documents/${documentId}`,
            relatedId: documentId,
            relatedType: 'document',
            data: {
              documentId,
              uploaderId: document.uploaderId,
              uploaderName: document.uploader.name,
              fileName: document.originalName,
            },
          })

          // Send email notification if enabled
          if (preferences?.emailDocumentShares && user.email) {
            await sendDocumentSharedNotification(
              user.email,
              user.name || user.email,
              document.uploader.name || 'Someone',
              document.originalName,
              document.description,
              document.thread.subject,
              documentId
            )
          }
        }
      }
    } catch (error) {
      console.error('Failed to notify document shared:', error)
      throw error
    }
  }

  // Send daily digest emails
  static async sendDailyDigests() {
    try {
      // Get users who have daily digest enabled
      const users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          communicationPreferences: {
            emailDigest: true,
            digestFrequency: 'daily',
          },
        },
        include: {
          communicationPreferences: true,
        },
      })

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      for (const user of users) {
        try {
          // Get user's stats from yesterday
          const [unreadMessages, upcomingMeetings, newDocuments] =
            await Promise.all([
              // Unread messages count
              prisma.message.count({
                where: {
                  thread: {
                    participants: {
                      some: {
                        userId: user.id,
                        isActive: true,
                      },
                    },
                  },
                  NOT: { senderId: user.id },
                  readReceipts: {
                    none: { userId: user.id },
                  },
                },
              }),

              // Upcoming meetings in next 7 days
              prisma.meeting.count({
                where: {
                  OR: [
                    { organizerId: user.id },
                    {
                      attendees: {
                        some: { userId: user.id },
                      },
                    },
                  ],
                  scheduledStart: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  },
                  status: { in: ['SCHEDULED', 'CONFIRMED'] },
                },
              }),

              // New documents shared yesterday
              prisma.sharedDocument.count({
                where: {
                  createdAt: { gte: yesterday },
                  thread: {
                    participants: {
                      some: {
                        userId: user.id,
                        isActive: true,
                      },
                    },
                  },
                  NOT: { uploaderId: user.id },
                },
              }),
            ])

          // Only send digest if there's something to report
          if (unreadMessages > 0 || upcomingMeetings > 0 || newDocuments > 0) {
            await sendDailyDigest(
              user.email,
              user.name || user.email,
              unreadMessages,
              upcomingMeetings,
              newDocuments
            )
          }
        } catch (error) {
          console.error(`Failed to send daily digest to ${user.email}:`, error)
        }
      }

    } catch (error) {
      console.error('Failed to send daily digests:', error)
      throw error
    }
  }

  // Cleanup old data
  static async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      // Delete old dismissed notifications
      const dismissedNotifications = await prisma.notification.deleteMany({
        where: {
          status: 'DISMISSED',
          dismissedAt: { lt: thirtyDaysAgo },
        },
      })

      // Delete old audit logs (keep for 6 months)
      const oldAuditLogs = await prisma.communicationAuditLog.deleteMany({
        where: {
          createdAt: { lt: sixMonthsAgo },
        },
      })

      // Delete old document access logs (keep for 90 days)
      const oldAccessLogs = await prisma.documentAccessLog.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      })

    } catch (error) {
      console.error('Failed to cleanup old data:', error)
      throw error
    }
  }
}
