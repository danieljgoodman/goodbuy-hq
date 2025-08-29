'use client'

import { useState } from 'react'
import {
  Mail,
  ArrowRight,
  Check,
  TrendingUp,
  Users,
  Shield,
  Award,
  Zap,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Weekly Market Insights',
    description:
      'Get the latest business valuation trends and market analysis delivered to your inbox.',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'from-purple-50 to-indigo-50',
  },
  {
    icon: Users,
    title: 'Exclusive Content',
    description:
      'Access premium guides, case studies, and expert tips from industry professionals.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'from-emerald-50 to-teal-50',
  },
  {
    icon: Shield,
    title: 'Early Access',
    description:
      'Be the first to try new features and get priority support from our team.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
  },
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
      <section 
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(var(--background)) 0%,
              color-mix(in srgb, hsl(var(--success)) 5%, hsl(var(--background))) 50%,
              hsl(var(--background)) 100%
            )
          `
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-success/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-l from-success/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="business-card h-full bg-gradient-to-br from-card via-card to-success/5 backdrop-blur-sm border border-border/50 rounded-3xl p-8 lg:p-12 shadow-2xl">
            {/* Success Icon */}
            <div className="relative mb-8 flex justify-center">
              <div 
                className="relative w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--success)) 0%, color-mix(in srgb, hsl(var(--success)) 80%, transparent) 100%)',
                }}
              >
                <Check className="w-10 h-10 text-white" />
                
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-50 blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--success)) 0%, color-mix(in srgb, hsl(var(--success)) 80%, transparent) 100%)',
                  }}
                ></div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-6 border border-success/20">
              <CheckCircle2 className="w-4 h-4" />
              Welcome to the Community
            </div>

            <h2 className="hero-title text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent text-gradient">
              Welcome to the GoodBuy HQ Community!
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Thank you for subscribing. You'll receive your first market
              insights email within the next 24 hours.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
              }}
              variant="ghost"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
            >
              Subscribe another email
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, 
            hsl(var(--background)) 0%,
            color-mix(in srgb, hsl(var(--primary)) 3%, hsl(var(--background))) 50%,
            hsl(var(--background)) 100%
          )
        `
      }}
      aria-labelledby="newsletter-title"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-purple-500/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8 border border-primary/20">
                <Mail className="w-4 h-4" />
                <span>Join 25,000+ Business Leaders</span>
              </div>
              
              <h2 
                id="newsletter-title"
                className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold mb-8"
              >
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent text-gradient">
                  Stay Ahead of the
                </span>
                <span className="block bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent text-gradient hero-subtitle">
                  Business Game
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Get exclusive insights, market trends, and valuation tips
                delivered straight to your inbox. Join thousands of business
                owners who trust our weekly newsletter.
              </p>
            </div>

            {/* Enhanced Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="group flex items-start space-x-4"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Enhanced Icon */}
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          background: `linear-gradient(135deg, ${benefit.color.split(' ')[0].replace('from-', '')} 0%, ${benefit.color.split(' ')[1].replace('to-', '')} 100%)`,
                        }}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Glow Effect */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                        style={{
                          background: `linear-gradient(135deg, ${benefit.color.split(' ')[0].replace('from-', '')} 0%, ${benefit.color.split(' ')[1].replace('to-', '')} 100%)`,
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Enhanced Social Proof */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full border-2 border-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    <span className="text-xs text-white font-bold">
                      {String.fromCharCode(65 + i - 1)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-foreground font-semibold">Join 25,000+ subscribers</div>
                <div className="text-muted-foreground text-xs">Growing community of business leaders</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Email Form */}
          <div className="relative">
            {/* Premium Form Card */}
            <div className="business-card bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border border-border/50 rounded-3xl p-8 lg:p-10 shadow-2xl group hover:shadow-3xl transition-all duration-500">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
                  <Award className="w-4 h-4" />
                  Premium Access
                </div>
                
                <h3 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Get Started Today
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  No spam, unsubscribe anytime. We respect your privacy.
                </p>
              </div>

              {/* Enhanced Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-3"
                  >
                    Business Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your business email"
                    required
                    className="w-full h-14 text-base border-2 border-border hover:border-primary/50 focus:border-primary transition-colors duration-300 bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className={cn(
                    "professional-cta w-full h-14 text-lg font-semibold",
                    "bg-gradient-to-r from-primary to-purple-600",
                    "hover:from-primary/90 hover:to-purple-600/90",
                    "shadow-xl hover:shadow-2xl transform hover:scale-[1.02]",
                    "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      <span>Subscribing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Subscribe Free</span>
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Enhanced Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-5 h-5 text-success mb-2" />
                    <span className="text-xs font-medium text-muted-foreground">No spam ever</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="w-5 h-5 text-primary mb-2" />
                    <span className="text-xs font-medium text-muted-foreground">Privacy protected</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Zap className="w-5 h-5 text-amber-500 mb-2" />
                    <span className="text-xs font-medium text-muted-foreground">Unsubscribe anytime</span>
                  </div>
                </div>
              </div>

              {/* Premium Features List */}
              <div className="mt-8 space-y-3">
                <div className="text-sm font-semibold text-foreground mb-4">What you'll get:</div>
                {[
                  'Weekly market insights & trends',
                  'Exclusive case studies & guides',
                  'Early access to new features',
                  'Priority customer support'
                ].map((feature, index) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    style={{ 
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <Star className="w-4 h-4 text-primary fill-current" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-full opacity-60 blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 rounded-full opacity-40 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 -right-2 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-primary/20 rounded-full opacity-50 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-20 text-center">
          <div className="business-card bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">25,000+ Active Subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="font-medium">98% Open Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Industry Leading Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
