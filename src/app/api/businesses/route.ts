import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createBusinessSchema = z.object({
  // Basic Information
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'RESTAURANT',
    'RETAIL',
    'ECOMMERCE',
    'TECHNOLOGY',
    'MANUFACTURING',
    'SERVICES',
    'HEALTHCARE',
    'REAL_ESTATE',
    'AUTOMOTIVE',
    'ENTERTAINMENT',
    'EDUCATION',
    'OTHER'
  ]).optional(),
  listingType: z.enum([
    'BUSINESS_SALE',
    'ASSET_SALE',
    'FRANCHISE',
    'PARTNERSHIP',
    'INVESTMENT'
  ]).default('BUSINESS_SALE'),
  
  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Contact
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  
  // Financial (all optional, converted to Decimal)
  askingPrice: z.string().optional(),
  revenue: z.string().optional(),
  profit: z.string().optional(),
  cashFlow: z.string().optional(),
  ebitda: z.string().optional(),
  grossMargin: z.string().optional(),
  netMargin: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  yearlyGrowth: z.string().optional(),
  
  // Business details
  established: z.string().optional(),
  employees: z.string().optional(),
  customerBase: z.string().optional(),
  
  // Assets
  inventory: z.string().optional(),
  equipment: z.string().optional(),
  realEstate: z.string().optional(),
  totalAssets: z.string().optional(),
  liabilities: z.string().optional(),
  
  // Operations
  hoursOfOperation: z.string().optional(),
  daysOpen: z.array(z.string()).default([]),
  seasonality: z.string().optional(),
  competition: z.string().optional(),
  
  // Sale details
  reasonForSelling: z.string().optional(),
  timeframe: z.string().optional(),
  negotiations: z.string().optional(),
  financing: z.string().optional(),
  
  // Status
  status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'REJECTED', 'SOLD', 'ARCHIVED']).default('DRAFT'),
  
  // Media
  images: z.array(z.any()).default([]),
  documents: z.array(z.any()).default([])
})

function convertToDecimal(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

function convertToInt(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined
  const num = parseInt(value)
  return isNaN(num) ? undefined : num
}

function convertToFloat(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

function generateSlug(title: string, id?: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return id ? `${baseSlug}-${id.slice(-8)}` : baseSlug
}

// GET - List businesses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Filters
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'ACTIVE'
    const featured = searchParams.get('featured') === 'true'
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    
    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (category) {
      where.category = category
    }
    
    if (minPrice || maxPrice) {
      where.askingPrice = {}
      if (minPrice) where.askingPrice.gte = parseFloat(minPrice)
      if (maxPrice) where.askingPrice.lte = parseFloat(maxPrice)
    }
    
    if (location) {
      where.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
        { location: { contains: location, mode: 'insensitive' } }
      ]
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (featured) {
      where.featured = true
    }
    
    // Execute query
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true
            }
          }
        }
      }),
      prisma.business.count({ where })
    ])
    
    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get businesses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

// POST - Create new business listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = createBusinessSchema.parse(body)
    
    // Convert string values to appropriate types
    const businessData: any = {
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      listingType: validatedData.listingType,
      
      // Location
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zipCode: validatedData.zipCode,
      location: [validatedData.city, validatedData.state].filter(Boolean).join(', '),
      
      // Contact
      website: validatedData.website || null,
      phone: validatedData.phone,
      email: validatedData.email || null,
      
      // Financial information
      askingPrice: convertToDecimal(validatedData.askingPrice),
      revenue: convertToDecimal(validatedData.revenue),
      profit: convertToDecimal(validatedData.profit),
      cashFlow: convertToDecimal(validatedData.cashFlow),
      ebitda: convertToDecimal(validatedData.ebitda),
      grossMargin: convertToFloat(validatedData.grossMargin),
      netMargin: convertToFloat(validatedData.netMargin),
      monthlyRevenue: convertToDecimal(validatedData.monthlyRevenue),
      yearlyGrowth: convertToFloat(validatedData.yearlyGrowth),
      
      // Business details
      established: validatedData.established ? new Date(parseInt(validatedData.established), 0) : null,
      employees: convertToInt(validatedData.employees),
      customerBase: convertToInt(validatedData.customerBase),
      
      // Assets
      inventory: convertToDecimal(validatedData.inventory),
      equipment: convertToDecimal(validatedData.equipment),
      realEstate: convertToDecimal(validatedData.realEstate),
      totalAssets: convertToDecimal(validatedData.totalAssets),
      liabilities: convertToDecimal(validatedData.liabilities),
      
      // Operations
      hoursOfOperation: validatedData.hoursOfOperation,
      daysOpen: validatedData.daysOpen,
      seasonality: validatedData.seasonality,
      competition: validatedData.competition,
      
      // Sale details
      reasonForSelling: validatedData.reasonForSelling,
      timeframe: validatedData.timeframe,
      negotiations: validatedData.negotiations,
      financing: validatedData.financing,
      
      // Status
      status: validatedData.status,
      
      // Images (URLs)
      images: validatedData.images.map((img: any) => img.url || img),
      
      // Owner
      ownerId: session.user.id
    }
    
    // Create business
    const business = await prisma.business.create({
      data: businessData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true
          }
        }
      }
    })
    
    // Generate and update slug
    const slug = generateSlug(business.title, business.id)
    await prisma.business.update({
      where: { id: business.id },
      data: { slug }
    })
    
    // Handle images if provided
    if (validatedData.images.length > 0) {
      const imageData = validatedData.images.map((img: any, index: number) => ({
        businessId: business.id,
        url: img.url || img,
        thumbnailUrl: img.thumbnailUrl,
        alt: `Business image ${index + 1}`,
        isPrimary: index === 0,
        orderIndex: index,
        originalName: img.originalName,
        size: img.size,
        width: img.width,
        height: img.height,
        format: img.format
      }))
      
      await prisma.businessImage.createMany({
        data: imageData
      })
    }
    
    return NextResponse.json({
      ...business,
      slug
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create business error:', error)
    return NextResponse.json(
      { error: 'Failed to create business listing' },
      { status: 500 }
    )
  }
}