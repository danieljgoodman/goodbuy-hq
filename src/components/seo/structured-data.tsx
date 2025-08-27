import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'service' | 'article'
  data?: Record<string, any>
}

const baseStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://goodbuyhq.com/#organization',
      name: 'GoodBuy HQ',
      alternateName: 'GoodBuy',
      description:
        'AI-powered business valuation platform trusted by thousands of entrepreneurs and investors worldwide.',
      url: 'https://goodbuyhq.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://goodbuyhq.com/logo.png',
        width: 240,
        height: 60,
      },
      foundingDate: '2024',
      founder: {
        '@type': 'Person',
        name: 'Daniel Goodman',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'hello@goodbuyhq.com',
        availableLanguage: 'English',
      },
      sameAs: [
        'https://linkedin.com/company/goodbuy-hq',
        'https://twitter.com/goodbuyhq',
        'https://github.com/goodbuy-hq',
      ],
      areaServed: 'Worldwide',
      serviceType: [
        'Business Valuation',
        'Financial Analysis',
        'Market Analysis',
        'Growth Assessment',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://goodbuyhq.com/#website',
      url: 'https://goodbuyhq.com',
      name: 'GoodBuy HQ',
      description:
        'Get your business valued by AI in minutes. Our advanced platform provides accurate business valuations, financial health assessments, market analysis, and growth scores.',
      publisher: {
        '@id': 'https://goodbuyhq.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://goodbuyhq.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Service',
      '@id': 'https://goodbuyhq.com/#service',
      name: 'AI Business Valuation',
      description:
        "Advanced AI-powered business valuation service that analyzes your company's financials, market position, and growth potential.",
      provider: {
        '@id': 'https://goodbuyhq.com/#organization',
      },
      serviceType: 'Business Valuation',
      areaServed: 'Worldwide',
      audience: {
        '@type': 'Audience',
        audienceType: [
          'Business Owners',
          'Entrepreneurs',
          'Investors',
          'M&A Advisors',
          'Financial Analysts',
        ],
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceRange: 'Free - Premium Plans Available',
        category: 'Financial Services',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      },
    },
  ],
}

export function StructuredData({
  type = 'website',
  data,
}: StructuredDataProps) {
  const structuredData = data || baseStructuredData

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
