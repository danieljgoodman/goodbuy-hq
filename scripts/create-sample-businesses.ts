import { PrismaClient, BusinessCategory, ListingType, BusinessStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleBusinesses = [
  {
    title: "Tony's Pizza Palace - Established Italian Restaurant",
    description: "A beloved family-owned Italian restaurant serving authentic wood-fired pizzas and traditional Italian cuisine for over 15 years. Located in the heart of downtown with a loyal customer base and excellent reputation. Features a full commercial kitchen, wood-fired pizza oven, dining room seating for 80, and a profitable catering operation.\n\nThe restaurant has consistently profitable operations with strong cash flow. Includes all equipment, recipes, trained staff, and established supplier relationships. Perfect opportunity for an experienced restaurateur or someone looking to enter the food service industry with a proven concept.\n\nReason for sale: Owner retiring after 15 successful years.",
    category: BusinessCategory.RESTAURANT,
    listingType: ListingType.BUSINESS_SALE,
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'California',
    zipCode: '94102',
    website: 'https://tonyspizzapalace.com',
    phone: '(415) 555-0123',
    email: 'tony@tonyspizza.com',
    askingPrice: 450000,
    revenue: 650000,
    profit: 145000,
    cashFlow: 165000,
    ebitda: 185000,
    grossMargin: 65.5,
    netMargin: 22.3,
    monthlyRevenue: 54000,
    yearlyGrowth: 8.5,
    established: new Date('2008-01-01'),
    employees: 12,
    customerBase: 2500,
    inventory: 15000,
    equipment: 85000,
    hoursOfOperation: '11:00 AM - 10:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    reasonForSelling: 'Owner retiring after 15 successful years. Looking for someone to continue the family tradition.',
    timeframe: '3-6_months',
    negotiations: 'negotiable',
    financing: 'Owner willing to provide financing for qualified buyers. SBA loans pre-approved.',
    status: BusinessStatus.ACTIVE,
    featured: true,
    priority: 10,
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop'
    ]
  },
  {
    title: "Elite Fitness Gym - Modern Health Club",
    description: "State-of-the-art fitness facility with 8,000 sq ft of premium exercise equipment, group fitness studios, and personal training services. Established 5 years ago with a growing membership base of 850 active members.\n\nFeatures include: Cardio and strength training equipment from top manufacturers, two group fitness studios, personal training rooms, locker rooms with showers, juice bar, and retail space. The gym operates on a membership model with additional revenue from personal training, group classes, and retail sales.\n\nExcellent location with high foot traffic and ample parking. Strong social media presence and community reputation. All equipment is well-maintained and under warranty.",
    category: BusinessCategory.SERVICES,
    listingType: ListingType.BUSINESS_SALE,
    address: '456 Fitness Drive',
    city: 'Austin',
    state: 'Texas', 
    zipCode: '78701',
    website: 'https://elitefitnessgym.com',
    phone: '(512) 555-0456',
    email: 'info@elitefitness.com',
    askingPrice: 325000,
    revenue: 480000,
    profit: 92000,
    cashFlow: 112000,
    ebitda: 135000,
    grossMargin: 75.2,
    netMargin: 19.2,
    monthlyRevenue: 40000,
    yearlyGrowth: 12.5,
    established: new Date('2019-01-01'),
    employees: 8,
    customerBase: 850,
    inventory: 5000,
    equipment: 180000,
    hoursOfOperation: '5:00 AM - 11:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    reasonForSelling: 'Owner relocating to another state for family reasons.',
    timeframe: '1-3_months',
    negotiations: 'firm_price',
    financing: 'Equipment financing available. Lease can be assumed.',
    status: BusinessStatus.ACTIVE,
    featured: false,
    priority: 8
  },
  {
    title: "Sunny Side Auto Repair - Full Service Shop",
    description: "Well-established automotive repair shop serving the community for over 20 years. Full-service facility offering general repairs, oil changes, brake service, engine diagnostics, and state inspections.\n\nThe shop features 6 service bays, modern diagnostic equipment, hydraulic lifts, and a comfortable customer waiting area. Strong relationships with parts suppliers and insurance companies. Certified technicians and excellent customer reviews.\n\nConsistent revenue stream with a mix of regular maintenance customers and larger repair jobs. Located on a busy street with excellent visibility and easy access.",
    category: BusinessCategory.AUTOMOTIVE,
    listingType: ListingType.BUSINESS_SALE,
    address: '789 Auto Lane',
    city: 'Denver',
    state: 'Colorado',
    zipCode: '80202',
    website: 'https://sunnysideauto.com',
    phone: '(303) 555-0789',
    email: 'service@sunnysideauto.com',
    askingPrice: 280000,
    revenue: 420000,
    profit: 78000,
    cashFlow: 95000,
    ebitda: 105000,
    grossMargin: 58.5,
    netMargin: 18.6,
    monthlyRevenue: 35000,
    yearlyGrowth: 4.2,
    established: new Date('2003-01-01'),
    employees: 6,
    customerBase: 1200,
    inventory: 25000,
    equipment: 120000,
    hoursOfOperation: '7:00 AM - 6:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    reasonForSelling: 'Partner buyout situation. One partner wants to retire.',
    timeframe: '6-12_months',
    negotiations: 'negotiable',
    financing: 'SBA financing pre-qualified. Equipment can be financed separately.',
    status: BusinessStatus.ACTIVE,
    featured: false,
    priority: 6
  },
  {
    title: "TechFlow Solutions - B2B Software Company",
    description: "Growing B2B software company specializing in workflow automation tools for small and medium businesses. Founded 3 years ago, the company has developed a robust SaaS platform with 150+ paying customers across various industries.\n\nThe platform helps businesses automate repetitive tasks, manage workflows, and improve operational efficiency. Subscription-based revenue model with high customer retention rates (92%). Includes proprietary software, customer database, and development team.\n\nRemote-first company with a talented team of developers, sales, and customer success professionals. Excellent growth potential in the expanding automation market.",
    category: BusinessCategory.TECHNOLOGY,
    listingType: ListingType.BUSINESS_SALE,
    city: 'Seattle',
    state: 'Washington',
    zipCode: '98101',
    website: 'https://techflowsolutions.com',
    phone: '(206) 555-0901',
    email: 'hello@techflowsolutions.com',
    askingPrice: 850000,
    revenue: 380000,
    profit: 95000,
    cashFlow: 125000,
    ebitda: 145000,
    grossMargin: 85.2,
    netMargin: 25.0,
    monthlyRevenue: 32000,
    yearlyGrowth: 45.5,
    established: new Date('2021-01-01'),
    employees: 8,
    customerBase: 150,
    hoursOfOperation: 'Remote - Flexible',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    reasonForSelling: 'Founder wants to start a new venture and needs capital for next project.',
    timeframe: '3-6_months',
    negotiations: 'open_to_offers',
    financing: 'Seller financing available for 30% of purchase price.',
    status: BusinessStatus.ACTIVE,
    featured: true,
    priority: 9
  },
  {
    title: "Bella's Boutique - Women's Fashion Retail",
    description: "Charming women's fashion boutique specializing in contemporary clothing, accessories, and jewelry. Located in a trendy shopping district with high foot traffic and excellent visibility.\n\nThe boutique offers carefully curated collections from emerging and established designers. Strong online presence with e-commerce website generating 40% of total sales. Loyal customer base with active social media following of 8,500+ followers.\n\nThe business includes all inventory, fixtures, POS system, and established vendor relationships. Prime retail location with reasonable rent and option to renew lease.",
    category: BusinessCategory.RETAIL,
    listingType: ListingType.BUSINESS_SALE,
    address: '321 Fashion Street',
    city: 'Portland',
    state: 'Oregon',
    zipCode: '97201',
    website: 'https://bellasboutique.com',
    phone: '(503) 555-0321',
    email: 'bella@bellasboutique.com',
    askingPrice: 185000,
    revenue: 290000,
    profit: 52000,
    cashFlow: 68000,
    ebitda: 72000,
    grossMargin: 62.8,
    netMargin: 17.9,
    monthlyRevenue: 24000,
    yearlyGrowth: 15.2,
    established: new Date('2017-01-01'),
    employees: 4,
    customerBase: 2200,
    inventory: 45000,
    equipment: 12000,
    hoursOfOperation: '10:00 AM - 8:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    reasonForSelling: 'Owner moving to focus on online expansion and needs investor.',
    timeframe: '1-3_months',
    negotiations: 'negotiable',
    financing: 'Inventory financing available. Lease transferable.',
    status: BusinessStatus.ACTIVE,
    featured: false,
    priority: 7
  },
  {
    title: "Green Valley Landscaping - Commercial & Residential",
    description: "Established landscaping company providing comprehensive outdoor services including landscape design, installation, maintenance, and irrigation systems. Serving both commercial and residential clients for over 10 years.\n\nThe company has built an excellent reputation for quality work and customer service. Fleet of well-maintained trucks and equipment included. Recurring revenue from maintenance contracts provides stable cash flow.\n\nServices include: landscape design, plant installation, lawn care, irrigation systems, hardscaping, and seasonal cleanup. Strong customer retention rate with many long-term maintenance contracts.",
    category: BusinessCategory.SERVICES,
    listingType: ListingType.BUSINESS_SALE,
    address: '654 Garden Way',
    city: 'Nashville',
    state: 'Tennessee',
    zipCode: '37201',
    phone: '(615) 555-0654',
    email: 'info@greenvalley.com',
    askingPrice: 195000,
    revenue: 320000,
    profit: 64000,
    cashFlow: 78000,
    ebitda: 85000,
    grossMargin: 55.0,
    netMargin: 20.0,
    monthlyRevenue: 27000,
    yearlyGrowth: 8.8,
    established: new Date('2013-01-01'),
    employees: 7,
    customerBase: 180,
    inventory: 8000,
    equipment: 65000,
    hoursOfOperation: '6:00 AM - 5:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    seasonality: 'Higher activity in spring/summer months, snow removal services in winter.',
    reasonForSelling: 'Health reasons require owner to step back from physical work.',
    timeframe: '6-12_months',
    negotiations: 'negotiable',
    financing: 'Equipment financing available. Customer contracts transferable.',
    status: BusinessStatus.UNDER_REVIEW,
    featured: false,
    priority: 5
  },
  {
    title: "Corner Market Convenience Store",
    description: "Profitable neighborhood convenience store in a prime residential location. Operating for 8 years with consistent customer base and steady revenue streams.\n\nThe store offers groceries, beverages, snacks, lottery tickets, and basic household items. Additional revenue from ATM, money orders, and bill payment services. Long-term lease with reasonable terms.\n\nExcellent location with minimal competition nearby. Loyal customer base includes many regular daily customers. All equipment, inventory, and vendor relationships included.",
    category: BusinessCategory.RETAIL,
    listingType: ListingType.BUSINESS_SALE,
    address: '987 Corner Ave',
    city: 'Phoenix',
    state: 'Arizona',
    zipCode: '85001',
    phone: '(602) 555-0987',
    email: 'owner@cornermarket.com',
    askingPrice: 125000,
    revenue: 185000,
    profit: 42000,
    cashFlow: 48000,
    ebitda: 52000,
    grossMargin: 35.5,
    netMargin: 22.7,
    monthlyRevenue: 15400,
    yearlyGrowth: 3.2,
    established: new Date('2015-01-01'),
    employees: 3,
    customerBase: 800,
    inventory: 35000,
    equipment: 18000,
    hoursOfOperation: '6:00 AM - 11:00 PM',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    reasonForSelling: 'Owner has other business interests requiring full attention.',
    timeframe: '1-3_months',
    negotiations: 'firm_price',
    financing: 'Lease assumable. Vendor financing terms available.',
    status: BusinessStatus.ACTIVE,
    featured: false,
    priority: 4
  },
  {
    title: "Digital Marketing Agency - Growth Opportunity",
    description: "Boutique digital marketing agency specializing in social media management, content creation, and paid advertising for small to medium businesses. Established 2 years ago with rapid growth and excellent client retention.\n\nServices include social media strategy, content creation, Google Ads management, Facebook advertising, and email marketing. Team of creative professionals and account managers. Most work done remotely with flexible arrangements.\n\nStrong portfolio of successful campaigns and excellent client testimonials. Opportunity to scale with additional resources and expanded service offerings.",
    category: BusinessCategory.SERVICES,
    listingType: ListingType.BUSINESS_SALE,
    city: 'Miami',
    state: 'Florida',
    zipCode: '33101',
    website: 'https://digitalmarketingpro.com',
    phone: '(305) 555-0135',
    email: 'hello@digitalmarketingpro.com',
    askingPrice: 95000,
    revenue: 145000,
    profit: 38000,
    cashFlow: 42000,
    ebitda: 45000,
    grossMargin: 78.5,
    netMargin: 26.2,
    monthlyRevenue: 12000,
    yearlyGrowth: 65.0,
    established: new Date('2022-01-01'),
    employees: 4,
    customerBase: 25,
    hoursOfOperation: 'Remote - Flexible',
    daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    reasonForSelling: 'Founder relocating internationally and cannot manage remotely.',
    timeframe: 'immediate',
    negotiations: 'open_to_offers',
    financing: 'Payment plan available for qualified buyers.',
    status: BusinessStatus.DRAFT,
    featured: false,
    priority: 3
  }
]

async function createSampleBusinesses() {
  console.log('Creating sample business owners and businesses...')

  try {
    // Create business owner accounts if they don't exist
    const existingBusinessOwner = await prisma.user.findUnique({
      where: { email: 'seller@goodbuyhq.com' }
    })

    let businessOwnerId: string

    if (!existingBusinessOwner) {
      const hashedPassword = await bcrypt.hash('Seller123!', 12)
      const businessOwner = await prisma.user.create({
        data: {
          email: 'seller@goodbuyhq.com',
          name: 'Tony Martinez',
          userType: 'BUSINESS_OWNER',
          status: BusinessStatus.ACTIVE,
          hashedPassword,
          firstName: 'Tony',
          lastName: 'Martinez',
          company: 'Martinez Business Ventures',
          bio: 'Experienced business owner and entrepreneur with 20+ years in the restaurant and service industries.'
        }
      })
      businessOwnerId = businessOwner.id
    } else {
      businessOwnerId = existingBusinessOwner.id
    }

    // Create additional business owners for variety
    const additionalOwners = [
      {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Smith Enterprises',
        bio: 'Serial entrepreneur with expertise in retail and e-commerce businesses.'
      },
      {
        email: 'mike.johnson@example.com', 
        name: 'Mike Johnson',
        firstName: 'Mike',
        lastName: 'Johnson',
        company: 'Johnson Holdings',
        bio: 'Technology executive turned business broker with deep industry knowledge.'
      },
      {
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson', 
        firstName: 'Sarah',
        lastName: 'Wilson',
        company: 'Wilson Investment Group',
        bio: 'Investment professional specializing in small business acquisitions.'
      }
    ]

    const ownerIds = [businessOwnerId]

    for (const ownerData of additionalOwners) {
      const existingOwner = await prisma.user.findUnique({
        where: { email: ownerData.email }
      })

      if (!existingOwner) {
        const hashedPassword = await bcrypt.hash('Password123!', 12)
        const owner = await prisma.user.create({
          data: {
            ...ownerData,
            userType: 'BUSINESS_OWNER',
            status: BusinessStatus.ACTIVE, 
            hashedPassword
          }
        })
        ownerIds.push(owner.id)
      } else {
        ownerIds.push(existingOwner.id)
      }
    }

    // Create sample businesses
    let createdCount = 0
    
    for (let i = 0; i < sampleBusinesses.length; i++) {
      const businessData = sampleBusinesses[i]
      const ownerId = ownerIds[i % ownerIds.length] // Distribute across owners

      // Check if business already exists
      const existingBusiness = await prisma.business.findFirst({
        where: { title: businessData.title }
      })

      if (!existingBusiness) {
        // Generate slug
        const slug = businessData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        const business = await prisma.business.create({
          data: {
            ...businessData,
            slug: `${slug}-${Date.now().toString(36)}`,
            location: `${businessData.city}, ${businessData.state}`,
            ownerId,
            publishedAt: businessData.status === 'ACTIVE' ? new Date() : null,
            // Add some random view counts for realism
            viewCount: Math.floor(Math.random() * 500) + 50,
            inquiryCount: Math.floor(Math.random() * 15) + 1
          }
        })

        // Create sample business images
        if (businessData.images) {
          const imageData = businessData.images.map((url, index) => ({
            businessId: business.id,
            url,
            thumbnailUrl: url,
            alt: `${business.title} - Image ${index + 1}`,
            isPrimary: index === 0,
            orderIndex: index,
            size: 150000 + Math.floor(Math.random() * 100000),
            width: 800,
            height: 600,
            format: 'jpeg'
          }))

          await prisma.businessImage.createMany({
            data: imageData
          })
        }

        // Create some sample views
        const viewCount = Math.floor(Math.random() * 20) + 5
        const viewData = []
        for (let v = 0; v < viewCount; v++) {
          viewData.push({
            businessId: business.id,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            userAgent: 'Mozilla/5.0 (Sample Browser)',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          })
        }

        await prisma.businessView.createMany({
          data: viewData
        })

        createdCount++
      }
    }

    console.log(`Successfully created ${createdCount} sample businesses`)
    console.log('Sample data creation complete!')

  } catch (error) {
    console.error('Error creating sample businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createSampleBusinesses()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })