# SendGrid Email Setup for GoodBuy HQ

## 1. SendGrid Configuration

Add to your `.env.local` file:

```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here

# Enable email features
NEXT_PUBLIC_ENABLE_EMAIL=true
```

## 2. SendGrid Setup Steps

1. **Create SendGrid Account:**
   - Sign up at https://sendgrid.com
   - Verify your email address

2. **Create API Key:**
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Choose "Full Access"
   - Copy the generated key (save it securely!)

3. **Domain Authentication (Optional but Recommended):**
   - Go to Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow DNS setup instructions
   - This improves delivery rates and removes "via sendgrid.net" from emails

4. **Sender Identity:**
   - Go to Settings → Sender Authentication
   - Add a verified sender email address
   - Use the same email as SMTP_USER in your config

## 3. Test Email Configuration

Create a simple test script to verify email works:

```typescript
// scripts/test-email.ts
import { sendVerificationEmail } from '@/lib/email'

async function testEmail() {
  try {
    await sendVerificationEmail(
      'your-test@email.com',
      'test-token-123',
      'Test User'
    )
    console.log('✅ Email sent successfully!')
  } catch (error) {
    console.error('❌ Email failed:', error)
  }
}

testEmail()
```

Run with: `npx tsx scripts/test-email.ts`

## 4. SendGrid Dashboard Features

After setup, you can monitor:

- Email delivery rates
- Open/click tracking
- Bounce/spam reports
- Delivery analytics

## 5. Production Considerations

- **IP Warm-up**: SendGrid handles this automatically
- **Reputation**: Monitor your sender reputation
- **Compliance**: Ensure CAN-SPAM compliance
- **Unsubscribes**: SendGrid handles unsubscribe links automatically

## 6. Pricing (as of 2024)

- **Free**: 100 emails/day forever
- **Essentials**: $19.95/month for 50,000 emails
- **Pro**: $89.95/month for 100,000 emails

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error:**
   - Verify API key is correct
   - Check SMTP_USER is exactly "apikey"

2. **Emails not delivering:**
   - Check spam folders
   - Verify sender domain authentication
   - Monitor SendGrid activity dashboard

3. **Rate limiting:**
   - Free tier limited to 100 emails/day
   - Upgrade plan if needed

### Support Resources:

- SendGrid Documentation: https://docs.sendgrid.com
- SMTP Integration Guide: https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api
