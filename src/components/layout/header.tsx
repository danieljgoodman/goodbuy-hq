'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GB</span>
              </div>
              <span className="text-xl font-bold text-secondary-900">
                GoodBuy HQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors">
                <span>Services</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  href="/calculator"
                  className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 font-medium"
                >
                  Business Calculator
                </Link>
                <div className="border-t border-secondary-100 my-1" />
                <Link
                  href="/ai-valuation"
                  className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  AI Valuation
                </Link>
                <Link
                  href="/financial-health"
                  className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  Financial Health
                </Link>
                <Link
                  href="/market-analysis"
                  className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  Market Analysis
                </Link>
                <Link
                  href="/growth-score"
                  className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  Growth Score
                </Link>
              </div>
            </div>
            <Link
              href="/calculator"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/pricing"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-secondary-600 hover:text-primary-600"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-secondary-900 px-4">
                  Services
                </div>
                <Link
                  href="/ai-valuation"
                  className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600"
                >
                  AI Valuation
                </Link>
                <Link
                  href="/financial-health"
                  className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600"
                >
                  Financial Health
                </Link>
                <Link
                  href="/market-analysis"
                  className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600"
                >
                  Market Analysis
                </Link>
                <Link
                  href="/growth-score"
                  className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600"
                >
                  Growth Score
                </Link>
              </div>
              <Link
                href="/pricing"
                className="block px-4 py-2 text-secondary-600 hover:text-primary-600"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-secondary-600 hover:text-primary-600"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 text-secondary-600 hover:text-primary-600"
              >
                Contact
              </Link>
              <div className="border-t border-secondary-200 pt-4 space-y-2">
                <Link href="/auth/signin" className="block px-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-secondary-600 hover:text-primary-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block px-4">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
