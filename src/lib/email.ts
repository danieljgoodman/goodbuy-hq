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