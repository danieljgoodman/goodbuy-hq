import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  Download,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SUPPORTED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  SupportedMimeType,
} from '@/types/upload'

export interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  onFileRemove?: (file: File) => void
  acceptedFiles?: File[]
  maxFiles?: number
  disabled?: boolean
  className?: string
  showPreview?: boolean
  allowMultiple?: boolean
}

interface FilePreview {
  file: File
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  progress?: number
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  onFileRemove,
  acceptedFiles = [],
  maxFiles = 5,
  disabled = false,
  className,
  showPreview = true,
  allowMultiple = true,
}) => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
        return {
          valid: false,
          error: `Unsupported file type. Please use: ${Object.values(SUPPORTED_FILE_TYPES).join(', ')}`,
        }
      }

      // Check file size
      if (file.size > FILE_SIZE_LIMITS.max) {
        const maxMB = Math.round(FILE_SIZE_LIMITS.max / (1024 * 1024))
        return {
          valid: false,
          error: `File too large. Maximum size is ${maxMB}MB`,
        }
      }

      // Check if file already exists
      if (
        acceptedFiles.some(f => f.name === file.name && f.size === file.size)
      ) {
        return {
          valid: false,
          error: 'File already added',
        }
      }

      return { valid: true }
    },
    [acceptedFiles]
  )

  const processFiles = useCallback(
    (files: File[]) => {
      const validFiles: File[] = []
      const newPreviews: FilePreview[] = []

      files.forEach(file => {
        const validation = validateFile(file)

        if (validation.valid) {
          validFiles.push(file)
          newPreviews.push({
            file,
            status: 'pending',
          })
        } else {
          newPreviews.push({
            file,
            status: 'error',
            error: validation.error,
          })
        }
      })

      // Update previews
      if (showPreview) {
        setFilePreviews(prev => [...prev, ...newPreviews])
      }

      // Notify parent of valid files
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    },
    [validateFile, onFilesSelected, showPreview]
  )

  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      if (disabled) return

      // Limit number of files
      const remainingSlots = maxFiles - acceptedFiles.length
      const filesToProcess = allowMultiple
        ? droppedFiles.slice(0, remainingSlots)
        : droppedFiles.slice(0, 1)

      processFiles(filesToProcess)
    },
    [processFiles, maxFiles, acceptedFiles.length, disabled, allowMultiple]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(SUPPORTED_FILE_TYPES).reduce(
      (acc, type) => {
        acc[type as SupportedMimeType] = [
          SUPPORTED_FILE_TYPES[type as SupportedMimeType],
        ]
        return acc
      },
      {} as Record<SupportedMimeType, string[]>
    ),
    disabled,
    multiple: allowMultiple,
    maxFiles,
  })

  const handleFileRemove = useCallback(
    (fileToRemove: File) => {
      if (onFileRemove) {
        onFileRemove(fileToRemove)
      }

      if (showPreview) {
        setFilePreviews(prev => prev.filter(fp => fp.file !== fileToRemove))
      }
    },
    [onFileRemove, showPreview]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (
      file.type.includes('spreadsheet') ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      return <FileSpreadsheet className="w-8 h-8 text-green-600" />
    }
    return <FileText className="w-8 h-8 text-blue-600" />
  }

  const downloadTemplate = () => {
    // Create CSV template with common business data columns
    const headers = [
      'Business Name',
      'Description',
      'Category',
      'Annual Revenue',
      'Net Profit',
      'Asking Price',
      'Employees',
      'Year Established',
      'City',
      'State',
      'Website',
      'Phone',
      'Email',
    ]

    const csvContent = headers.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'business-data-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const canAddMore = acceptedFiles.length < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : canAddMore && !disabled
              ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed',
          disabled && 'opacity-50'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        <div className="space-y-4">
          <Upload
            className={cn(
              'mx-auto w-12 h-12',
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            )}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragActive
                ? 'Drop files here...'
                : canAddMore && !disabled
                  ? 'Upload Business Data'
                  : disabled
                    ? 'Upload Disabled'
                    : 'Maximum Files Reached'}
            </h3>

            {canAddMore && !disabled && (
              <p className="text-sm text-gray-600">
                Drag and drop CSV or Excel files here, or{' '}
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  click to browse
                </span>
              </p>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Supported formats:{' '}
                {Object.values(SUPPORTED_FILE_TYPES).join(', ')}
              </p>
              <p>
                Maximum size: {Math.round(FILE_SIZE_LIMITS.max / (1024 * 1024))}
                MB per file
              </p>
              {allowMultiple && <p>Maximum files: {maxFiles}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Need a template?
            </p>
            <p className="text-xs text-blue-700">
              Download our CSV template with the correct column headers
            </p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-1" />
          Template
        </button>
      </div>

      {/* File Previews */}
      {showPreview && (filePreviews.length > 0 || acceptedFiles.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Files ({acceptedFiles.length + filePreviews.length})
          </h4>

          <div className="space-y-2">
            {/* Accepted Files */}
            {acceptedFiles.map((file, index) => (
              <div
                key={`accepted-${index}`}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <button
                    onClick={() => handleFileRemove(file)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Preview Files */}
            {filePreviews.map((preview, index) => (
              <div
                key={`preview-${index}`}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(preview.file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(preview.file.size)}
                    </p>
                    {preview.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {preview.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {preview.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : preview.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  )}

                  <button
                    onClick={() => handleFileRemove(preview.file)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
