import React from 'react'
import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth/next'
import AIToolsDashboardPage from '@/app/ai-tools/dashboard/page'

// Mock the server-side session
jest.mock('next-auth/next')
jest.mock('@/components/ai/dashboard/ai-tools-dashboard')

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>

// Mock the dashboard component
const MockAIToolsDashboard = jest.fn(({ userId }) => (
  <div data-testid="ai-tools-dashboard">
    Mock AI Tools Dashboard - User: {userId}
  </div>
))

require('@/components/ai/dashboard/ai-tools-dashboard').AIToolsDashboard =
  MockAIToolsDashboard

describe('AI Tools Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dashboard page with proper metadata', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    } as any)

    const DashboardPage = await AIToolsDashboardPage()

    render(DashboardPage)

    expect(screen.getByText('AI Tools Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Access advanced AI features while maintaining familiarity/
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId('ai-tools-dashboard')).toBeInTheDocument()
    expect(MockAIToolsDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
      }),
      expect.anything()
    )
  })

  it('passes the correct user ID to the dashboard component', async () => {
    const testUserId = 'test-user-456'
    mockGetServerSession.mockResolvedValue({
      user: {
        id: testUserId,
        email: 'testuser@example.com',
      },
    } as any)

    const DashboardPage = await AIToolsDashboardPage()

    render(DashboardPage)

    expect(MockAIToolsDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
      }),
      expect.anything()
    )
  })

  it('renders with proper container classes', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    } as any)

    const DashboardPage = await AIToolsDashboardPage()

    render(DashboardPage)

    const container = screen.getByText('AI Tools Dashboard').closest('div')
    expect(container).toHaveClass('container', 'mx-auto', 'py-6', 'px-4')
  })
})
