'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToastHistory } from '@/components/providers/toast-provider'
import { ToastHistoryItem } from '@/lib/toast'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Upload,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const getToastIcon = (type: ToastHistoryItem['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'progress':
      return <Upload className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getToastVariant = (
  type: ToastHistoryItem['type']
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'success':
      return 'default'
    default:
      return 'outline'
  }
}

interface ToastHistoryProps {
  className?: string
  maxItems?: number
  showClearButton?: boolean
}

export function ToastHistory({
  className,
  maxItems = 20,
  showClearButton = true,
}: ToastHistoryProps) {
  const { history, clearHistory, markAsRead } = useToastHistory()

  React.useEffect(() => {
    markAsRead()
  }, [markAsRead])

  const displayHistory = maxItems ? history.slice(0, maxItems) : history

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Clock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <h3 className="text-sm font-medium">Notification History</h3>
        {showClearButton && history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-3">
          <div className="space-y-2 pb-3">
            {displayHistory.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1">{getToastIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={getToastVariant(item.type)}
                          className="text-xs"
                        >
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(item.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    {item.undoAction && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.undoAction}
                        className="mt-2 h-6 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Undo
                      </Button>
                    )}
                  </div>
                </div>
                {index < displayHistory.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
