'use client'

import { Upload, Brain, FileText, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Data',
    description:
      'Securely upload your financial statements, tax returns, and business documents. Our platform accepts multiple formats including PDF, Excel, and CSV.',
    details: [
      'Bank-grade 256-bit encryption',
      'Automated data extraction',
      'Multiple file format support',
      'Real-time validation',
    ],
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Analysis',
    description:
      'Our advanced AI algorithms analyze your data using 200+ valuation metrics, industry benchmarks, and market conditions to build a comprehensive picture.',
    details: [
      'Machine learning models',
      '200+ valuation metrics',
      'Real-time market data',
      'Industry comparisons',
    ],
  },
  {
    step: '03',
    icon: FileText,
    title: 'Get Your Report',
    description:
      'Receive a detailed valuation report with actionable insights, growth recommendations, and market positioning analysis within minutes.',
    details: [
      'Comprehensive PDF report',
      'Interactive dashboard',
      'Actionable recommendations',
      'Export & sharing options',
    ],
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
            How It Works
          </h2>
          <p className="text-lg text-secondary-600 leading-relaxed">
            Get your business valued in three simple steps. Our AI-powered
            platform makes professional business valuation accessible to
            everyone.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between px-16">
              <ArrowRight className="w-8 h-8 text-primary-300" />
              <ArrowRight className="w-8 h-8 text-primary-300" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon

              return (
                <div
                  key={step.step}
                  className="relative text-center animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {step.step}
                      </span>
                    </div>
                    {/* Icon overlay */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-secondary-900">
                      {step.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed max-w-sm mx-auto">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <ul className="space-y-3 text-left">
                        {step.details.map(detail => (
                          <li
                            key={detail}
                            className="flex items-center text-sm text-secondary-600"
                          >
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Time Indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-success-100 text-success-700 px-6 py-3 rounded-full font-medium">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" />
            <span>Complete analysis in under 5 minutes</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl border border-secondary-200 p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-secondary-600 mb-6">
              Join thousands of business owners who trust our AI-powered
              valuation platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                Start Free Analysis
              </button>
              <button className="px-8 py-3 border border-secondary-300 hover:border-primary-300 text-secondary-700 hover:text-primary-600 rounded-lg font-medium transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
