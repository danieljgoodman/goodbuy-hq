import { PrismaClient, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  console.log('Creating test users...')

  try {
    // Create test business owner
    const businessOwnerExists = await prisma.user.findUnique({
      where: { email: 'testowner@goodbuyhq.com' }
    })

    if (!businessOwnerExists) {
      const hashedPassword = await bcrypt.hash('TestOwner123!', 12)
      const testOwner = await prisma.user.create({
        data: {
          email: 'testowner@goodbuyhq.com',
          name: 'Test Business Owner',
          firstName: 'Test',
          lastName: 'Owner',
          userType: UserType.BUSINESS_OWNER,
          status: 'ACTIVE',
          hashedPassword,
          company: 'Test Business Solutions',
          bio: 'Test business owner for marketplace testing'
        }
      })
      console.log('✅ Created test business owner:', testOwner.email)
    } else {
      console.log('✅ Test business owner already exists:', businessOwnerExists.email)
    }

    // Create test buyer
    const buyerExists = await prisma.user.findUnique({
      where: { email: 'testbuyer@goodbuyhq.com' }
    })

    if (!buyerExists) {
      const hashedPassword = await bcrypt.hash('TestBuyer123!', 12)
      const testBuyer = await prisma.user.create({
        data: {
          email: 'testbuyer@goodbuyhq.com',
          name: 'Test Buyer',
          firstName: 'Test',
          lastName: 'Buyer',
          userType: UserType.BUYER,
          status: 'ACTIVE',
          hashedPassword,
          company: 'Investment Group LLC',
          bio: 'Test buyer for marketplace testing'
        }
      })
      console.log('✅ Created test buyer:', testBuyer.email)
    } else {
      console.log('✅ Test buyer already exists:', buyerExists.email)
    }

    console.log('\n🎉 Test users setup complete!')
    console.log('\nLogin credentials:')
    console.log('Business Owner: testowner@goodbuyhq.com / TestOwner123!')
    console.log('Buyer: testbuyer@goodbuyhq.com / TestBuyer123!')

  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()