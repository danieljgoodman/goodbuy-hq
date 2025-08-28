'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Play,
  TrendingUp,
  Shield,
  Zap,
  Sparkles,
  Brain,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Brain className="w-4 h-4" />
              <span>AI-Powered Business Intelligence</span>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>

            {/* Main Headline */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Transform Your Business
                <motion.span
                  className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Data into Intelligence
                </motion.span>
                with AI
              </h1>
              <motion.p
                className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Advanced machine learning algorithms analyze your business
                metrics, market dynamics, and growth patterns to deliver
                unprecedented insights that drive strategic decisions.
              </motion.p>
            </motion.div>

            {/* Key Benefits */}
            <motion.div
              className="flex flex-wrap gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 font-medium">
                  98% Prediction Accuracy
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 font-medium">
                  Real-time Processing
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 font-medium">
                  Enterprise Security
                </span>
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Link href="/auth/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white group border-0 shadow-lg shadow-cyan-500/25"
                  >
                    Start AI Analysis
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:text-cyan-300 border border-white/20 hover:border-cyan-300/50 group backdrop-blur-sm"
                >
                  <Play className="mr-2 w-4 h-4" />
                  View Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <motion.p
                className="text-sm text-gray-400 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                Trusted by 50,000+ businesses and leading investors
              </motion.p>
              <motion.div
                className="flex items-center space-x-8 opacity-60"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                <motion.div
                  className="text-gray-400 font-semibold"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  OpenAI
                </motion.div>
                <motion.div
                  className="text-gray-400 font-semibold"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Anthropic
                </motion.div>
                <motion.div
                  className="text-gray-400 font-semibold"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Scale AI
                </motion.div>
                <motion.div
                  className="text-gray-400 font-semibold"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Replicate
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - AI Dashboard */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Main Dashboard Preview */}
            <motion.div
              className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="space-y-6">
                {/* Header */}
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    AI Business Intelligence
                  </h3>
                  <motion.div
                    className="w-3 h-3 bg-green-400 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Main Value Display */}
                <motion.div
                  className="text-center py-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.div
                    className="text-4xl font-bold text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    $3.2M
                  </motion.div>
                  <motion.div
                    className="text-sm text-cyan-300 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                  >
                    AI-Predicted Valuation
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center mt-2 text-green-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+24% confidence boost</span>
                  </motion.div>
                </motion.div>

                {/* AI Metrics */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                >
                  <motion.div
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    whileHover={{
                      scale: 1.02,
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-white"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      94.7%
                    </motion.div>
                    <div className="text-xs text-gray-400">AI Confidence</div>
                  </motion.div>
                  <motion.div
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    whileHover={{
                      scale: 1.02,
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="text-2xl font-bold text-white"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      2.3s
                    </motion.div>
                    <div className="text-xs text-gray-400">Analysis Time</div>
                  </motion.div>
                </motion.div>

                {/* AI Progress Indicators */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Neural Processing</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6, duration: 0.6 }}
                      >
                        98%
                      </motion.span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '98%' }}
                        transition={{
                          delay: 1.7,
                          duration: 1.5,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Pattern Recognition</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                      >
                        96%
                      </motion.span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '96%' }}
                        transition={{
                          delay: 1.9,
                          duration: 1.5,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Floating AI Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-400/20 to-emerald-600/20 backdrop-blur-sm rounded-lg p-3 border border-green-400/30"
                animate={{
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 3,
                }}
              >
                <Sparkles className="w-6 h-6 text-green-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
