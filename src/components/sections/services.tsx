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
    color: 'primary',
    href: '/services/ai-valuation',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'blue',
    premium: true,
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
    color: 'success',
    href: '/services/financial-health',
    gradient: 'from-green-500 to-emerald-600',
    accent: 'green',
    premium: false,
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
    color: 'accent',
    href: '/services/market-analysis',
    gradient: 'from-purple-500 to-pink-600',
    accent: 'purple',
    premium: true,
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
    color: 'warning',
    href: '/services/growth-score',
    gradient: 'from-orange-500 to-yellow-500',
    accent: 'orange',
    premium: false,
  },
]

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    border: 'border-primary-200',
    button: 'text-primary-600 hover:text-primary-700',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    border: 'border-success-200',
    button: 'text-success-600 hover:text-success-700',
  },
  accent: {
    bg: 'bg-accent-50',
    icon: 'text-accent-600',
    border: 'border-accent-200',
    button: 'text-accent-600 hover:text-accent-700',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    border: 'border-warning-200',
    button: 'text-warning-600 hover:text-warning-700',
  },
}

export function Services() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Solutions</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Next-Generation
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Business Intelligence
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Revolutionary AI platform that transforms raw business data into
            actionable insights, providing unprecedented visibility into your
            company's true potential and market position.
          </p>
        </motion.div>

        {/* Premium Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon

            return (
              <motion.div
                key={service.title}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="relative backdrop-blur-sm border-slate-200/50 bg-white/80 h-full shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 overflow-hidden">
                  {/* Premium Badge */}
                  {service.premium && (
                    <motion.div
                      className="absolute top-4 right-4 z-10"
                      initial={{ scale: 0, rotate: -10 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold hover:from-yellow-500 hover:to-orange-600">
                        PRO
                      </Badge>
                    </motion.div>
                  )}

                  {/* Gradient Background Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}
                  />

                  {/* Icon with enhanced styling */}
                  <motion.div
                    className={`relative w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 10,
                      rotate: { duration: 0.6 },
                    }}
                  >
                    <IconComponent className="w-8 h-8 text-white" />

                    {/* Icon glow effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-xl blur-xl opacity-30 -z-10 group-hover:opacity-60 transition-opacity duration-500`}
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="relative space-y-4">
                    <motion.h3
                      className="text-xl font-bold text-slate-900 group-hover:text-slate-800"
                      whileHover={{ x: 2 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      {service.title}
                    </motion.h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {service.description}
                    </p>

                    {/* Enhanced Features */}
                    <motion.ul
                      className="space-y-2"
                      initial={{ opacity: 0.8 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {service.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          className="flex items-center text-xs text-slate-600 group-hover:text-slate-700"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.3 + index * 0.1 + featureIndex * 0.05,
                          }}
                          viewport={{ once: true }}
                          whileHover={{ x: 4 }}
                        >
                          <motion.div
                            className={`w-1.5 h-1.5 bg-gradient-to-r ${service.gradient} rounded-full mr-3`}
                            whileHover={{ scale: 1.2 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 10,
                            }}
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>

                  {/* Enhanced CTA */}
                  <div className="mt-6 pt-6 border-t border-slate-200/50">
                    <Link href={service.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-between text-slate-700 hover:bg-gradient-to-r hover:${service.gradient} hover:text-white border border-slate-200/50 hover:border-transparent group transition-all duration-300`}
                        >
                          <span className="font-medium">Explore</span>
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Floating elements on hover */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 px-8 py-4 text-lg font-medium"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Your AI Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>No credit card required</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>14-day free trial</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
