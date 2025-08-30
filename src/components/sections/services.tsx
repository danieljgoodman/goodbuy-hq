'use client'

import Link from 'next/link'
import {
  Brain,
  Heart,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Target,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const services = [
  {
    icon: Brain,
    title: 'AI Valuation Engine',
    description:
      'Revolutionary neural networks analyze 10,000+ data points to provide instant, investment-grade business valuations with 98% accuracy.',
    features: [
      'Neural network analysis',
      'Real-time market data',
      'Multi-model validation',
      'Investment-grade reports',
    ],
    href: '/services/ai-valuation',
    gradient: 'from-primary to-purple-600',
    iconBg: 'bg-gradient-to-br from-primary to-purple-600',
    premium: true,
    metric: { label: 'Accuracy Rate', value: '98%' },
  },
  {
    icon: Shield,
    title: 'Financial Fortress',
    description:
      'Advanced risk assessment algorithms evaluate financial stability, predict cash flow patterns, and identify potential vulnerabilities.',
    features: [
      'Risk scoring matrix',
      'Cash flow predictions',
      'Stress test scenarios',
      'Security analytics',
    ],
    href: '/services/financial-health',
    gradient: 'from-success to-emerald-600',
    iconBg: 'bg-gradient-to-br from-success to-emerald-600',
    premium: false,
    metric: { label: 'Risk Detection', value: '99.2%' },
  },
  {
    icon: Target,
    title: 'Market Intelligence',
    description:
      'Comprehensive competitive intelligence platform that maps your market position and identifies untapped opportunities.',
    features: [
      'Competitive mapping',
      'Opportunity detection',
      'Market sizing',
      'Trend forecasting',
    ],
    href: '/services/market-analysis',
    gradient: 'from-purple-500 to-primary',
    iconBg: 'bg-gradient-to-br from-purple-500 to-primary',
    premium: true,
    metric: { label: 'Market Coverage', value: '95%' },
  },
  {
    icon: Zap,
    title: 'Growth Accelerator',
    description:
      'Predictive growth modeling that identifies scalability factors, optimizes resource allocation, and maps expansion strategies.',
    features: [
      'Growth trajectory',
      'Scalability metrics',
      'Resource optimization',
      'Strategic roadmap',
    ],
    href: '/services/growth-score',
    gradient: 'from-warning to-orange-500',
    iconBg: 'bg-gradient-to-br from-warning to-orange-500',
    premium: false,
    metric: { label: 'Growth Prediction', value: '97%' },
  },
]

export function Services() {
  return (
    <section
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, 
            hsl(var(--background)) 0%,
            color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--background))) 50%,
            hsl(var(--background)) 100%
          )
        `,
      }}
      aria-labelledby="services-title"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-primary/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            AI-Powered Solutions
            <Sparkles className="w-4 h-4" />
          </div>

          <h2
            id="services-title"
            className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Next-Generation
            <span className="block bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent text-gradient hero-subtitle">
              Business Intelligence
            </span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Revolutionary AI platform that transforms raw business data into
            actionable insights, providing unprecedented visibility into your
            company's true potential and market position.
          </p>
        </div>

        {/* Professional Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {services.map((service, index) => {
            const IconComponent = service.icon

            return (
              <div
                key={service.title}
                className="group relative h-full flex flex-col"
                style={{
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`,
                }}
              >
                {/* Service Card */}
                <Card
                  className={cn(
                    'relative overflow-hidden border-0 shadow-lg hover:shadow-2xl',
                    'transition-all duration-500 animate-fade-in hover:scale-[1.02] h-full flex flex-col',
                    'bg-card/90 backdrop-blur-sm hover:bg-primary/95 group-hover:text-white'
                  )}
                >
                  {/* Premium Badge */}
                  {service.premium && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-bold hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
                        PRO
                      </Badge>
                    </div>
                  )}

                  {/* Gradient border effect */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm',
                      service.gradient
                    )}
                  />

                  <CardContent className="relative p-6 flex-1 flex flex-col">
                    {/* Icon with enhanced styling */}
                    <div className="relative mb-6">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300',
                          service.iconBg
                        )}
                      >
                        <IconComponent className="w-8 h-8 text-white" />

                        {/* Icon glow effect */}
                        <div
                          className={cn(
                            'absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 -z-10',
                            service.iconBg
                          )}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      {/* Title and Description - Fixed Height */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-white transition-colors duration-300 mb-3">
                          {service.title}
                        </h3>
                        <div className="h-20">
                          <p className="text-muted-foreground group-hover:text-white/90 leading-relaxed text-sm transition-colors duration-300 line-clamp-4">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Performance Metric - Fixed Position */}
                      <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-primary/5 via-card to-purple-50/30 border border-primary/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className={cn(
                                'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent group-hover:!text-white group-hover:bg-none transition-all duration-300',
                                service.gradient
                              )}
                            >
                              {service.metric.value}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
                              {service.metric.label}
                            </div>
                          </div>
                          <TrendingUp className="w-6 h-6 text-primary/60 group-hover:text-white/80 transition-colors duration-300" />
                        </div>
                      </div>

                      {/* Enhanced Features - Flex Grow */}
                      <div className="space-y-2 flex-1">
                        {service.features.map((feature, featureIndex) => (
                          <div
                            key={feature}
                            className="flex items-center text-sm text-muted-foreground group-hover:text-white/90 transition-colors duration-300"
                            style={{
                              animationDelay: `${index * 0.2 + featureIndex * 0.1}s`,
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-success group-hover:text-white mr-3 flex-shrink-0 transition-colors duration-300" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  {/* Enhanced CTA */}
                  <CardFooter className="p-6 pt-0">
                    <Link href={service.href} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-between text-foreground group-hover:text-white hover:text-white border-border/50 hover:border-white group-hover:border-white/50 bg-transparent hover:bg-white/20 group-hover:bg-white/20 transition-all duration-300 group/btn"
                      >
                        <span className="font-medium">Explore Service</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardFooter>

                  {/* Bottom Gradient Accent */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-1 rounded-b-lg bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                      service.gradient
                    )}
                  />
                </Card>
              </div>
            )
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="mt-20">
          <div className="relative overflow-hidden business-card bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl border border-border/50 p-10 shadow-2xl max-w-4xl mx-auto">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                Ready to Transform Your Business?
              </div>

              <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Start Your AI-Powered Journey
              </h3>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of businesses using our AI platform to unlock
                hidden value, optimize operations, and accelerate growth with
                data-driven insights.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span>Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>98%+ Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-success" />
                  <span>5-Minute Analysis</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="professional-cta group px-10 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Start Free Analysis</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-4 border-2 border-primary/20 hover:border-primary text-foreground hover:text-primary rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md"
                >
                  View Demo
                </Button>
              </div>

              {/* Trust Indicators Bottom */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>No credit card required</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-primary fill-current" />
                  <span>4.9/5 user rating</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Cancel anytime</span>
                </div>
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
