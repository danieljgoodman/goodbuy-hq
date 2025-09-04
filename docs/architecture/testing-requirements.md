# Testing Requirements

Based on your existing Jest testing framework and established patterns, I'm defining testing strategies that ensure AI algorithm accuracy, real-time streaming reliability, and subscription feature integrity while maintaining existing test coverage and quality standards.

## Component Test Template

```typescript
// /tests/components/ai/analysis/ai-health-score-ring.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AIHealthScoreRing } from '@/components/ai/analysis/ai-health-score-ring'
import { ThemeProvider } from '@/components/theme-provider'

// Mock data following existing patterns
const mockHealthScore = {
  overall: 85,
  financial: 90,
  growth: 80,
  operational: 85,
  saleReadiness: 88,
  confidence: 92,
  trajectory: 'improving' as const,
  lastUpdated: new Date('2025-01-03'),
}

// Test wrapper maintaining existing theme provider patterns
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    {children}
  </ThemeProvider>
)

describe('AIHealthScoreRing', () => {
  beforeEach(() => {
    // Reset any global state between tests
    jest.clearAllMocks()
  })

  it('renders health score with correct percentage', () => {
    render(
      <AIHealthScoreRing
        score={mockHealthScore.overall}
        confidence={mockHealthScore.confidence}
        size="lg"
      />,
      { wrapper: TestWrapper }
    )

    // Test score display
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText(/85%/)).toBeInTheDocument()

    // Test confidence indicator
    expect(screen.getByText(/92% confidence/)).toBeInTheDocument()
  })

  it('applies correct health score color based on value', () => {
    const { rerender } = render(
      <AIHealthScoreRing score={85} confidence={90} size="md" />,
      { wrapper: TestWrapper }
    )

    // Test excellent score (80-100) - green
    const ring = screen.getByRole('img', { name: /health score ring/i })
    expect(ring).toHaveClass('health-excellent')

    // Test good score (60-79) - blue
    rerender(<AIHealthScoreRing score={70} confidence={85} size="md" />)
    expect(ring).toHaveClass('health-good')

    // Test fair score (40-59) - amber
    rerender(<AIHealthScoreRing score={50} confidence={75} size="md" />)
    expect(ring).toHaveClass('health-fair')

    // Test poor score (0-39) - red
    rerender(<AIHealthScoreRing score={30} confidence={65} size="md" />)
    expect(ring).toHaveClass('health-poor')
  })

  it('handles accessibility requirements', () => {
    render(
      <AIHealthScoreRing
        score={85}
        confidence={92}
        size="md"
        aria-label="Business health score: 85 out of 100"
      />,
      { wrapper: TestWrapper }
    )

    // Test ARIA attributes
    const ring = screen.getByRole('img')
    expect(ring).toHaveAttribute('aria-label', 'Business health score: 85 out of 100')

    // Test screen reader content
    expect(screen.getByText(/85 out of 100/)).toBeInTheDocument()
  })
})
```

## Testing Best Practices

1. **Unit Tests**: Test individual AI analysis components in isolation with comprehensive edge case coverage
2. **Integration Tests**: Test component interactions, API integration, and WebSocket streaming workflows
3. **E2E Tests**: Test critical user flows including analysis workflow, subscription management, and report generation
4. **Coverage Goals**: Maintain 90%+ code coverage with special focus on financial calculation accuracy
5. **Test Structure**: Follow Arrange-Act-Assert pattern with clear test descriptions and proper mocking
6. **Mock External Dependencies**: Mock API calls, WebSocket connections, and authentication for reliable testing

---
