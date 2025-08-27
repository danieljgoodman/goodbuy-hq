// Application constants
export const APP_NAME = 'GoodBuy HQ'
export const APP_DESCRIPTION =
  'Your business headquarters for better buying decisions'

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'goodbuy-theme',
  USER_PREFERENCES: 'goodbuy-user-prefs',
} as const

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const
