# GoodBuy HQ Communication System

## Overview

The GoodBuy HQ Communication System is a comprehensive, secure messaging platform designed for business transactions. It includes in-app messaging, email notifications, document sharing, meeting scheduling, and real-time notifications.

## Architecture

### Database Models

The system uses the following Prisma models:

- **CommunicationThread**: Main conversation containers
- **ThreadParticipant**: User participation in threads with permissions
- **Message**: Individual messages with replies, attachments, and read receipts
- **MessageAttachment**: File attachments with security scanning
- **MessageReadReceipt**: Message read status tracking
- **Meeting**: Calendar integration for scheduled meetings
- **MeetingAttendee**: Meeting participation and responses
- **MeetingReminder**: Automated reminder system
- **SharedDocument**: Secure document sharing with access controls
- **DocumentAccessLog**: Audit trail for document access
- **Notification**: In-app notification system
- **CommunicationPreferences**: User privacy and notification preferences
- **CommunicationAuditLog**: Complete audit trail for compliance

### API Endpoints

#### Messaging

- `GET /api/communications/threads` - List user's conversations
- `POST /api/communications/threads` - Create new conversation
- `GET /api/communications/threads/[threadId]` - Get thread details
- `PATCH /api/communications/threads/[threadId]` - Update thread
- `DELETE /api/communications/threads/[threadId]` - Leave/archive thread
- `GET /api/communications/threads/[threadId]/messages` - Get messages
- `POST /api/communications/threads/[threadId]/messages` - Send message
- `PATCH /api/communications/messages/[messageId]` - Edit message
- `DELETE /api/communications/messages/[messageId]` - Delete message

#### Document Sharing

- `GET /api/communications/documents` - List accessible documents
- `POST /api/communications/documents` - Upload document
- `GET /api/communications/documents/[documentId]` - Download document
- `DELETE /api/communications/documents/[documentId]` - Delete document

#### Meeting Scheduling

- `GET /api/communications/meetings` - List user's meetings
- `POST /api/communications/meetings` - Schedule meeting
- `PATCH /api/communications/meetings/[meetingId]` - Update meeting
- `DELETE /api/communications/meetings/[meetingId]` - Cancel meeting

#### Notifications

- `GET /api/communications/notifications` - Get notifications
- `PATCH /api/communications/notifications` - Mark as read/dismissed
- `DELETE /api/communications/notifications` - Cleanup old notifications

#### Preferences

- `GET /api/communications/preferences` - Get user preferences
- `PUT /api/communications/preferences` - Update preferences

### Security Features

#### Data Protection

- All sensitive data encrypted at rest
- File uploads scanned for malware
- Access logs for audit compliance
- Privacy controls per user
- GDPR-compliant data handling

#### Access Controls

- Thread-based permissions
- Document access levels (Public, Private, Shared)
- Meeting invitation controls
- Direct message permissions

#### Audit Trail

- Complete communication logs
- Document access tracking
- User action monitoring
- IP address and user agent tracking

## Frontend Components

### Core Components

- `MessagingInterface` - Main chat interface
- `MessageThreadList` - Conversation list sidebar
- `MessageList` - Message display with replies and reactions
- `MessageInput` - Rich text input with attachments and emoji

### Features

- **Mobile-responsive design** - Optimized for all screen sizes
- **Real-time messaging** - WebSocket integration for instant updates
- **Rich text support** - Emoji, @mentions, file attachments
- **Thread management** - Create, archive, and manage conversations
- **Read receipts** - Message delivery and read confirmations
- **Typing indicators** - Real-time typing status
- **Reply threading** - Contextual message replies

## Email Notifications

### Templates

- New message notifications
- Meeting invitations and reminders
- Document sharing notifications
- Daily digest summaries

### Smart Delivery

- User preference respect
- Digest frequency control (daily/weekly/never)
- Selective notification types
- Unsubscribe management

## WebSocket Integration

### Real-time Features

- Instant message delivery
- Typing indicators
- Presence status (online/away/busy)
- Live notifications
- Meeting reminders

### Socket Events

- `new_message` - New message received
- `message_updated` - Message edited
- `message_deleted` - Message removed
- `user_typing` - User is typing
- `presence_update` - User status change
- `new_notification` - System notification
- `meeting_invitation` - Meeting invite
- `document_shared` - Document access granted

## Usage Examples

### Starting a Conversation

```typescript
// Create new thread with multiple participants
const response = await fetch('/api/communications/threads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Business Inquiry Discussion',
    businessId: 'business-123',
    participantIds: ['user-456', 'user-789'],
    initialMessage: 'Hi, I'm interested in learning more about this business.'
  })
})
```

### Sending a Message

```typescript
// Send message in existing thread
const response = await fetch(
  `/api/communications/threads/${threadId}/messages`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content:
        'Thank you for your interest. I would be happy to discuss this further.',
      messageType: 'text',
      replyToId: 'message-123', // Optional: reply to specific message
    }),
  }
)
```

### Scheduling a Meeting

```typescript
// Schedule meeting with attendees
const response = await fetch('/api/communications/meetings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    threadId: 'thread-123',
    title: 'Business Discussion',
    description: 'Detailed discussion about the business opportunity',
    scheduledStart: '2024-01-15T10:00:00Z',
    scheduledEnd: '2024-01-15T11:00:00Z',
    location: 'Virtual Meeting',
    attendeeIds: ['user-456', 'user-789'],
  }),
})
```

### Document Sharing

```typescript
// Upload and share document
const formData = new FormData()
formData.append('file', file)
formData.append(
  'metadata',
  JSON.stringify({
    threadId: 'thread-123',
    description: 'Financial statements for review',
    accessLevel: 'SHARED',
    category: 'financial',
  })
)

const response = await fetch('/api/communications/documents', {
  method: 'POST',
  body: formData,
})
```

## Configuration

### Environment Variables

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_EMAIL=true

# Database
DATABASE_URL=postgresql://user:password@localhost/goodbuy_hq
```

### User Preferences

Users can configure:

- Email notification preferences
- Message read receipts visibility
- Online status sharing
- Working hours for meetings
- Direct message permissions
- Digest frequency

## Performance Optimizations

### Database

- Indexed queries for fast message retrieval
- Pagination for large conversation lists
- Efficient read receipt tracking
- Background cleanup of old data

### Frontend

- Virtual scrolling for large message lists
- Optimistic UI updates
- Debounced typing indicators
- Lazy loading of attachments

### Caching

- Thread list caching
- Message pagination
- User presence caching
- Document access caching

## Compliance & Privacy

### GDPR Compliance

- Right to data export
- Right to deletion
- Privacy by design
- Consent management

### Data Retention

- Messages: Indefinite (user controlled)
- Documents: User controlled with expiration
- Audit logs: 6 months
- Notifications: 30 days after dismissal

### Security

- End-to-end encryption for sensitive documents
- Secure file upload validation
- XSS and CSRF protection
- Rate limiting on all endpoints

## Future Enhancements

### Planned Features

- Voice message support
- Video call integration
- Advanced document collaboration
- AI-powered message insights
- Multi-language support
- Mobile app development

### Integration Opportunities

- CRM system integration
- Calendar synchronization
- Third-party document providers
- Business intelligence tools
- Compliance monitoring systems

## Maintenance

### Regular Tasks

- Database cleanup of old records
- Email template updates
- Security patch management
- Performance monitoring
- User feedback collection

### Monitoring

- Message delivery rates
- Email notification success
- WebSocket connection health
- Document access patterns
- System performance metrics

This comprehensive communication system provides a secure, scalable foundation for business communications while maintaining privacy and compliance standards.
