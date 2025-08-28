import { v4 as uuidv4 } from 'uuid'

export interface UploadOptions {
  folder?: string
  filename?: string
  resize?: {
    width: number
    height: number
  }
  quality?: number
  format?: 'jpg' | 'png' | 'webp' | 'auto'
}

export interface UploadResult {
  url: string
  thumbnailUrl?: string
  publicId: string
  width?: number
  height?: number
  format?: string
  size: number
}

export interface StorageProvider {
  upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult>
  delete(publicId: string): Promise<void>
  generateThumbnail(url: string, width: number, height: number): string
}

// Cloudinary implementation
class CloudinaryProvider implements StorageProvider {
  private cloudName: string
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    this.apiKey = process.env.CLOUDINARY_API_KEY!
    this.apiSecret = process.env.CLOUDINARY_API_SECRET!

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary credentials not configured')
    }
  }

  async upload(
    file: File | Buffer,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const cloudinary = await import('cloudinary').then(m => m.v2)

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    })

    const buffer = file instanceof File ? await file.arrayBuffer() : file
    const filename = options?.filename || uuidv4()

    const uploadOptions: any = {
      public_id: filename,
      folder: options?.folder || 'goodbuy-hq',
      resource_type: 'auto',
      transformation: [],
    }

    if (options?.resize) {
      uploadOptions.transformation.push({
        width: options.resize.width,
        height: options.resize.height,
        crop: 'fill',
      })
    }

    if (options?.quality) {
      uploadOptions.transformation.push({
        quality: options.quality,
      })
    }

    if (options?.format && options.format !== 'auto') {
      uploadOptions.format = options.format
    }

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`,
      uploadOptions
    )

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    })

    return {
      url: result.secure_url,
      thumbnailUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    }
  }

  async delete(publicId: string): Promise<void> {
    const cloudinary = await import('cloudinary').then(m => m.v2)

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    })

    await cloudinary.uploader.destroy(publicId)
  }

  generateThumbnail(url: string, width: number, height: number): string {
    // Extract public_id from Cloudinary URL
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    if (!match) return url

    const cloudinary = require('cloudinary').v2
    return cloudinary.url(match[1], {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    })
  }
}

// AWS S3 implementation
class S3Provider implements StorageProvider {
  private bucketName: string
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!
    this.region = process.env.AWS_REGION || 'us-east-1'
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID!
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!

    if (!this.bucketName || !this.accessKeyId || !this.secretAccessKey) {
      throw new Error('AWS S3 credentials not configured')
    }
  }

  async upload(
    file: File | Buffer,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

    const s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    })

    const buffer =
      file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    const filename = options?.filename || uuidv4()
    const folder = options?.folder || 'goodbuy-hq'
    const key = `${folder}/${filename}`

    // For S3, we'd need additional image processing (using Sharp)
    let processedBuffer = buffer
    let metadata = { width: 0, height: 0, format: 'jpeg', size: buffer.length }

    if (options?.resize || options?.quality || options?.format) {
      const sharp = await import('sharp')
      let pipeline = sharp.default(buffer)

      if (options?.resize) {
        pipeline = pipeline.resize(
          options.resize.width,
          options.resize.height,
          {
            fit: 'cover',
          }
        )
      }

      if (options?.quality) {
        pipeline = pipeline.jpeg({ quality: options.quality })
      }

      if (options?.format && options.format !== 'auto') {
        switch (options.format) {
          case 'jpg':
            pipeline = pipeline.jpeg()
            break
          case 'png':
            pipeline = pipeline.png()
            break
          case 'webp':
            pipeline = pipeline.webp()
            break
        }
      }

      const info = await pipeline.toBuffer({ resolveWithObject: true })
      processedBuffer = info.data
      metadata = {
        width: info.info.width,
        height: info.info.height,
        format: info.info.format,
        size: info.info.size,
      }
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: file instanceof File ? file.type : 'image/jpeg',
    })

    await s3Client.send(command)

    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`

    // Generate thumbnail (would require separate upload in real implementation)
    const thumbnailUrl = url // Simplified for now

    return {
      url,
      thumbnailUrl,
      publicId: key,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    }
  }

  async delete(publicId: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

    const s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    })

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: publicId,
    })

    await s3Client.send(command)
  }

  generateThumbnail(url: string, width: number, height: number): string {
    // For S3, you'd typically use a CDN like CloudFront with Lambda@Edge for resizing
    // For now, return the original URL
    return url
  }
}

// Local storage implementation (for development)
class LocalProvider implements StorageProvider {
  private uploadDir: string

  constructor() {
    this.uploadDir = process.env.LOCAL_UPLOAD_DIR || './public/uploads'
  }

  async upload(
    file: File | Buffer,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const fs = await import('fs/promises')
    const path = await import('path')

    const buffer =
      file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    const filename = options?.filename || uuidv4()
    const folder = options?.folder || 'goodbuy-hq'
    const ext = 'jpg'
    const relativePath = `${folder}/${filename}.${ext}`
    const fullPath = path.join(this.uploadDir, relativePath)

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })

    // Process image if needed
    let processedBuffer = buffer
    let metadata = { width: 0, height: 0, format: 'jpeg', size: buffer.length }

    if (options?.resize || options?.quality || options?.format) {
      try {
        const sharp = await import('sharp')
        let pipeline = sharp.default(buffer)

        if (options?.resize) {
          pipeline = pipeline.resize(
            options.resize.width,
            options.resize.height,
            {
              fit: 'cover',
            }
          )
        }

        if (options?.quality) {
          pipeline = pipeline.jpeg({ quality: options.quality })
        }

        const info = await pipeline.toBuffer({ resolveWithObject: true })
        processedBuffer = info.data
        metadata = {
          width: info.info.width,
          height: info.info.height,
          format: info.info.format,
          size: info.info.size,
        }
      } catch (error) {
        console.warn('Sharp not available, using original image:', error)
      }
    }

    await fs.writeFile(fullPath, processedBuffer)

    const url = `/uploads/${relativePath}`
    const thumbnailUrl = `/uploads/${folder}/${filename}_thumb.${ext}`

    // Generate thumbnail
    try {
      const sharp = await import('sharp')
      const thumbnailBuffer = await sharp
        .default(processedBuffer)
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()

      await fs.writeFile(
        path.join(this.uploadDir, `${folder}/${filename}_thumb.${ext}`),
        thumbnailBuffer
      )
    } catch (error) {
      console.warn('Could not generate thumbnail:', error)
    }

    return {
      url,
      thumbnailUrl,
      publicId: relativePath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    }
  }

  async delete(publicId: string): Promise<void> {
    const fs = await import('fs/promises')
    const path = await import('path')

    const fullPath = path.join(this.uploadDir, publicId)

    try {
      await fs.unlink(fullPath)

      // Also try to delete thumbnail
      const thumbPath = fullPath.replace(/\.(jpg|png|webp)$/, '_thumb.$1')
      await fs.unlink(thumbPath).catch(() => {}) // Ignore if doesn't exist
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  generateThumbnail(url: string, width: number, height: number): string {
    // For local storage, return thumbnail URL
    return url.replace(/\.(jpg|png|webp)$/, '_thumb.$1')
  }
}

// Storage service factory
export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local'

  switch (provider) {
    case 'cloudinary':
      return new CloudinaryProvider()
    case 's3':
      return new S3Provider()
    case 'local':
    default:
      return new LocalProvider()
  }
}

// Default storage instance
export const storage = createStorageProvider()
