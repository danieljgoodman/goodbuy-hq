import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoodBuy HQ - Your Business Headquarters',
  description: 'Your business headquarters for better buying decisions',
  keywords: ['business', 'purchasing', 'headquarters', 'goodbuy'],
  authors: [{ name: 'Daniel Goodman' }],
  creator: 'Daniel Goodman',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'GoodBuy HQ',
    description: 'Your business headquarters for better buying decisions',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'GoodBuy HQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoodBuy HQ',
    description: 'Your business headquarters for better buying decisions',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
          {children}
        </div>
      </body>
    </html>
  )
}
