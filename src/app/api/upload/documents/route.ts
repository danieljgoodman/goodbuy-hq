import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for documents
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'documents'
    const businessId = formData.get('businessId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Only PDF, Word, Excel, and text files are allowed.',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Create upload directory
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      folder,
      session.user.id
    )
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const fileId = uuidv4()
    const extension = file.name.split('.').pop()
    const filename = `${fileId}.${extension}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Generate URL
    const url = `/uploads/${folder}/${session.user.id}/${filename}`

    const result = {
      id: fileId,
      url,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const folder = searchParams.get('folder') || 'documents'

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 })
    }

    // Delete file (basic implementation - in production you'd want more security checks)
    const fs = await import('fs/promises')
    const path = await import('path')

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      folder,
      session.user.id
    )
    const files = await fs.readdir(uploadDir).catch(() => [])

    for (const file of files) {
      if (file.startsWith(fileId)) {
        await fs.unlink(path.join(uploadDir, file))
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed. Please try again.' },
      { status: 500 }
    )
  }
}
