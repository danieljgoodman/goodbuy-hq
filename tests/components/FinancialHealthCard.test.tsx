import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialHealthCard from '@/components/business-analysis/FinancialHealthCard';

const mockMetrics = [
  {
    label: 'Revenue',
    value: '$2.5M',
    change: 12.5,
    trend: 'up' as const
  },
  {
    label: 'Profit Margin',
    value: '18.2%',
    change: -2.1,
    trend: 'down' as const
  },
  {
    label: 'Cash Flow',
    value: '$450K',
    change: 0,
    trend: 'stable' as const
  }
];

describe('FinancialHealthCard', () => {
  it('renders financial health card with title', () => {
    render(<FinancialHealthCard metrics={mockMetrics} />);
    
    expect(screen.getByText('Financial Health Overview')).toBeInTheDocument();
    expect(screen.getByText('Last Quarter')).toBeInTheDocument();
  });

  it('displays all financial metrics', () => {
    render(<FinancialHealthCard metrics={mockMetrics} />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$2.5M')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    
    expect(screen.getByText('Profit Margin')).toBeInTheDocument();
    expect(screen.getByText('18.2%')).toBeInTheDocument();
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
    
    expect(screen.getByText('Cash Flow')).toBeInTheDocument();
    expect(screen.getByText('$450K')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<FinancialHealthCard metrics={mockMetrics} />);
    
    const card = screen.getByRole('region', { name: /financial health metrics overview/i });
    expect(card).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FinancialHealthCard metrics={mockMetrics} className="custom-class" />);
    
    const card = screen.getByRole('region');
    expect(card).toHaveClass('custom-class');
  });

  it('shows updated date badge', () => {
    render(<FinancialHealthCard metrics={mockMetrics} />);
    
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });
});