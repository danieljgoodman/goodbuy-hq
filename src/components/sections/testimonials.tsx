'use client'

import { Star, Quote } from 'lucide-react'
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
  { value: '10,000+', label: 'Businesses Valued' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '$2.8B', label: 'Total Value Analyzed' },
  { value: '4.9/5', label: 'User Rating' },
]

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-secondary-600 leading-relaxed">
            Join thousands of business owners, investors, and advisors who rely
            on our AI-powered platform for accurate business valuations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="text-secondary-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="hover:shadow-xl transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary-300" />

                  {/* Rating */}
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-warning-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Quote */}
                <blockquote className="text-secondary-700 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Metrics */}
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-secondary-900">
                    {testimonial.metrics.value}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {testimonial.metrics.label}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {/* Author */}
                <div className="flex items-center w-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold text-lg">
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-secondary-900">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-secondary-600">
                      {testimonial.role}, {testimonial.company}
                    </CardDescription>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-br from-primary-50 via-white to-accent-50 border-primary-200 max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12 text-center">
              <CardTitle className="text-2xl lg:text-3xl font-semibold text-secondary-900 mb-4">
                Ready to join our success stories?
              </CardTitle>
              <CardDescription className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
                Get your business valued by AI in minutes and discover insights
                that could transform your company's future.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <Button className="px-8 py-4 text-lg font-medium" size="lg">
                  Start Your Free Valuation
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg font-medium border-secondary-300 hover:border-primary-300 text-secondary-700 hover:text-primary-600"
                  size="lg"
                >
                  View Sample Report
                </Button>
              </div>
              <p className="text-sm text-secondary-500">
                No credit card required • Get results in 5 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
