// Mock implementations for ShadCN UI components used in testing
import React from 'react'

// Mock Radix UI components
jest.mock('@radix-ui/react-avatar', () => ({
  Root: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="avatar-root" {...props}>
      {children}
    </div>
  ),
  Image: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="avatar-image" {...props} />
  ),
  Fallback: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="select-root" data-value={value} {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, className, ...props }: any) => (
    <button className={className} data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  Value: ({ placeholder, children, ...props }: any) => (
    <span data-testid="select-value" {...props}>
      {children || placeholder}
    </span>
  ),
  Content: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, value, className, onSelect, ...props }: any) => (
    <div 
      className={className} 
      data-testid="select-item" 
      data-value={value}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  ),
  Viewport: ({ children, ...props }: any) => (
    <div data-testid="select-viewport" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, value, onValueChange, defaultValue, className, ...props }: any) => (
    <div 
      className={className}
      data-testid="tabs-root" 
      data-value={value || defaultValue}
      {...props}
    >
      {children}
    </div>
  ),
  List: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="tabs-list" role="tablist" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, value, className, ...props }: any) => (
    <button 
      className={className}
      data-testid="tabs-trigger" 
      data-value={value}
      role="tab"
      {...props}
    >
      {children}
    </button>
  ),
  Content: ({ children, value, className, ...props }: any) => (
    <div 
      className={className}
      data-testid="tabs-content" 
      data-value={value}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  ),
}))

jest.mock('@radix-ui/react-progress', () => ({
  Root: ({ value, max = 100, className, ...props }: any) => (
    <div 
      className={className}
      data-testid="progress-root"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax={max}
      aria-valuenow={value}
      {...props}
    />
  ),
  Indicator: ({ className, style, ...props }: any) => (
    <div 
      className={className}
      data-testid="progress-indicator"
      style={style}
      {...props}
    />
  ),
}))

jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => {
    if (typeof children === 'function') {
      return children(props)
    }
    return <div data-testid="slot" {...props}>{children}</div>
  },
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  const icons: Record<string, any> = {}
  
  // Common icons used in the app
  const iconNames = [
    'User', 'Mail', 'Phone', 'Building', 'Settings', 'BarChart3', 'Users',
    'Plus', 'Search', 'Filter', 'Download', 'Save', 'TrendingUp', 'AlertTriangle',
    'CheckCircle', 'DollarSign', 'PieChart', 'Target', 'Brain', 'ChevronDown',
    'Eye', 'EyeOff', 'Loader2', 'X', 'Check', 'ArrowRight', 'ArrowLeft',
    'Home', 'Menu', 'Calendar', 'Star', 'Heart', 'Share', 'Edit', 'Trash2',
  ]
  
  iconNames.forEach(name => {
    icons[name] = ({ className, size, ...props }: any) => (
      <svg 
        className={className}
        width={size}
        height={size}
        data-testid={`icon-${name.toLowerCase()}`}
        {...props}
      >
        <title>{name} Icon</title>
      </svg>
    )
  })
  
  return icons
})

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: any) => children,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Chart: ({ data, options, type, ...props }: any) => (
    <div data-testid={`chart-${type}`} data-chart-data={JSON.stringify(data)} {...props}>
      Chart: {type}
    </div>
  ),
  Line: (props: any) => <div data-testid="line-chart" {...props}>Line Chart</div>,
  Bar: (props: any) => <div data-testid="bar-chart" {...props}>Bar Chart</div>,
  Pie: (props: any) => <div data-testid="pie-chart" {...props}>Pie Chart</div>,
  Doughnut: (props: any) => <div data-testid="doughnut-chart" {...props}>Doughnut Chart</div>,
}))

// Mock file upload utilities
global.File = class MockFile {
  constructor(public name: string, public type: string) {}
}

global.FileReader = class MockFileReader {
  result: any = null
  error: any = null
  readyState: number = 0
  
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  
  readAsDataURL(file: Blob): void {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,fake-base64-data'
      this.readyState = 2
      this.onload?.call(this, {} as any)
    }, 100)
  }
  
  readAsText(file: Blob): void {
    setTimeout(() => {
      this.result = 'fake file content'
      this.readyState = 2
      this.onload?.call(this, {} as any)
    }, 100)
  }
  
  abort(): void {
    this.readyState = 2
  }
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true }
}

export {}