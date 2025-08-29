'use client'

import React from 'react'
import {
  Shield,
  CheckCircle,
  Award,
  Lock,
  Users,
  TrendingUp,
  Star,
  Globe,
  Zap,
  Building2,
} from 'lucide-react'

interface TrustIndicatorProps {
  variant?: 'primary' | 'secondary' | 'success' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  showAll?: boolean
}

export const TrustIndicators: React.FC<TrustIndicatorProps> = ({
  variant = 'primary',
  size = 'md',
  showAll = false,
}) => {
  const indicators = [
    {
      icon: Shield,
      text: '256-bit SSL Encryption',
      metric: 'Bank-grade Security',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
    },
    {
      icon: CheckCircle,
      text: 'SOC 2 Certified',
      metric: 'Compliance Verified',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      icon: Users,
      text: '50,000+ Users',
      metric: 'Trusted Globally',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
    },
    {
      icon: Award,
      text: '98% Accuracy Rate',
      metric: 'Proven Results',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
    },
  ]

  const primaryIndicators = showAll ? indicators : indicators.slice(0, 2)

  if (variant === 'minimal') {
    return (
      <div className="flex flex-wrap gap-2">
        {primaryIndicators.map((indicator, index) => (
          <div key={index} className="security-indicator">
            <indicator.icon className="h-4 w-4" />
            <span className="text-xs">{indicator.text}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {indicators.map((indicator, index) => (
        <div
          key={index}
          className={`trust-badge ${indicator.bgColor} hover:scale-105 transition-transform duration-200`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${indicator.color.replace('text-', 'bg-').replace('-600', '-100')}`}
            >
              <indicator.icon className={`h-5 w-5 ${indicator.color}`} />
            </div>
            <div>
              <div className="font-semibold text-sm">{indicator.text}</div>
              <div className="text-xs opacity-70">{indicator.metric}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const SecurityBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 py-6">
      <div className="trust-badge">
        <Lock className="h-4 w-4" />
        <span>SSL Secured</span>
      </div>
      <div className="trust-badge">
        <Shield className="h-4 w-4" />
        <span>GDPR Compliant</span>
      </div>
      <div className="trust-badge">
        <Award className="h-4 w-4" />
        <span>ISO 27001</span>
      </div>
      <div className="trust-badge">
        <Building2 className="h-4 w-4" />
        <span>Enterprise Ready</span>
      </div>
    </div>
  )
}

export const TrustMetrics: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-6 justify-center items-center py-8">
      <div className="text-center">
        <div className="trust-metric">$2.8B+</div>
        <div className="text-sm text-muted-foreground mt-1">
          Valuations Completed
        </div>
      </div>
      <div className="text-center">
        <div className="trust-metric">98%</div>
        <div className="text-sm text-muted-foreground mt-1">Accuracy Rate</div>
      </div>
      <div className="text-center">
        <div className="trust-metric">50K+</div>
        <div className="text-sm text-muted-foreground mt-1">Happy Clients</div>
      </div>
      <div className="text-center">
        <div className="trust-metric">24/7</div>
        <div className="text-sm text-muted-foreground mt-1">Expert Support</div>
      </div>
    </div>
  )
}

export const ProfessionalCTA: React.FC<{
  text: string
  subtext?: string
  onClick?: () => void
  disabled?: boolean
}> = ({ text, subtext, onClick, disabled }) => {
  return (
    <div className="space-y-2">
      <button
        className="professional-cta px-8 py-4 rounded-lg text-lg font-bold"
        onClick={onClick}
        disabled={disabled}
      >
        {text}
      </button>
      {subtext && (
        <p className="text-sm text-muted-foreground text-center">{subtext}</p>
      )}
    </div>
  )
}

export default TrustIndicators
