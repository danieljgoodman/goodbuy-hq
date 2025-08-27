import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers/session-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | GoodBuy HQ',
    default: 'GoodBuy HQ - AI-Powered Business Valuation Platform',
  },
  description:
    'Get your business valued by AI in minutes. Our advanced platform provides accurate business valuations, financial health assessments, market analysis, and growth scores trusted by 10,000+ businesses worldwide.',
  keywords: [
    'business valuation',
    'AI valuation',
    'company valuation',
    'business appraisal',
    'financial analysis',
    'market analysis',
    'business worth',
    'startup valuation',
    'SME valuation',
    'business intelligence',
    'financial health',
    'growth score',
    'M&A valuation',
    'investment analysis',
  ],
  authors: [{ name: 'GoodBuy HQ Team' }],
  creator: 'GoodBuy HQ',
  publisher: 'GoodBuy HQ',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'GoodBuy HQ - AI-Powered Business Valuation Platform',
    description:
      'Get your business valued by AI in minutes. Trusted by 10,000+ businesses for accurate valuations, financial health assessments, and growth analysis.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'GoodBuy HQ',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GoodBuy HQ - AI-Powered Business Valuation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoodBuy HQ - AI-Powered Business Valuation Platform',
    description:
      'Get your business valued by AI in minutes. Trusted by 10,000+ businesses worldwide.',
    images: ['/og-image.jpg'],
    creator: '@goodbuyhq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
