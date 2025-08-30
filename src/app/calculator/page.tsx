import { Metadata } from 'next'
import { BusinessEvaluationForm } from '@/components/calculator/business-evaluation-form'

export const metadata: Metadata = {
  title: 'Business Evaluation Calculator',
  description:
    'Get your business valued by AI in minutes. Our advanced calculator uses multiple valuation methods including revenue multiples, DCF, and asset-based approaches.',
  keywords: [
    'business valuation calculator',
    'company valuation tool',
    'business worth calculator',
    'startup valuation',
    'DCF calculator',
    'business appraisal',
  ],
}

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="container mx-auto py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Advanced Business
            <span className="text-primary block">Evaluation Calculator</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get a comprehensive valuation of your business using multiple proven
            methods. Our AI-powered calculator analyzes your financials, market
            position, and industry benchmarks to provide an accurate assessment
            of your company&apos;s worth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: 'Multiple Methods',
              description:
                'Revenue multiple, DCF, P/E ratio, and asset-based valuations',
              icon: '📊',
            },
            {
              title: 'Industry Benchmarks',
              description:
                'Compare against 15+ industry-specific valuation multiples',
              icon: '🏭',
            },
            {
              title: 'Risk Assessment',
              description:
                'Comprehensive analysis of business and market risks',
              icon: '⚖️',
            },
            {
              title: 'Professional Report',
              description:
                'Detailed PDF report with charts and recommendations',
              icon: '📋',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Calculator Form */}
        <BusinessEvaluationForm />
      </div>
    </div>
  )
}
