'use client'

import {
  Upload,
  Brain,
  FileText,
  ArrowRight,
  Shield,
  Zap,
  Target,
  CheckCircle2,
} from 'lucide-react'

const steps = [
  {
    step: 1,
    icon: Upload,
    title: 'Upload Your Data',
    description:
      'Securely upload your financial statements, tax returns, and business documents. Our platform accepts multiple formats with bank-grade encryption.',
    features: [
      'Bank-grade 256-bit encryption',
      'Automated data extraction',
      'Multiple file format support',
      'Real-time validation',
    ],
  },
  {
    step: 2,
    icon: Brain,
    title: 'AI Analysis',
    description:
      'Our AI algorithms analyze your data using 200+ valuation metrics, industry benchmarks, and real-time market conditions for comprehensive insights.',
    features: [
      'Machine learning models',
      '200+ valuation metrics',
      'Real-time market data',
      'Industry comparisons',
    ],
  },
  {
    step: 3,
    icon: FileText,
    title: 'Get Your Report',
    description:
      'Receive a comprehensive valuation report with actionable insights, growth recommendations, and market positioning analysis in minutes.',
    features: [
      'Comprehensive PDF report',
      'Interactive dashboard',
      'Actionable recommendations',
      'Export & sharing options',
    ],
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
            <Zap className="w-4 h-4" />
            Simple 3-Step Process
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            How It Works
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get your business valued in three simple steps. Our AI-powered
            platform makes professional business valuation accessible to
            everyone.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex items-center justify-between px-24">
              <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
              <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon

              return (
                <div key={step.step} className="relative group">
                  {/* Mobile connection line */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute left-1/2 -translate-x-0.5 top-full mt-8 h-12 w-px bg-border"></div>
                  )}

                  <div className="text-center">
                    {/* Step number and icon */}
                    <div className="relative mb-6 inline-flex">
                      <div className="w-20 h-20 bg-card border border-border rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>

                      {/* Features list */}
                      <div className="space-y-3 pt-4">
                        {step.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm text-muted-foreground justify-center lg:justify-start"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Time indicator */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-full shadow-sm">
            <div className="relative">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-foreground">
              Complete analysis in under 5 minutes
            </span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-20">
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Target className="w-4 h-4" />
              Ready to Start?
            </div>

            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Get Your Business Valuation Now
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of business owners who trust our AI-powered
              valuation platform. Start your free analysis today.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>99.9% Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>5-Minute Results</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2">
                <span>Start Free Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>

              <button className="px-8 py-4 border-2 border-border hover:border-primary text-foreground hover:text-primary rounded-xl font-semibold transition-colors duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
