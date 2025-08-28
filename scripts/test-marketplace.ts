import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMarketplace() {
  console.log('🧪 Testing Marketplace Functionality')
  console.log('=====================================\n')

  try {
    // Test 1: Check if businesses exist
    console.log('1. Checking marketplace data...')
    const businessCount = await prisma.business.count({
      where: { status: 'ACTIVE' }
    })
    console.log(`   ✅ Found ${businessCount} active business listings`)

    if (businessCount > 0) {
      const sampleBusiness = await prisma.business.findFirst({
        where: { status: 'ACTIVE' },
        include: {
          owner: {
            select: { name: true, email: true }
          }
        }
      })
      console.log(`   📋 Sample: "${sampleBusiness?.title}" by ${sampleBusiness?.owner.name}`)
    }

    // Test 2: Check test users
    console.log('\n2. Checking test user accounts...')
    const testOwner = await prisma.user.findUnique({
      where: { email: 'testowner@goodbuyhq.com' }
    })
    const testBuyer = await prisma.user.findUnique({
      where: { email: 'testbuyer@goodbuyhq.com' }
    })
    
    console.log(`   ${testOwner ? '✅' : '❌'} Test business owner: ${testOwner ? 'Ready' : 'Missing'}`)
    console.log(`   ${testBuyer ? '✅' : '❌'} Test buyer: ${testBuyer ? 'Ready' : 'Missing'}`)

    // Test 3: Check marketplace categories
    console.log('\n3. Checking business categories...')
    const categories = await prisma.business.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: {
        id: true
      }
    })
    
    categories.forEach(cat => {
      console.log(`   📊 ${cat.category}: ${cat._count.id} businesses`)
    })

    // Test 4: Check inquiries system
    console.log('\n4. Checking inquiry system...')
    const inquiriesCount = await prisma.inquiry.count()
    console.log(`   📧 Total inquiries in system: ${inquiriesCount}`)

    // Test API endpoints
    console.log('\n5. Testing API endpoints...')
    console.log('   🌐 Testing /api/businesses endpoint...')
    
    try {
      const response = await fetch('http://localhost:3000/api/businesses?page=1&limit=3')
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ API responded with ${data.businesses?.length || 0} businesses`)
      } else {
        console.log(`   ❌ API error: ${response.status}`)
      }
    } catch (error) {
      console.log('   ❌ API connection failed - make sure dev server is running')
    }

    console.log('\n🎉 Marketplace Testing Complete!')
    console.log('\n📋 Ready for Manual Testing:')
    console.log('   1. Visit http://localhost:3000/marketplace')
    console.log('   2. Browse business listings')
    console.log('   3. Click on a business to view details')
    console.log('   4. Login with test accounts:')
    console.log('      • Business Owner: testowner@goodbuyhq.com / TestOwner123!')
    console.log('      • Buyer: testbuyer@goodbuyhq.com / TestBuyer123!')
    console.log('   5. Test creating inquiries and listings')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMarketplace()