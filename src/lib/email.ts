import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .button { display: inline-block; background-color: #0ea5e9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GoodBuy HQ</h1>
        </div>
        <div class="content">
          <h2>Welcome to GoodBuy HQ, ${name}!</h2>
          <p>Thank you for creating an account with us. To complete your registration and start exploring business opportunities, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="background-color: #f8fafc; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with GoodBuy HQ, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
          <p>Your business headquarters for better buying decisions</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    Welcome to GoodBuy HQ, ${name}!

    Thank you for creating an account with us. To complete your registration, please verify your email address by visiting this link:

    ${verificationUrl}

    This link will expire in 24 hours.

    If you didn't create an account with GoodBuy HQ, you can safely ignore this email.

    Best regards,
    The GoodBuy HQ Team
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email address - GoodBuy HQ',
      text: textContent,
      html: htmlContent,
    })

    console.log('Verification email sent successfully to:', email)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .feature { margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GoodBuy HQ</h1>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${name}! 🎉</h2>
          <p>Your email has been verified and your account is now active. You're all set to explore the world of business opportunities on GoodBuy HQ!</p>
          
          <h3>What's next?</h3>
          <div class="feature">
            <strong>📊 Explore Businesses</strong><br>
            Browse through our curated list of businesses for sale with detailed financial information and professional evaluations.
          </div>
          
          <div class="feature">
            <strong>💼 Complete Your Profile</strong><br>
            Add more details to your profile to help sellers and brokers understand your interests and requirements.
          </div>
          
          <div class="feature">
            <strong>🔍 Set Up Alerts</strong><br>
            Create custom alerts to be notified when businesses matching your criteria become available.
          </div>
          
          <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email!</p>
          
          <p>Happy business hunting!</p>
          <p>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to GoodBuy HQ - Your account is now active!',
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}

// Communication-related email templates
export async function sendNewMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  threadSubject: string | null,
  messagePreview: string,
  threadId: string
) {
  const threadUrl = `${process.env.NEXTAUTH_URL}/messages/${threadId}`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Message - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .message-preview { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .button { display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📨 New Message</h1>
        </div>
        <div class="content">
          <h2>Hi ${recipientName},</h2>
          <p>You have a new message from <strong>${senderName}</strong>${threadSubject ? ` in "${threadSubject}"` : ''}:</p>
          
          <div class="message-preview">
            ${messagePreview}
          </div>
          
          <div style="text-align: center;">
            <a href="${threadUrl}" class="button">View Full Conversation</a>
          </div>
          
          <p>Best regards,<br>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
          <p>To unsubscribe from message notifications, <a href="${process.env.NEXTAUTH_URL}/settings/notifications">update your preferences</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `New message from ${senderName}${threadSubject ? ` - ${threadSubject}` : ''} - GoodBuy HQ`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send message notification:', error)
    throw error
  }
}

export async function sendMeetingInvitation(
  recipientEmail: string,
  recipientName: string,
  organizerName: string,
  meetingTitle: string,
  meetingDescription: string | null,
  scheduledStart: Date,
  scheduledEnd: Date,
  location: string | null,
  meetingId: string
) {
  const meetingUrl = `${process.env.NEXTAUTH_URL}/meetings/${meetingId}`
  const startTime = scheduledStart.toLocaleString()
  const endTime = scheduledEnd.toLocaleString()
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Meeting Invitation - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .meeting-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: 600; color: #374151; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px; }
        .button-decline { background-color: #ef4444; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Meeting Invitation</h1>
        </div>
        <div class="content">
          <h2>Hi ${recipientName},</h2>
          <p><strong>${organizerName}</strong> has invited you to a meeting:</p>
          
          <div class="meeting-details">
            <h3>${meetingTitle}</h3>
            ${meetingDescription ? `<p>${meetingDescription}</p>` : ''}
            
            <div class="detail-row">
              <span class="detail-label">📅 When:</span> ${startTime} - ${endTime}
            </div>
            ${location ? `<div class="detail-row"><span class="detail-label">📍 Where:</span> ${location}</div>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${meetingUrl}?response=accept" class="button">Accept</a>
            <a href="${meetingUrl}?response=decline" class="button button-decline">Decline</a>
          </div>
          
          <p><a href="${meetingUrl}">View full meeting details</a></p>
          
          <p>Best regards,<br>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Meeting Invitation: ${meetingTitle} - GoodBuy HQ`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send meeting invitation:', error)
    throw error
  }
}

export async function sendMeetingReminder(
  recipientEmail: string,
  recipientName: string,
  meetingTitle: string,
  scheduledStart: Date,
  location: string | null,
  meetingId: string,
  hoursUntilMeeting: number
) {
  const meetingUrl = `${process.env.NEXTAUTH_URL}/meetings/${meetingId}`
  const startTime = scheduledStart.toLocaleString()
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Meeting Reminder - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .meeting-details { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Meeting Reminder</h1>
        </div>
        <div class="content">
          <h2>Hi ${recipientName},</h2>
          <p>This is a reminder that you have a meeting coming up in ${hoursUntilMeeting} hour${hoursUntilMeeting !== 1 ? 's' : ''}:</p>
          
          <div class="meeting-details">
            <h3>${meetingTitle}</h3>
            <p><strong>📅 Time:</strong> ${startTime}</p>
            ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${meetingUrl}" class="button">View Meeting Details</a>
          </div>
          
          <p>Best regards,<br>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Reminder: ${meetingTitle} in ${hoursUntilMeeting} hour${hoursUntilMeeting !== 1 ? 's' : ''} - GoodBuy HQ`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send meeting reminder:', error)
    throw error
  }
}

export async function sendDocumentSharedNotification(
  recipientEmail: string,
  recipientName: string,
  sharerName: string,
  documentName: string,
  description: string | null,
  threadSubject: string | null,
  documentId: string
) {
  const documentUrl = `${process.env.NEXTAUTH_URL}/documents/${documentId}`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Document Shared - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #0ea5e9 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .document-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
        .button { display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Document Shared</h1>
        </div>
        <div class="content">
          <h2>Hi ${recipientName},</h2>
          <p><strong>${sharerName}</strong> has shared a document with you${threadSubject ? ` in "${threadSubject}"` : ''}:</p>
          
          <div class="document-info">
            <h3>📎 ${documentName}</h3>
            ${description ? `<p>${description}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${documentUrl}" class="button">View Document</a>
          </div>
          
          <p>Best regards,<br>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Document shared: ${documentName} - GoodBuy HQ`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send document notification:', error)
    throw error
  }
}

export async function sendDailyDigest(
  recipientEmail: string,
  recipientName: string,
  unreadMessages: number,
  upcomingMeetings: number,
  newDocuments: number
) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Daily Digest - GoodBuy HQ</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat-item { text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px; margin: 0 10px; flex: 1; }
        .stat-number { font-size: 32px; font-weight: bold; color: #0ea5e9; }
        .stat-label { font-size: 14px; color: #64748b; margin-top: 5px; }
        .button { display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Digest</h1>
        </div>
        <div class="content">
          <h2>Good morning, ${recipientName}!</h2>
          <p>Here's what's new since yesterday:</p>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">${unreadMessages}</div>
              <div class="stat-label">Unread Messages</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${upcomingMeetings}</div>
              <div class="stat-label">Upcoming Meetings</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${newDocuments}</div>
              <div class="stat-label">New Documents</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </div>
          
          <p>Have a productive day!</p>
          <p>The GoodBuy HQ Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 GoodBuy HQ. All rights reserved.</p>
          <p>To unsubscribe from daily digest, <a href="${process.env.NEXTAUTH_URL}/settings/notifications">update your preferences</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"GoodBuy HQ" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Your GoodBuy HQ Daily Digest - ${new Date().toDateString()}`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Failed to send daily digest:', error)
    throw error
  }
}
