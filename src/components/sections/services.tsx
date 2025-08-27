'use client'

import Link from 'next/link'
import { Brain, Heart, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const services = [
  {
    icon: Brain,
    title: 'AI Valuation',
    description:
      'Advanced machine learning algorithms analyze your business data to provide accurate, real-time valuations based on market conditions and financial performance.',
    features: [
      'Real-time analysis',
      'Market comparisons',
      'Revenue multiples',
      'DCF modeling',
    ],
    color: 'primary',
    href: '/services/ai-valuation',
  },
  {
    icon: Heart,
    title: 'Financial Health',
    description:
      'Comprehensive assessment of your business financial stability, cash flow patterns, and operational efficiency to identify strengths and improvement areas.',
    features: [
      'Cash flow analysis',
      'Profitability metrics',
      'Debt assessment',
      'Working capital',
    ],
    color: 'success',
    href: '/services/financial-health',
  },
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description:
      'Deep dive into your industry landscape, competitive positioning, and market opportunities to understand your business context and growth potential.',
    features: [
      'Industry benchmarks',
      'Competitive analysis',
      'Market size',
      'Growth trends',
    ],
    color: 'accent',
    href: '/services/market-analysis',
  },
  {
    icon: TrendingUp,
    title: 'Growth Score',
    description:
      'Predictive analytics that evaluate your business scalability, growth trajectory, and future potential based on historical data and market indicators.',
    features: [
      'Growth predictions',
      'Scalability index',
      'Risk factors',
      'Opportunity map',
    ],
    color: 'warning',
    href: '/services/growth-score',
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
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
            Comprehensive Business Intelligence
          </h2>
          <p className="text-lg text-secondary-600 leading-relaxed">
            Our AI-powered platform provides four core services to give you
            complete visibility into your business value, performance, and
            growth potential.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            const colors =
              colorClasses[service.color as keyof typeof colorClasses]

            return (
              <div
                key={service.title}
                className="group relative bg-white rounded-2xl border border-secondary-200 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${colors.bg} ${colors.border} border-2 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-secondary-900">
                    {service.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map(feature => (
                      <li
                        key={feature}
                        className="flex items-center text-sm text-secondary-600"
                      >
                        <div
                          className={`w-1.5 h-1.5 ${colors.icon.replace('text-', 'bg-')} rounded-full mr-3`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <Link href={service.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-between ${colors.button} group-hover:bg-secondary-50`}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-secondary-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Try All Services Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-secondary-500 mt-3">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>
    </section>
  )
}
