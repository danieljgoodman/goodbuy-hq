'use client'

import { Star, Quote, TrendingUp, Users, DollarSign, Award } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'TechFlow Solutions',
    image: '/avatars/sarah.jpg',
    rating: 5,
    quote:
      "GoodBuy HQ's AI valuation was spot-on with our Series A valuation. The insights helped us negotiate better terms and understand our true market position. Absolutely game-changing for founders.",
    metrics: {
      label: 'Valuation Accuracy',
      value: '98%',
    },
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Investment Director',
    company: 'Venture Capital Partners',
    image: '/avatars/michael.jpg',
    rating: 5,
    quote:
      "We use GoodBuy HQ to quickly assess potential investments. Their AI analysis saves us weeks of due diligence and provides insights we might have missed. It's become essential to our workflow.",
    metrics: {
      label: 'Time Saved',
      value: '15 hrs/deal',
    },
  },
  {
    id: 3,
    name: 'Jennifer Park',
    role: 'Business Owner',
    company: 'Park Manufacturing',
    image: '/avatars/jennifer.jpg',
    rating: 5,
    quote:
      "After 20 years in business, I finally understood my company's true value and growth potential. The recommendations helped increase our EBITDA by 23% in just 8 months.",
    metrics: {
      label: 'EBITDA Growth',
      value: '+23%',
    },
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'M&A Advisor',
    company: 'Thompson & Associates',
    image: '/avatars/david.jpg',
    rating: 5,
    quote:
      'The depth of analysis is remarkable. What used to take our team days now happens in minutes, and the accuracy rivals traditional valuation methods. Our clients love the transparency.',
    metrics: {
      label: 'Client Satisfaction',
      value: '96%',
    },
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'CFO',
    company: 'GreenTech Industries',
    image: '/avatars/lisa.jpg',
    rating: 5,
    quote:
      "The financial health assessment identified cash flow issues we hadn't noticed. Following their recommendations improved our working capital by $2.1M within 6 months.",
    metrics: {
      label: 'Working Capital',
      value: '+$2.1M',
    },
  },
  {
    id: 6,
    name: 'Robert Kim',
    role: 'Serial Entrepreneur',
    company: 'Kim Ventures',
    image: '/avatars/robert.jpg',
    rating: 5,
    quote:
      "I've sold three companies, and GoodBuy HQ's valuations were consistently within 5% of final sale prices. It's the most accurate tool I've used for business valuation.",
    metrics: {
      label: 'Sale Price Accuracy',
      value: '95%',
    },
  },
]

const stats = [
  {
    value: '10,000+',
    label: 'Businesses Valued',
    icon: Users,
    color: 'from-primary to-primary/80',
    description: 'Companies trust our AI',
  },
  {
    value: '95%',
    label: 'Accuracy Rate',
    icon: Award,
    color: 'from-primary to-primary/70',
    description: 'Precision you can rely on',
  },
  {
    value: '$2.8B',
    label: 'Total Value Analyzed',
    icon: DollarSign,
    color: 'from-primary/90 to-primary',
    description: 'Enterprise-grade scale',
  },
  {
    value: '4.9/5',
    label: 'User Rating',
    icon: Star,
    color: 'from-primary/80 to-primary/60',
    description: 'Loved by professionals',
  },
]

export function Testimonials() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-muted/30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          {/* Badge - On its own line with proper spacing */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-secondary to-accent border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <Award className="w-5 h-5 text-primary mr-3" />
              <span className="text-sm font-semibold text-primary tracking-wide">
                Trusted by Industry Leaders
              </span>
            </div>
          </div>

          {/* Main Title - Improved typography and spacing */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent leading-tight tracking-tight">
              What Our Users Say
            </h2>
          </div>

          {/* Description - Enhanced readability */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed font-light">
              Join thousands of business owners, investors, and advisors who rely
              on our AI-powered platform for accurate business valuations and
              strategic insights.
            </p>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className={cn(
                  'group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500',
                  'bg-card/90 backdrop-blur-sm hover:bg-card/95',
                  'animate-fade-in hover:scale-105'
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient background overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity',
                    stat.color
                  )}
                />

                <CardContent className="p-6 text-center relative z-10">
                  {/* Icon */}
                  <div
                    className={cn(
                      'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4',
                      'bg-gradient-to-br shadow-lg group-hover:shadow-xl transition-all duration-300',
                      stat.color
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Professional Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={cn(
                'group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl',
                'transition-all duration-500 animate-fade-in hover:scale-[1.02]',
                'bg-card/90 backdrop-blur-sm hover:bg-card/95'
              )}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  {/* Quote Icon with gradient */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-lg blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-secondary to-accent p-3 rounded-lg">
                      <Quote className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Enhanced Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="relative">
                        <Star className="w-4 h-4 text-amber-400 fill-current drop-shadow-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative">
                {/* Quote with better typography */}
                <blockquote className="text-foreground/90 leading-relaxed mb-6 text-base font-medium">
                  "{testimonial.quote}"
                </blockquote>

                {/* Enhanced Metrics Card */}
                <div className="relative overflow-hidden rounded-xl p-5 mb-6 bg-gradient-to-br from-secondary via-card to-accent border border-border/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          {testimonial.metrics.value}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {testimonial.metrics.label}
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary/60" />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="relative">
                {/* Professional Author Section */}
                <div className="flex items-center w-full">
                  {/* Enhanced Avatar */}
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity scale-110" />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-bold text-lg tracking-wider">
                        {testimonial.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </span>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-foreground mb-1">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground font-medium">
                      {testimonial.role}
                    </CardDescription>
                    <div className="text-xs text-muted-foreground/80 mt-1">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-20">
          <Card className="relative overflow-hidden border-0 shadow-2xl max-w-5xl mx-auto group hover:shadow-3xl transition-all duration-700">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/30 animate-pulse" />

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            </div>

            <CardContent className="relative z-10 p-10 lg:p-16 text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30 mb-8">
                <Star className="w-4 h-4 text-primary-foreground mr-2" />
                <span className="text-sm font-medium text-primary-foreground">
                  Join 10,000+ Success Stories
                </span>
              </div>

              {/* Title with gradient text */}
              <CardTitle className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Business Story?
                </span>
              </CardTitle>

              {/* Description */}
              <CardDescription className="text-xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Get your business valued by AI in minutes and discover insights
                that could transform your company's future. Join thousands of
                successful entrepreneurs who trust our platform.
              </CardDescription>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  className={cn(
                    'px-10 py-4 text-lg font-semibold',
                    'bg-primary-foreground text-primary hover:bg-primary-foreground/95',
                    'shadow-xl hover:shadow-2xl',
                    'transform hover:scale-105 transition-all duration-300',
                    'border-2 border-primary-foreground/50 hover:border-primary-foreground'
                  )}
                >
                  Start Your Free Valuation
                  <TrendingUp className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    'px-10 py-4 text-lg font-semibold',
                    'bg-transparent text-primary-foreground border-2 border-primary-foreground/50',
                    'hover:bg-primary-foreground/10 hover:border-primary-foreground',
                    'backdrop-blur-sm transform hover:scale-105',
                    'transition-all duration-300 shadow-lg hover:shadow-xl'
                  )}
                >
                  View Sample Report
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-primary-foreground/80 text-sm">
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  10,000+ businesses valued
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  4.9/5 rating
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
