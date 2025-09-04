import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { AIToolsDashboard } from '@/components/ai/dashboard/ai-tools-dashboard'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

// Mock the hooks
jest.mock('next-auth/react')
jest.mock('@/hooks/useFeatureAccess')

// Mock fetch for API calls
global.fetch = jest.fn()

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseFeatureAccess = useFeatureAccess as jest.MockedFunction<
  typeof useFeatureAccess
>

describe('AIToolsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock default session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          subscriptionTier: 'FREE',
        },
      },
      status: 'authenticated',
    } as any)

    // Mock default feature access
    mockUseFeatureAccess.mockReturnValue({
      userTier: 'FREE' as any,
      hasAccess: jest.fn(tier => tier === 'FREE'),
      canUseFeature: jest.fn(tier => tier === 'FREE'),
      isSubscribed: false,
      isProfessional: false,
      isEnterprise: false,
    })

    // Mock successful API responses
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // Recent analyses
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          aiAnalyses: { used: 3, limit: 5 },
          portfolioSize: { used: 1, limit: 1 },
          reportGeneration: { used: 0, limit: 2 },
          resetDate: new Date().toISOString(),
        }),
      })
  })

  it('renders dashboard with AI tool cards', async () => {
    render(<AIToolsDashboard userId="user-1" />)

    expect(screen.getByText('Available AI Tools')).toBeInTheDocument()
    expect(screen.getByText('Business Health Analysis')).toBeInTheDocument()
    expect(screen.getByText('Classic Analysis')).toBeInTheDocument()
  })

  it('shows upgrade prompts for professional features when on free tier', () => {
    render(<AIToolsDashboard userId="user-1" />)

    expect(screen.getByText('AI Business Valuation')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument()

    // Should show upgrade buttons for premium features
    const upgradeButtons = screen.getAllByText('Upgrade to Access')
    expect(upgradeButtons.length).toBeGreaterThan(0)
  })

  it('allows access to professional features for professional tier users', () => {
    // Mock professional tier access
    mockUseFeatureAccess.mockReturnValue({
      userTier: 'PROFESSIONAL' as any,
      hasAccess: jest.fn(tier => ['FREE', 'PROFESSIONAL'].includes(tier)),
      canUseFeature: jest.fn(tier => ['FREE', 'PROFESSIONAL'].includes(tier)),
      isSubscribed: true,
      isProfessional: true,
      isEnterprise: false,
    })

    render(<AIToolsDashboard userId="user-1" />)

    // Should show "Open Tool" buttons for professional features
    const openToolButtons = screen.getAllByText('Open Tool')
    expect(openToolButtons.length).toBeGreaterThan(4) // Should have more than just free tier tools
  })

  it('renders recent analyses section', async () => {
    render(<AIToolsDashboard userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Recent Analyses')).toBeInTheDocument()
    })
  })

  it('renders usage tracker section', async () => {
    render(<AIToolsDashboard userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Usage & Limits')).toBeInTheDocument()
    })
  })

  it('displays quick actions section', () => {
    render(<AIToolsDashboard userId="user-1" />)

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Run Health Analysis')).toBeInTheDocument()
    expect(screen.getByText('Manage Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
  })

  it('handles missing userId gracefully', () => {
    render(<AIToolsDashboard />)

    expect(screen.getByText('Available AI Tools')).toBeInTheDocument()
  })
})
