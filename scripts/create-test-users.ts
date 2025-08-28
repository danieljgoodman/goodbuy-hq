import { PrismaClient, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  console.log('Creating test users...')

  try {
    // Create test business owner
    const businessOwnerExists = await prisma.user.findUnique({
      where: { email: 'testowner@goodbuyhq.com' },
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
          bio: 'Test business owner for marketplace testing',
        },
      })
      console.log('✅ Created test business owner:', testOwner.email)
    } else {
      console.log(
        '✅ Test business owner already exists:',
        businessOwnerExists.email
      )
    }

    // Create test buyer
    const buyerExists = await prisma.user.findUnique({
      where: { email: 'testbuyer@goodbuyhq.com' },
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
          bio: 'Test buyer for marketplace testing',
        },
      })
      console.log('✅ Created test buyer:', testBuyer.email)
    } else {
      console.log('✅ Test buyer already exists:', buyerExists.email)
    }

    // Create test broker
    const brokerExists = await prisma.user.findUnique({
      where: { email: 'testbroker@goodbuyhq.com' },
    })

    if (!brokerExists) {
      const hashedPassword = await bcrypt.hash('TestBroker123!', 12)
      const testBroker = await prisma.user.create({
        data: {
          email: 'testbroker@goodbuyhq.com',
          name: 'Test Broker',
          firstName: 'Test',
          lastName: 'Broker',
          userType: UserType.BROKER,
          status: 'ACTIVE',
          hashedPassword,
          company: 'Professional Business Brokers',
          bio: 'Test broker for marketplace testing',
        },
      })
      console.log('✅ Created test broker:', testBroker.email)
    } else {
      console.log('✅ Test broker already exists:', brokerExists.email)
    }

    // Create test admin
    const adminExists = await prisma.user.findUnique({
      where: { email: 'testadmin@goodbuyhq.com' },
    })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('TestAdmin123!', 12)
      const testAdmin = await prisma.user.create({
        data: {
          email: 'testadmin@goodbuyhq.com',
          name: 'Test Admin',
          firstName: 'Test',
          lastName: 'Admin',
          userType: UserType.ADMIN,
          status: 'ACTIVE',
          hashedPassword,
          company: 'GoodBuy HQ',
          bio: 'Test admin for marketplace testing',
        },
      })
      console.log('✅ Created test admin:', testAdmin.email)
    } else {
      console.log('✅ Test admin already exists:', adminExists.email)
    }

    console.log('\n🎉 Test users setup complete!')
    console.log('\nLogin credentials:')
    console.log('Business Owner: testowner@goodbuyhq.com / TestOwner123!')
    console.log('Buyer: testbuyer@goodbuyhq.com / TestBuyer123!')
    console.log('Broker: testbroker@goodbuyhq.com / TestBroker123!')
    console.log('Admin: testadmin@goodbuyhq.com / TestAdmin123!')
  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
