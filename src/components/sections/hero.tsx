'use client'

import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-accent-100 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Business Valuation</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
                Get Your Business 
                <span className="text-primary-600 block">
                  Valued by AI
                </span>
                in Minutes
              </h1>
              <p className="text-lg sm:text-xl text-secondary-600 leading-relaxed max-w-2xl">
                Our advanced AI analyzes your financials, market position, and growth potential to provide accurate business valuations trusted by thousands of entrepreneurs and investors.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-secondary-700 font-medium">95% Accuracy Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-secondary-700 font-medium">5-Minute Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-secondary-700 font-medium">Bank-Grade Security</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white group">
                  Start Free Valuation
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="ghost" 
                className="text-secondary-700 hover:text-primary-600 group"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500 mb-4">Trusted by 10,000+ businesses worldwide</p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-secondary-400 font-semibold">Microsoft</div>
                <div className="text-secondary-400 font-semibold">Goldman Sachs</div>
                <div className="text-secondary-400 font-semibold">Y Combinator</div>
                <div className="text-secondary-400 font-semibold">Sequoia</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Elements */}
          <div className="relative animate-slide-up">
            {/* Main Dashboard Preview */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-secondary-200 p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-secondary-900">Business Valuation Report</h3>
                  <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                </div>

                {/* Main Value */}
                <div className="text-center py-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                  <div className="text-4xl font-bold text-primary-600">$2.4M</div>
                  <div className="text-sm text-primary-700 mt-1">Estimated Business Value</div>
                  <div className="flex items-center justify-center mt-2 text-success-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+18% vs. industry avg</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-secondary-900">8.2</div>
                    <div className="text-xs text-secondary-600">Financial Health</div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-secondary-900">9.1</div>
                    <div className="text-xs text-secondary-600">Growth Score</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-secondary-600 mb-1">
                      <span>Market Position</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-secondary-600 mb-1">
                      <span>Risk Assessment</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div className="bg-success-500 h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-secondary-200">
                <Shield className="w-6 h-6 text-success-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-secondary-200">
                <TrendingUp className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}