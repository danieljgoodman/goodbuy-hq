import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

// Mock session for testing
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
}

// Custom render function that includes providers
interface AllTheProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

const AllTheProviders = ({
  children,
  session = mockSession,
}: AllTheProvidersProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    session?: Session | null
    wrapperProps?: AllTheProvidersProps
  }
) => {
  const { session, wrapperProps, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders session={session} {...wrapperProps}>
      {children}
    </AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Accessibility test utilities
export const axeRules = {
  // Common axe-core rules to test
  wcag2a: ['wcag2a'],
  wcag2aa: ['wcag2aa'],
  wcag21aa: ['wcag21aa'],
  bestPractice: ['best-practice'],
}

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'user-' + Math.random().toString(36).substring(2, 15),
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'buyer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockBusiness = (overrides = {}) => ({
  id: 'business-' + Math.random().toString(36).substring(2, 15),
  name: 'Test Business Inc.',
  industry: 'Technology',
  description: 'A test business for testing purposes',
  price: 1000000,
  revenue: 500000,
  employees: 25,
  location: 'San Francisco, CA',
  slug: 'test-business-inc',
  images: ['/placeholder-business.jpg'],
  verified: true,
  featured: false,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockValuationResult = (overrides = {}) => ({
  id: 'valuation-' + Math.random().toString(36).substring(2, 15),
  companyName: 'Test Company',
  overallValuation: 1200000,
  confidenceScore: 85,
  evaluationDate: new Date().toISOString(),
  methods: [
    {
      name: 'Discounted Cash Flow',
      value: 1300000,
      confidence: 80,
      description: 'DCF analysis based on projected cash flows',
    },
    {
      name: 'Market Multiple',
      value: 1100000,
      confidence: 90,
      description: 'Comparison with similar businesses in the market',
    },
  ],
  adjustmentFactors: {
    marketConditions: 1.05,
    businessRisk: 0.95,
    managementQuality: 1.1,
  },
  keyMetrics: {
    revenueGrowthRate: 15.5,
    profitMargin: 12.3,
    debtToEquityRatio: 0.4,
    returnOnAssets: 8.7,
  },
  recommendations: [
    'Consider expanding market reach to increase valuation',
    'Focus on improving profit margins through cost optimization',
  ],
  riskFactors: [
    'High dependency on single customer segment',
    'Limited geographical diversification',
  ],
  ...overrides,
})

// Screen size utilities for responsive testing
export const breakpoints = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  large: { width: 1440, height: 900 },
}

export const setViewport = (size: keyof typeof breakpoints) => {
  const { width, height } = breakpoints[size]

  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })

  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

// Form testing utilities
export const fillFormField = async (
  getByLabelText: any,
  label: string,
  value: string
) => {
  const field = getByLabelText(label)
  await userEvent.clear(field)
  await userEvent.type(field, value)
  return field
}

export const submitForm = async (getByRole: any, buttonText = 'Submit') => {
  const submitButton = getByRole('button', { name: buttonText })
  await userEvent.click(submitButton)
  return submitButton
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Component testing helpers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInDocument()
}

export const expectToHaveAccessibleName = (
  element: HTMLElement,
  name: string
) => {
  expect(element).toHaveAccessibleName(name)
}

export const expectToHaveRole = (element: HTMLElement, role: string) => {
  expect(element).toHaveRole(role)
}

// Re-export everything
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render }
