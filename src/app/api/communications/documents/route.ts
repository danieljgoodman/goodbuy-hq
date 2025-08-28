import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const uploadDocumentSchema = z.object({
  threadId: z.string().cuid().optional(),
  description: z.string().max(500).optional(),
  accessLevel: z.enum(['PUBLIC', 'PRIVATE', 'SHARED']).default('SHARED'),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
  maxDownloads: z.number().int().positive().optional(),
})

// GET /api/communications/documents - Get user's documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Base query - documents user uploaded or has access to
    const whereConditions: any = {
      OR: [
        { uploaderId: session.user.id },
        {
          accessLevel: 'PUBLIC',
        },
        {
          AND: [
            { accessLevel: 'SHARED' },
            {
              thread: {
                participants: {
                  some: {
                    userId: session.user.id,
                    isActive: true,
                  },
                },
              },
            },
          ],
        },
      ],
    }

    // Add filters
    if (threadId) {
      whereConditions.threadId = threadId
    }
    if (category) {
      whereConditions.category = category
    }

    // Exclude expired documents
    whereConditions.OR.push({
      expiresAt: {
        gte: new Date(),
      },
    })
    whereConditions.OR.push({
      expiresAt: null,
    })

    const documents = await prisma.sharedDocument.findMany({
      where: whereConditions,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        thread: {
          select: {
            id: true,
            subject: true,
          },
        },
        _count: {
          select: {
            accessLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Filter out sensitive information for non-owners
    const filteredDocuments = documents.map(doc => {
      const isOwner = doc.uploaderId === session.user.id
      return {
        ...doc,
        path: isOwner ? doc.path : undefined,
        encryptionKey: undefined, // Never expose encryption key
      }
    })

    return NextResponse.json(filteredDocuments)
  } catch (error) {
    console.error('Failed to get documents:', error)
    return NextResponse.json(
      { error: 'Failed to get documents' },
      { status: 500 }
    )
  }
}

// POST /api/communications/documents - Upload a document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadataJson = formData.get('metadata') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Parse metadata
    let metadata
    try {
      metadata = metadataJson ? JSON.parse(metadataJson) : {}
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid metadata format' },
        { status: 400 }
      )
    }

    const validatedData = uploadDocumentSchema.parse(metadata)

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // If threadId provided, verify user has access
    if (validatedData.threadId) {
      const participant = await prisma.threadParticipant.findUnique({
        where: {
          threadId_userId: {
            threadId: validatedData.threadId,
            userId: session.user.id,
          },
        },
      })

      if (!participant || !participant.isActive) {
        return NextResponse.json(
          { error: 'Thread not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `${crypto.randomUUID()}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create database record
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.sharedDocument.create({
        data: {
          threadId: validatedData.threadId,
          uploaderId: session.user.id,
          fileName,
          originalName: file.name,
          description: validatedData.description,
          mimeType: file.type,
          size: file.size,
          path: filePath,
          accessLevel: validatedData.accessLevel,
          category: validatedData.category,
          tags: validatedData.tags,
          expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
          maxDownloads: validatedData.maxDownloads,
          isScanned: false, // TODO: Implement virus scanning
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          thread: {
            select: {
              id: true,
              subject: true,
            },
          },
        },
      })

      // Create audit log entry
      await tx.communicationAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'document_uploaded',
          entityType: 'document',
          entityId: doc.id,
          details: {
            fileName: file.name,
            size: file.size,
            mimeType: file.type,
            threadId: validatedData.threadId,
          },
        },
      })

      return doc
    })

    // Remove sensitive path from response
    const { path: _, encryptionKey, ...safeDocument } = document
    return NextResponse.json(safeDocument, { status: 201 })
  } catch (error) {
    console.error('Failed to upload document:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}