'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Zap, RotateCcw } from 'lucide-react';

interface UsageStats {
  totalTokens: number;
  estimatedCost: number;
  costPerToken: number;
  lastUpdated: string;
}

export default function CostMonitor() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai-usage');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.usage);
      }
    } catch (error) {
      console.error('Failed to fetch AI usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetStats = async () => {
    try {
      const response = await fetch('/api/ai-usage', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to reset stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          AI Usage Monitor
        </h3>
        
        <button
          onClick={resetStats}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title="Reset usage stats"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Tokens Used</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalTokens.toLocaleString()}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Estimated Cost</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.estimatedCost.toFixed(4)}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Avg Cost/Token</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.costPerToken.toFixed(6)}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No AI usage data available yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Usage statistics will appear after your first AI analysis
          </p>
        </div>
      )}

      {stats && stats.lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}