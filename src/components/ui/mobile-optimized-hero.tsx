'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Play,
  TrendingUp,
  Brain,
  BarChart3,
  Star,
  Sparkles,
  Shield,
  Zap,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export function MobileOptimizedHero() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const AnimatedElement = ({ children, delay = 0, className = '' }: any) => {
    if (!isClient) {
      return <div className={className}>{children}</div>
    }

    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
      {/* Simplified background for mobile performance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px] opacity-60" />
        {isClient && (
          <>
            <motion.div
              className="absolute top-1/4 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-primary/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-accent/5 rounded-full blur-3xl"
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 6,
              }}
            />
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content - Mobile Optimized */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <AnimatedElement delay={0.1}>
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <Brain className="h-4 w-4" />
                AI-Powered Business Intelligence
                <Sparkles className="h-4 w-4 text-primary" />
              </Badge>
            </AnimatedElement>

            {/* Main Headline - Mobile Optimized */}
            <AnimatedElement delay={0.2} className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                Transform Your Business
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-2">
                  Data into Intelligence
                </span>
                <span className="block text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2">
                  with AI
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Advanced machine learning algorithms analyze your business
                metrics, market dynamics, and growth patterns to deliver
                unprecedented insights that drive strategic decisions.
              </p>
            </AnimatedElement>

            {/* Trust Indicators - Mobile Optimized */}
            <AnimatedElement delay={0.4} className="space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">
                    Bank-Grade Security
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Real-time Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    50,000+ Businesses
                  </span>
                </div>
              </div>
            </AnimatedElement>

            {/* CTA Buttons - Mobile Optimized */}
            <AnimatedElement delay={0.6} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto text-base px-8 py-3"
                  >
                    Start AI Analysis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="group w-full sm:w-auto text-base px-8 py-3"
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </div>
            </AnimatedElement>

            {/* Social Proof - Mobile Optimized */}
            <AnimatedElement delay={0.8} className="pt-6 border-t">
              <div className="flex flex-col items-center lg:items-start space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Trusted by 50,000+ businesses
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">OpenAI Partner</span>
                  <span className="font-medium">SOC 2 Certified</span>
                  <span className="font-medium">GDPR Compliant</span>
                </div>
              </div>
            </AnimatedElement>
          </div>

          {/* Right Content - Mobile Dashboard Preview */}
          <AnimatedElement delay={0.4} className="relative">
            <Card className="p-4 sm:p-6 backdrop-blur-sm bg-card/50 border-2 mx-auto max-w-md lg:max-w-none">
              <CardContent className="p-0 space-y-4 lg:space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Dashboard</h3>
                  </div>
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Main Value Display - Mobile Optimized */}
                <div className="text-center p-6 lg:p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border">
                  <div className="text-3xl lg:text-4xl font-bold">$3.2M</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    AI-Predicted Valuation
                  </div>
                  <div className="flex items-center justify-center mt-2 text-emerald-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+24% confidence</span>
                  </div>
                </div>

                {/* AI Metrics - Mobile Grid */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-card rounded-lg p-3 lg:p-4 border">
                    <div className="text-xl lg:text-2xl font-bold">94.7%</div>
                    <div className="text-xs text-muted-foreground">
                      AI Confidence
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-3 lg:p-4 border">
                    <div className="text-xl lg:text-2xl font-bold">2.3s</div>
                    <div className="text-xs text-muted-foreground">
                      Analysis Time
                    </div>
                  </div>
                </div>

                {/* Progress Bars - Simplified for Mobile */}
                <div className="space-y-3 lg:space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing</span>
                      <span className="text-muted-foreground">98%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full"
                        style={{ width: '98%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Floating Elements - Reduced for Mobile */}
              {isClient && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-card border rounded-lg p-2"
                  animate={{
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <BarChart3 className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </Card>
          </AnimatedElement>
        </div>
      </div>
    </section>
  )
}
