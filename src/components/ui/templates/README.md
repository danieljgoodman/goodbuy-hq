# GoodBuy HQ Component Templates

Professional business component templates built with ShadCN UI, customized for the GoodBuy HQ business acquisition platform.

## Overview

This collection provides production-ready component templates that follow GoodBuy HQ's design system and business context. All templates are built with TypeScript, include comprehensive prop interfaces, JSDoc documentation, and implement accessibility best practices.

## Templates Available

### Business Components

#### 1. BusinessCard

Professional business listing card component for the marketplace.

**Features:**

- Multiple display variants (default, featured, compact, detailed)
- Financial metrics integration
- Action buttons for inquiries and favorites
- Loading states and error handling

```tsx
import { BusinessCard } from '@/components/ui/templates'
;<BusinessCard
  business={businessData}
  metrics={businessMetrics}
  variant="featured"
  showActions={true}
  showMetrics={true}
  onInquiry={() => handleInquiry(business.id)}
  onFavorite={() => toggleFavorite(business.id)}
/>
```

#### 2. EvaluationSummary

Comprehensive business evaluation display with valuation and risk assessment.

**Features:**

- Business valuation with confidence indicators
- Risk assessment with visual indicators
- Financial metrics dashboard
- Key insights and recommendations

```tsx
import { EvaluationSummary } from '@/components/ui/templates'
;<EvaluationSummary
  business={businessData}
  metrics={businessMetrics}
  valuation={valuationData}
  riskAssessment={riskData}
  insights={businessInsights}
  variant="detailed"
  showBreakdown={true}
/>
```

#### 3. DealCard

Business deal tracking card for the acquisition pipeline.

**Features:**

- Deal status tracking with visual indicators
- Progress visualization for pipeline management
- Priority levels with color coding
- Broker assignment and contact information

```tsx
import { DealCard } from '@/components/ui/templates'
;<DealCard
  deal={dealData}
  variant="pipeline"
  showActions={true}
  showProgress={true}
  onStatusChange={handleStatusChange}
  onViewDetails={() => navigateToDeal(deal.id)}
/>
```

### Form Components

#### 4. FormWrapper

Dynamic form generator with validation and professional styling.

**Features:**

- Dynamic field generation based on configuration
- Built-in validation with custom rules
- Multiple layout variants (default, compact, split, modal)
- Loading states and error handling

```tsx
import { FormWrapper, type FormField } from '@/components/ui/templates'

const businessFields: FormField[] = [
  {
    id: 'businessName',
    name: 'businessName',
    label: 'Business Name',
    type: 'text',
    required: true,
    validation: { required: true, minLength: 2 }
  },
  {
    id: 'industry',
    name: 'industry',
    label: 'Industry',
    type: 'select',
    options: industriesList,
    required: true
  }
]

<FormWrapper
  title="Business Registration"
  description="Enter your business information"
  fields={businessFields}
  onSubmit={handleBusinessSubmit}
  variant="split"
/>
```

### Data Components

#### 5. DataTable

Feature-rich data table with sorting, filtering, and pagination.

**Features:**

- Flexible column definitions with custom renderers
- Built-in sorting, searching, and filtering
- Pagination with configurable page sizes
- Row selection (single/multiple)

```tsx
import { DataTable, type TableColumn } from '@/components/ui/templates'

const businessColumns: TableColumn<BusinessData>[] = [
  {
    id: 'name',
    header: 'Business Name',
    accessor: 'businessName',
    sortable: true,
    searchable: true,
  },
  {
    id: 'industry',
    header: 'Industry',
    accessor: 'industry',
    cell: (value) => <Badge>{value}</Badge>
  },
  {
    id: 'revenue',
    header: 'Revenue',
    accessor: 'annualRevenue',
    align: 'right',
    cell: (value) => formatCurrency(value)
  }
]

<DataTable
  data={businesses}
  columns={businessColumns}
  title="Business Listings"
  sortable
  searchable
  paginated
  selectable
/>
```

### Navigation Components

#### 6. NavigationHeader

Professional site header with authentication and mobile support.

**Features:**

- Responsive design with mobile hamburger menu
- User authentication state management
- Notification indicators and badges
- Multi-level navigation with dropdowns

```tsx
import { NavigationHeader, type NavigationItem } from '@/components/ui/templates'

const navItems: NavigationItem[] = [
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingIcon
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    badge: 'Pro',
    children: [
      { id: 'overview', label: 'Overview', href: '/dashboard' },
      { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics' }
    ]
  }
]

<NavigationHeader
  brandName="GoodBuy HQ"
  navigationItems={navItems}
  user={currentUser}
  isAuthenticated={!!currentUser}
  showNotifications
  notificationCount={5}
/>
```

### Layout Components

#### 7. DashboardLayout

Complete dashboard layout with sidebar, stats, and content areas.

**Features:**

- Collapsible sidebar with nested navigation
- Dashboard statistics/metrics cards
- Breadcrumb navigation
- Quick action buttons

```tsx
import { DashboardLayout, type SidebarItem, type DashboardStat } from '@/components/ui/templates'

const sidebarItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard',
    icon: DashboardIcon,
    active: true
  },
  {
    id: 'businesses',
    label: 'Businesses',
    href: '/dashboard/businesses',
    icon: BuildingIcon,
    badge: 12
  }
]

const dashboardStats: DashboardStat[] = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$2.4M',
    change: { value: 12.5, label: 'vs last month', type: 'increase' }
  }
]

<DashboardLayout
  title="Business Dashboard"
  sidebarItems={sidebarItems}
  stats={dashboardStats}
  showStats
>
  <YourDashboardContent />
</DashboardLayout>
```

## Business Context

All templates are designed specifically for GoodBuy HQ's business acquisition platform:

- **Professional Aesthetics**: Clean, corporate styling suitable for B2B interactions
- **Business Metrics**: Built-in support for financial data, valuations, and business KPIs
- **Acquisition Workflow**: Components support the full business acquisition lifecycle
- **Role-Based Access**: Templates accommodate different user roles (buyers, sellers, brokers, admins)

## Design System Integration

Templates follow GoodBuy HQ's design system:

- **Color Palette**: Primary blue, success green, warning amber
- **Typography**: Inter font family for professional readability
- **Spacing**: Consistent 8px grid system
- **Border Radius**: Consistent rounding for modern appearance
- **Shadows**: Subtle elevation for depth and hierarchy

## Accessibility Features

All templates include:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant color combinations
- **Semantic HTML**: Proper HTML structure and semantics

## TypeScript Support

Every template includes:

- **Comprehensive Prop Interfaces**: Fully typed component props
- **Generic Support**: Type-safe data handling where applicable
- **JSDoc Comments**: Detailed documentation for IntelliSense
- **Strict Type Checking**: No implicit any types

## Contributing

When adding new templates:

1. Follow the existing naming convention
2. Include comprehensive TypeScript interfaces
3. Add JSDoc documentation with examples
4. Implement accessibility features
5. Update the template registry in `index.ts`
6. Add usage examples to this README

## File Structure

```
src/components/ui/templates/
├── index.ts                 # Template exports and registry
├── business-card.tsx        # Business listing card
├── evaluation-summary.tsx   # Business evaluation display
├── deal-card.tsx           # Deal tracking card
├── form-wrapper.tsx        # Dynamic form generator
├── data-table.tsx          # Feature-rich data table
├── navigation-header.tsx   # Site navigation header
├── dashboard-layout.tsx    # Dashboard layout framework
└── README.md              # This documentation
```

## Support

For questions or issues with these templates, please refer to:

- **Component Documentation**: JSDoc comments in each component file
- **Type Definitions**: TypeScript interfaces for all props
- **Usage Examples**: Code examples in this README and JSDoc comments
