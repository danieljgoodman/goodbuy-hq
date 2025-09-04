import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { ToolCard, AIToolCard } from '@/components/ai/dashboard/tool-card'
import { Brain } from 'lucide-react'
import { SubscriptionTier } from '@prisma/client'

// Mock the hook
jest.mock('@/hooks/useFeatureAccess')

const mockUseFeatureAccess = useFeatureAccess as jest.MockedFunction<
  typeof useFeatureAccess
>

const mockTool: AIToolCard = {
  id: 'test-tool',
  title: 'Test AI Tool',
  description: 'A test AI analysis tool',
  icon: Brain,
  href: '/ai-tools/test',
  analysisType: 'health',
  subscriptionRequired: SubscriptionTier.PROFESSIONAL,
  usageCount: 3,
  usageLimit: 10,
  lastUsed: new Date('2025-01-01'),
}

describe('ToolCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders tool information correctly', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    render(<ToolCard tool={mockTool} />)

    expect(screen.getByText('Test AI Tool')).toBeInTheDocument()
    expect(screen.getByText('A test AI analysis tool')).toBeInTheDocument()
  })

  it('shows usage statistics when user has access', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    render(<ToolCard tool={mockTool} />)

    expect(screen.getByText('Usage this month')).toBeInTheDocument()
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
    expect(screen.getByText(/Last used:/)).toBeInTheDocument()
  })

  it('shows Open Tool button when user has access', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    render(<ToolCard tool={mockTool} />)

    const openButton = screen.getByText('Open Tool')
    expect(openButton).toBeInTheDocument()
    expect(openButton.closest('a')).toHaveAttribute('href', '/ai-tools/test')
  })

  it('shows upgrade prompt when user lacks access', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.FREE,
      hasAccess: jest.fn(() => false),
      canUseFeature: jest.fn(() => false),
      isSubscribed: false,
      isProfessional: false,
      isEnterprise: false,
    })

    render(<ToolCard tool={mockTool} />)

    expect(screen.getByText('Upgrade to Access')).toBeInTheDocument()
    expect(screen.getByText('PROFESSIONAL')).toBeInTheDocument()
  })

  it('handles click on upgrade button', () => {
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' }

    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.FREE,
      hasAccess: jest.fn(() => false),
      canUseFeature: jest.fn(() => false),
      isSubscribed: false,
      isProfessional: false,
      isEnterprise: false,
    })

    render(<ToolCard tool={mockTool} />)

    const upgradeButton = screen.getByText('Upgrade to Access')
    fireEvent.click(upgradeButton)

    expect(window.location.href).toBe(
      '/ai-tools/subscription?upgrade=PROFESSIONAL'
    )

    window.location = originalLocation
  })

  it('calculates usage percentage correctly', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    const toolAtLimit = {
      ...mockTool,
      usageCount: 10,
      usageLimit: 10,
    }

    render(<ToolCard tool={toolAtLimit} />)

    expect(screen.getByText('10 / 10')).toBeInTheDocument()
  })

  it('formats last used date correctly', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    const recentTool = {
      ...mockTool,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    }

    render(<ToolCard tool={recentTool} />)

    expect(screen.getByText(/Last used: 2h ago/)).toBeInTheDocument()
  })

  it('handles tool without usage data', () => {
    mockUseFeatureAccess.mockReturnValue({
      userTier: SubscriptionTier.PROFESSIONAL,
      hasAccess: jest.fn(() => true),
      canUseFeature: jest.fn(() => true),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    const toolWithoutUsage = {
      ...mockTool,
      usageCount: undefined,
      usageLimit: undefined,
      lastUsed: undefined,
    }

    render(<ToolCard tool={toolWithoutUsage} />)

    expect(screen.queryByText('Usage this month')).not.toBeInTheDocument()
    expect(screen.getByText('Open Tool')).toBeInTheDocument()
  })
})
