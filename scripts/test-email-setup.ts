import { 
  sendVerificationEmail,
  sendNewMessageNotification,
  sendMeetingInvitation,
  sendDailyDigest 
} from '../src/lib/email'

async function testEmailSetup() {
  console.log('🧪 Testing Email Configuration...\n')

  const testEmail = 'test@example.com' // Replace with your email for testing
  const testName = 'Test User'

  try {
    console.log('1️⃣ Testing verification email...')
    await sendVerificationEmail(testEmail, 'test-token-123', testName)
    console.log('✅ Verification email sent successfully!\n')

    console.log('2️⃣ Testing message notification email...')
    await sendNewMessageNotification(
      testEmail,
      testName,
      'John Doe',
      'Business Discussion',
      'Hello, I am interested in your business listing...',
      'thread-123'
    )
    console.log('✅ Message notification email sent successfully!\n')

    console.log('3️⃣ Testing meeting invitation email...')
    await sendMeetingInvitation(
      testEmail,
      testName,
      'Jane Smith',
      'Business Discussion Meeting',
      'Let\'s discuss the business opportunity in detail',
      new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
      'Virtual Meeting Room',
      'meeting-456'
    )
    console.log('✅ Meeting invitation email sent successfully!\n')

    console.log('4️⃣ Testing daily digest email...')
    await sendDailyDigest(testEmail, testName, 3, 2, 1)
    console.log('✅ Daily digest email sent successfully!\n')

    console.log('🎉 All email tests passed! Your email service is properly configured.')
    console.log('\n📋 Next Steps:')
    console.log('1. Check your email inbox for all 4 test emails')
    console.log('2. Verify the emails look correct and links work')
    console.log('3. Update email templates in src/lib/email.ts if needed')
    console.log('4. Configure user email preferences in the app')

  } catch (error) {
    console.error('❌ Email test failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your SMTP configuration in .env.local')
    console.log('2. Verify your email service credentials')
    console.log('3. Check if email service is enabled: NEXT_PUBLIC_ENABLE_EMAIL=true')
    console.log('4. Review the email setup guides in the project root')
  }
}

// Run the test
testEmailSetup()