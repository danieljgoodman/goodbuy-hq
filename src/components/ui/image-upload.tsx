'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface UploadedImage {
  url: string
  thumbnailUrl?: string
  publicId: string
  width?: number
  height?: number
  size: number
}

interface ImageUploadProps {
  onUpload: (images: UploadedImage[]) => void
  onRemove?: (publicId: string) => void
  maxImages?: number
  folder?: string
  resize?: { width: number; height: number }
  quality?: number
  existingImages?: UploadedImage[]
  disabled?: boolean
}

export default function ImageUpload({
  onUpload,
  onRemove,
  maxImages = 10,
  folder = 'businesses',
  resize,
  quality = 90,
  existingImages = [],
  disabled = false,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    const filesToUpload = fileArray.slice(0, remainingSlots)

    if (filesToUpload.length > 0) {
      uploadFiles(filesToUpload)
    }
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    const uploadedImages: UploadedImage[] = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('quality', quality.toString())

        if (resize) {
          formData.append('resize', JSON.stringify(resize))
        }

        const response = await fetch('/api/upload/images', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        uploadedImages.push(result)
      }

      const newImages = [...images, ...uploadedImages]
      setImages(newImages)
      onUpload(newImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (publicId: string) => {
    try {
      if (onRemove) {
        await onRemove(publicId)
      }

      // Also try to delete from server
      await fetch(
        `/api/upload/images?publicId=${encodeURIComponent(publicId)}`,
        {
          method: 'DELETE',
        }
      )

      const newImages = images.filter(img => img.publicId !== publicId)
      setImages(newImages)
      onUpload(newImages)
    } catch (error) {
      console.error('Remove error:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              dragOver
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-300 hover:border-secondary-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={e => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
              <p className="text-sm text-secondary-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-secondary-400 mb-2" />
              <p className="text-sm text-secondary-600 mb-1">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-secondary-500">
                PNG, JPG, WebP up to 10MB each ({maxImages - images.length}{' '}
                remaining)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.publicId} className="relative group">
              <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={() => handleRemove(image.publicId)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <ImageIcon className="w-3 h-3" />
                  <span>{formatFileSize(image.size)}</span>
                </div>
                {image.width && image.height && (
                  <div>
                    {image.width} × {image.height}
                  </div>
                )}
              </div>

              {/* Primary Image Indicator */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="text-center text-sm text-secondary-500">
          <p>Add up to {maxImages} high-quality images of your business.</p>
          <p>The first image will be used as the primary listing photo.</p>
        </div>
      )}
    </div>
  )
}
