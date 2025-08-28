import { PrismaClient, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Test user credentials
    const testEmail = 'test@goodbuyhq.com'
    const testPassword = 'Test123456!'
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    })
    
    if (existingUser) {
      console.log('✅ Test user already exists:', testEmail)
      console.log('📧 Email:', testEmail)
      console.log('🔐 Password:', testPassword)
      return existingUser
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    
    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        hashedPassword,
        userType: UserType.ADMIN,
        status: 'ACTIVE',
        emailVerified: new Date(),
        company: 'GoodBuy HQ Test',
        position: 'System Tester',
        bio: 'System test account for development and testing purposes',
      },
    })
    
    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔐 Password:', testPassword)
    console.log('👤 User Type:', user.userType)
    console.log('📊 Status:', user.status)
    console.log('🆔 User ID:', user.id)
    
    return user
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { createTestUser }