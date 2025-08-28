# AWS SES Email Setup for GoodBuy HQ

## 1. AWS SES Configuration

Add to your `.env.local` file:

```env
# AWS SES Configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_access_key_id
SMTP_PASSWORD=your_aws_secret_access_key

# Enable email features
NEXT_PUBLIC_ENABLE_EMAIL=true

# Optional: AWS Region
AWS_REGION=us-east-1
```

## 2. AWS SES Setup Steps

### Step 1: AWS Account Setup

1. **Create/Login to AWS Account:**
   - Go to https://aws.amazon.com
   - Navigate to AWS Console → Simple Email Service (SES)

2. **Choose AWS Region:**
   - Select region closest to your users
   - Common choices: us-east-1, us-west-2, eu-west-1

### Step 2: Verify Email Addresses

1. **In SES Console:**
   - Go to "Verified identities"
   - Click "Create identity"
   - Choose "Email address"
   - Enter your sender email (e.g., noreply@yourdomain.com)
   - Check email and click verification link

### Step 3: Domain Verification (Recommended)

1. **Verify Your Domain:**
   - Go to "Verified identities" → "Create identity"
   - Choose "Domain"
   - Enter your domain (e.g., yourdomain.com)
   - Add DNS records provided by AWS
   - Wait for verification (up to 72 hours)

### Step 4: SMTP Credentials

1. **Create SMTP Credentials:**
   - Go to "SMTP settings"
   - Click "Create SMTP credentials"
   - Download/save the credentials securely
   - Use these for SMTP_USER and SMTP_PASSWORD

### Step 5: Production Access (Important!)

AWS SES starts in "Sandbox Mode":

- Limited to verified email addresses only
- 200 emails/day maximum
- 1 email/second rate

**Request Production Access:**

1. Go to "Account dashboard"
2. Click "Request production access"
3. Fill out the form:
   - Use case: Transactional emails
   - Website: Your domain
   - Describe your email sending
4. Wait for approval (usually 24-48 hours)

## 3. Advanced SES Setup

### Configuration Sets (Optional)

```typescript
// lib/ses-config.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SMTP_USER!,
    secretAccessKey: process.env.SMTP_PASSWORD!,
  },
})

export async function sendEmailViaSES(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  const command = new SendEmailCommand({
    Source: process.env.SMTP_USER!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: htmlContent },
        Text: { Data: textContent || '' },
      },
    },
    ConfigurationSetName: 'goodbuy-hq-emails', // Optional
  })

  return await sesClient.send(command)
}
```

### Install AWS SDK (Optional)

```bash
npm install @aws-sdk/client-ses --legacy-peer-deps
```

## 4. Monitoring & Analytics

### CloudWatch Metrics

AWS SES provides metrics for:

- Delivery attempts
- Bounces and complaints
- Reputation metrics

### Event Publishing

Configure SES to publish events to:

- CloudWatch Logs
- SNS topics
- Kinesis streams

## 5. Cost Comparison

### AWS SES Pricing (as of 2024)

- **Free Tier**: 62,000 emails/month for first 12 months
- **After free tier**: $0.10 per 1,000 emails
- **Data transfer**: $0.12 per GB

### Monthly Examples:

- 10,000 emails: ~$1.00/month
- 100,000 emails: ~$10.00/month
- 1,000,000 emails: ~$100/month

## 6. Production Best Practices

### Bounce and Complaint Handling

```typescript
// lib/ses-webhooks.ts
export async function handleSESWebhook(event: any) {
  if (event.eventType === 'bounce') {
    // Remove bounced email from database
    await prisma.user.update({
      where: { email: event.bounce.bouncedRecipients[0].emailAddress },
      data: { emailValid: false },
    })
  }

  if (event.eventType === 'complaint') {
    // Handle spam complaints
    await prisma.user.update({
      where: { email: event.complaint.complainedRecipients[0].emailAddress },
      data: { emailOptOut: true },
    })
  }
}
```

### Reputation Management

- Monitor bounce rates (keep < 5%)
- Monitor complaint rates (keep < 0.1%)
- Implement double opt-in for newsletters
- Clean email lists regularly

## 7. Security Considerations

### IAM Permissions

Create dedicated IAM user with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

### Environment Security

- Never commit AWS credentials to code
- Use AWS Secrets Manager in production
- Rotate credentials regularly

## 8. Testing SES Setup

Create test script:

```typescript
// scripts/test-ses.ts
import { sendVerificationEmail } from '@/lib/email'

async function testSESEmail() {
  try {
    console.log('Testing AWS SES email delivery...')
    await sendVerificationEmail(
      'your-verified@email.com',
      'test-token-123',
      'Test User'
    )
    console.log('✅ SES email sent successfully!')
  } catch (error) {
    console.error('❌ SES email failed:', error)
  }
}

testSESEmail()
```

## Troubleshooting

### Common Issues:

1. **"Email address not verified" error:**
   - Verify sender email in SES console
   - Check you're not in sandbox mode

2. **Authentication errors:**
   - Verify SMTP credentials are correct
   - Check AWS region matches SMTP host

3. **Rate limiting:**
   - Sandbox: 1 email/second, 200/day max
   - Production: Higher limits based on reputation

4. **High bounce/complaint rates:**
   - Review email list quality
   - Implement proper unsubscribe handling
   - Check email content for spam triggers
