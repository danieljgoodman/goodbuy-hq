'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Target, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import type { BusinessData } from '@/types/business';
import type { BusinessAnalysis } from '@/lib/business-analysis-agent';

interface BusinessAnalysisPanelProps {
  businessData: BusinessData;
  onAnalysisComplete?: (analysis: BusinessAnalysis) => void;
}

export default function BusinessAnalysisPanel({ 
  businessData, 
  onAnalysisComplete 
}: BusinessAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeBusinesss = async () => {
    if (!businessData.businessName || !businessData.industry) {
      setError('Business name and industry are required for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/business-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      onAnalysisComplete?.(data.analysis);
    } catch (error: any) {
      setError(error.message || 'Failed to analyze business');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Business Analysis
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Get AI-powered insights into your business performance
          </p>
        </div>

        <button
          onClick={analyzeBusinesss}
          disabled={loading || !businessData.businessName}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Business
            </>
          )}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4"
        >
          <p className="text-red-800 text-sm">{error}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Financial Health</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.financialHealth.score)}`}>
                  {analysis.financialHealth.score}/100
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Market Position</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.marketPosition.competitiveness)}`}>
                  {analysis.marketPosition.competitiveness}/100
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Risk Level</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.riskAssessment.level)}`}>
                  {analysis.riskAssessment.level.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Detailed Sections */}
            {[
              {
                key: 'financial',
                title: 'Financial Analysis',
                icon: TrendingUp,
                data: analysis.financialHealth,
                color: 'green'
              },
              {
                key: 'market',
                title: 'Market Position',
                icon: Target,
                data: analysis.marketPosition,
                color: 'blue'
              },
              {
                key: 'growth',
                title: 'Growth Potential',
                icon: Sparkles,
                data: analysis.growthPotential,
                color: 'purple'
              },
              {
                key: 'recommendations',
                title: 'AI Recommendations',
                icon: Lightbulb,
                data: analysis.recommendations,
                color: 'yellow'
              }
            ].map((section) => (
              <motion.div key={section.key} className="bg-white rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className={`w-5 h-5 text-${section.color}-600`} />
                    <span className="font-medium text-gray-900">{section.title}</span>
                  </div>
                  {expandedSections.has(section.key) ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.has(section.key) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 p-4"
                    >
                      {section.key === 'financial' && (
                        <div className="space-y-3">
                          {section.data.strengths?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {section.data.strengths.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.data.concerns?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-red-800 mb-2">Concerns</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {section.data.concerns.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {section.key === 'market' && (
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-blue-800 mb-2">Market Share</h5>
                            <p className="text-sm text-gray-700">{section.data.marketShare}</p>
                          </div>
                          {section.data.differentiators?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-800 mb-2">Competitive Advantages</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {section.data.differentiators.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {section.key === 'growth' && (
                        <div className="space-y-3">
                          <div className={`p-3 rounded-lg ${getScoreBackground(section.data.score)}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Growth Score</span>
                              <span className={`text-lg font-bold ${getScoreColor(section.data.score)}`}>
                                {section.data.score}/100
                              </span>
                            </div>
                          </div>
                          {section.data.opportunities?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-purple-800 mb-2">Opportunities</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {section.data.opportunities.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {section.key === 'recommendations' && (
                        <div className="space-y-4">
                          {['immediate', 'shortTerm', 'longTerm'].map((timeframe) => (
                            <div key={timeframe}>
                              <h5 className="font-medium text-yellow-800 mb-2 capitalize">
                                {timeframe === 'shortTerm' ? 'Short Term' : 
                                 timeframe === 'longTerm' ? 'Long Term' : timeframe} Actions
                              </h5>
                              <ul className="list-disc list-inside space-y-1">
                                {(section.data as any)[timeframe]?.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}