'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check, TrendingUp, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Weekly Market Insights',
    description: 'Get the latest business valuation trends and market analysis delivered to your inbox.'
  },
  {
    icon: Users,
    title: 'Exclusive Content',
    description: 'Access premium guides, case studies, and expert tips from industry professionals.'
  },
  {
    icon: Shield,
    title: 'Early Access',
    description: 'Be the first to try new features and get priority support from our team.'
  }
]

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <section className="py-20 lg:py-28 bg-gradient-to-br from-success-50 via-white to-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl border border-success-200 p-8 lg:p-12 shadow-xl">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-4">
              Welcome to the GoodBuy HQ Community!
            </h2>
            <p className="text-lg text-secondary-600 mb-6">
              Thank you for subscribing. You'll receive your first market insights email within the next 24 hours.
            </p>
            <Button 
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
              }}
              variant="ghost" 
              className="text-secondary-600 hover:text-primary-600"
            >
              Subscribe another email
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                <span>Join 25,000+ Business Leaders</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Stay Ahead of the 
                <span className="text-primary-600 block">
                  Business Game
                </span>
              </h2>
              <p className="text-lg text-secondary-600 leading-relaxed">
                Get exclusive insights, market trends, and valuation tips delivered straight to your inbox. Join thousands of business owners who trust our weekly newsletter.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <div 
                    key={benefit.title} 
                    className="flex items-start space-x-4 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-secondary-600 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-secondary-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-medium">
                      {String.fromCharCode(65 + i - 1)}
                    </span>
                  </div>
                ))}
              </div>
              <span>Join 25,000+ subscribers</span>
            </div>
          </div>

          {/* Right Content - Email Form */}
          <div className="relative">
            <div className="bg-white rounded-2xl border border-secondary-200 p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-2">
                  Get Started Today
                </h3>
                <p className="text-secondary-600">
                  No spam, unsubscribe anytime. We respect your privacy.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your business email"
                    required
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Subscribing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Subscribe Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-secondary-100">
                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <span>✓ No spam ever</span>
                  <span>✓ Unsubscribe anytime</span>
                  <span>✓ Privacy protected</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full opacity-20 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-20 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}