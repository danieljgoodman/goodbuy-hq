/**
 * GoodBuy HQ Component Templates
 *
 * Professional business component templates built with ShadCN UI
 * Customized for business acquisition platform
 */

// Business Card Components
export { BusinessCard, type BusinessCardProps } from './business-card'

// Evaluation Summary Components
export {
  EvaluationSummary,
  type EvaluationSummaryProps,
  type ValuationData,
  type RiskAssessment,
} from './evaluation-summary'

// Deal Management Components
export {
  DealCard,
  type DealCardProps,
  type DealData,
  type DealStatus,
  type DealPriority,
} from './deal-card'

// Form Components
export {
  FormWrapper,
  type FormWrapperProps,
  type FormField,
  type FormData,
  type FormErrors,
  type FieldType,
  type ValidationRule,
} from './form-wrapper'

// Data Table Components
export {
  DataTable,
  type DataTableProps,
  type TableColumn,
  type SortConfig,
  type FilterConfig,
  type PaginationConfig,
  type SelectionConfig,
} from './data-table'

// Navigation Components
export {
  NavigationHeader,
  type NavigationHeaderProps,
  type NavigationItem,
  type UserProfile,
} from './navigation-header'

// Layout Components
export {
  DashboardLayout,
  type DashboardLayoutProps,
  type SidebarItem,
  type QuickAction,
  type BreadcrumbItem,
  type DashboardStat,
} from './dashboard-layout'

/**
 * Template Categories for Organization
 */
export const TEMPLATE_CATEGORIES = {
  BUSINESS: 'business',
  FORMS: 'forms',
  DATA: 'data',
  NAVIGATION: 'navigation',
  LAYOUT: 'layout',
} as const

/**
 * Template Registry for Dynamic Loading
 */
export const TEMPLATE_REGISTRY = {
  // Business Templates
  'business-card': {
    name: 'Business Card',
    description: 'Professional business listing card with metrics and actions',
    category: TEMPLATE_CATEGORIES.BUSINESS,
    component: 'BusinessCard',
  },
  'evaluation-summary': {
    name: 'Evaluation Summary',
    description:
      'Comprehensive business evaluation with valuation and risk assessment',
    category: TEMPLATE_CATEGORIES.BUSINESS,
    component: 'EvaluationSummary',
  },
  'deal-card': {
    name: 'Deal Card',
    description: 'Business deal tracking card for acquisition pipeline',
    category: TEMPLATE_CATEGORIES.BUSINESS,
    component: 'DealCard',
  },

  // Form Templates
  'form-wrapper': {
    name: 'Form Wrapper',
    description:
      'Dynamic form generator with validation and professional styling',
    category: TEMPLATE_CATEGORIES.FORMS,
    component: 'FormWrapper',
  },

  // Data Templates
  'data-table': {
    name: 'Data Table',
    description:
      'Feature-rich data table with sorting, filtering, and pagination',
    category: TEMPLATE_CATEGORIES.DATA,
    component: 'DataTable',
  },

  // Navigation Templates
  'navigation-header': {
    name: 'Navigation Header',
    description:
      'Professional site header with authentication and mobile support',
    category: TEMPLATE_CATEGORIES.NAVIGATION,
    component: 'NavigationHeader',
  },

  // Layout Templates
  'dashboard-layout': {
    name: 'Dashboard Layout',
    description:
      'Complete dashboard layout with sidebar, stats, and content areas',
    category: TEMPLATE_CATEGORIES.LAYOUT,
    component: 'DashboardLayout',
  },
} as const

export type TemplateId = keyof typeof TEMPLATE_REGISTRY
export type TemplateCategory =
  (typeof TEMPLATE_CATEGORIES)[keyof typeof TEMPLATE_CATEGORIES]
