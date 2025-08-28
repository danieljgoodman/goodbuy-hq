'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const servicesButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Handle escape key for closing menus
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsServicesOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Handle click outside for services dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesButtonRef.current &&
        !servicesButtonRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Focus management for mobile menu
    if (!isMobileMenuOpen) {
      setTimeout(() => {
        mobileMenuRef.current?.querySelector('a')?.focus()
      }, 100)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="GoodBuy HQ Home"
            >
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className="text-white font-bold text-sm"
                  aria-hidden="true"
                >
                  GB
                </span>
              </motion.div>
              <span className="text-xl font-bold text-secondary-900">
                GoodBuy HQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="relative">
              <button
                ref={servicesButtonRef}
                className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsServicesOpen(!isServicesOpen)
                  }
                }}
                aria-expanded={isServicesOpen}
                aria-haspopup="true"
                aria-controls="services-menu"
              >
                <span>Services</span>
                <motion.div
                  animate={{ rotate: isServicesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    id="services-menu"
                    role="menu"
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 focus:outline-none"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="/calculator"
                      role="menuitem"
                      className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 font-medium focus:outline-none focus:bg-secondary-50 focus:text-primary-600 rounded-t-lg"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Business Calculator
                    </Link>
                    <div
                      className="border-t border-secondary-100 my-1"
                      role="separator"
                    />
                    <Link
                      href="/ai-valuation"
                      role="menuitem"
                      className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      AI Valuation
                    </Link>
                    <Link
                      href="/financial-health"
                      role="menuitem"
                      className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Financial Health
                    </Link>
                    <Link
                      href="/market-analysis"
                      role="menuitem"
                      className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Market Analysis
                    </Link>
                    <Link
                      href="/growth-score"
                      role="menuitem"
                      className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 focus:outline-none focus:bg-secondary-50 focus:text-primary-600 rounded-b-lg"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Growth Score
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/calculator"
              className="text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Calculator
            </Link>
            <Link
              href="/marketplace"
              className="text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Marketplace
            </Link>
            <Link
              href="/pricing"
              className="text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-secondary-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-secondary-600 hover:text-primary-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              id="mobile-menu"
              className="md:hidden border-t border-secondary-200 py-4"
              role="navigation"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="space-y-4"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <div className="space-y-2">
                  <div
                    className="text-sm font-medium text-secondary-900 px-4"
                    role="heading"
                    aria-level={3}
                  >
                    Services
                  </div>
                  <Link
                    href="/calculator"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Business Calculator
                  </Link>
                  <Link
                    href="/ai-valuation"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    AI Valuation
                  </Link>
                  <Link
                    href="/financial-health"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Financial Health
                  </Link>
                  <Link
                    href="/market-analysis"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Market Analysis
                  </Link>
                  <Link
                    href="/growth-score"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Growth Score
                  </Link>
                </div>
                <Link
                  href="/marketplace"
                  className="block px-4 py-2 text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  href="/pricing"
                  className="block px-4 py-2 text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-secondary-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-inset rounded-md mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div
                  className="border-t border-secondary-200 pt-4 space-y-2"
                  role="separator"
                >
                  <Link href="/auth/signin" className="block px-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-secondary-600 hover:text-primary-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block px-4">
                    <Button
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
