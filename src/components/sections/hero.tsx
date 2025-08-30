'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Play,
  TrendingUp,
  Brain,
  BarChart3,
  Star,
  Sparkles,
  Shield,
  CheckCircle,
  Award,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  TrustIndicators,
  TrustMetrics,
  SecurityBadge,
} from '@/components/ui/trust-indicators'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
      {/* Modern geometric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-to-r from-transparent via-primary/5 to-transparent h-px w-full" />
        </div>
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6 lg:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Brain className="h-4 w-4" />
                AI-Powered Business Intelligence
                <Sparkles className="h-4 w-4 text-primary" />
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                Transform Your Business
                <motion.span
                  className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-gradient hero-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Data into Intelligence
                </motion.span>
                <span className="text-muted-foreground">with AI</span>
              </h1>
              <motion.p
                className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Advanced machine learning algorithms analyze your business
                metrics, market dynamics, and growth patterns to deliver
                unprecedented insights that drive strategic decisions.
              </motion.p>
            </motion.div>

            {/* Key Benefits */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-card border"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  98% Prediction Accuracy
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-card border"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Real-time Processing
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-card border"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </motion.div>
            </motion.div>

            {/* Trust-Enhanced CTA Buttons */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Start Secure AI Analysis
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" variant="outline" className="group">
                    <Play className="mr-2 h-4 w-4" />
                    View Demo
                  </Button>
                </motion.div>
              </div>

              {/* Security Indicators */}
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <div className="security-indicator">
                  <Lock className="h-4 w-4" />
                  <span>256-bit SSL</span>
                </div>
                <div className="security-indicator">
                  <Shield className="h-4 w-4" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="security-indicator">
                  <CheckCircle className="h-4 w-4" />
                  <span>GDPR Compliant</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div
              className="pt-8 border-t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <TrustMetrics />
              <motion.div
                className="flex items-center gap-2 justify-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Trusted by leading AI companies
                </span>
              </motion.div>
              <motion.div
                className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                <span className="font-medium">OpenAI</span>
                <span className="font-medium">Anthropic</span>
                <span className="font-medium">Scale AI</span>
                <span className="font-medium">Replicate</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Modern Dashboard */}
          <motion.div
            className="relative lg:self-start"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Main Dashboard Preview */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className="p-6 backdrop-blur-sm bg-card/50 border-2">
                <CardContent className="p-0 space-y-6">
                  {/* Header */}
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        AI Business Intelligence
                      </h3>
                    </div>
                    <motion.div
                      className="h-3 w-3 bg-emerald-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Main Value Display */}
                  <motion.div
                    className="text-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <motion.div
                      className="text-4xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                    >
                      $3.2M
                    </motion.div>
                    <motion.div
                      className="text-sm text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.6 }}
                    >
                      AI-Predicted Valuation
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-center mt-2 text-emerald-600"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">
                        +24% confidence boost
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* AI Metrics */}
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                  >
                    <motion.div
                      className="bg-card rounded-lg p-4 border"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="text-2xl font-bold"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        94.7%
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        AI Confidence
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-card rounded-lg p-4 border"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="text-2xl font-bold"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      >
                        2.3s
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        Analysis Time
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* AI Progress Indicators */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Neural Processing</span>
                        <motion.span
                          className="text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6, duration: 0.6 }}
                        >
                          98%
                        </motion.span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '98%' }}
                          transition={{
                            delay: 1.7,
                            duration: 1.5,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pattern Recognition</span>
                        <motion.span
                          className="text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8, duration: 0.6 }}
                        >
                          96%
                        </motion.span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '96%' }}
                          transition={{
                            delay: 1.9,
                            duration: 1.5,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </CardContent>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-3 -right-3 bg-card border rounded-lg p-2"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <BarChart3 className="h-5 w-5 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-3 -left-3 bg-card border rounded-lg p-2"
                  animate={{
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 3,
                  }}
                >
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
