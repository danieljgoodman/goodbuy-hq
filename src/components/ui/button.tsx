'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-md',
      },
      size: {
        xs: 'h-8 px-2 text-xs min-w-[44px]', // Ensures 44px minimum touch target
        sm: 'h-9 px-3 min-w-[44px]', // Ensures 44px minimum touch target
        default: 'h-11 px-4 py-2 min-w-[44px]', // Increased from h-10 to h-11 for better touch targets
        lg: 'h-12 px-8 min-w-[44px]', // Increased from h-11 to h-12
        xl: 'h-14 px-10 text-base min-w-[44px]', // New XL size for hero CTAs
        icon: 'h-11 w-11', // Increased from h-10 w-10 to meet 44px requirement
        'icon-sm': 'h-9 w-9 min-w-[44px]', // For smaller icon buttons
      },
      touchTarget: {
        true: 'min-h-[44px] min-w-[44px]', // Explicit touch target optimization
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  touchTarget?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      touchTarget,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, touchTarget, className })
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
