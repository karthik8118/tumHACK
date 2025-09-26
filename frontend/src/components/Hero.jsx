import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowRight,
  Play,
  Star,
  Target,
  Lightbulb
} from 'lucide-react'
import Confetti from 'react-confetti'

const Hero = () => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI agents evaluate your research breakthrough potential",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Comprehensive market analysis and competitor research",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Users,
      title: "Team Assessment",
      description: "Evaluate team composition and entrepreneurial readiness",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Live analysis updates and interactive AI conversations",
      color: "from-yellow-500 to-orange-600"
    }
  ]

  const stats = [
    { label: "Research Papers Analyzed", value: "10,000+", icon: Target },
    { label: "Startups Evaluated", value: "500+", icon: TrendingUp },
    { label: "Success Rate", value: "85%", icon: Star },
    { label: "AI Agents", value: "6", icon: Brain }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="gradient-text">MPG Unicorn Analyst</span>
              <br />
              <span className="text-secondary-800">AI-Powered Startup Evaluation</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-secondary-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your research into breakthrough startups with AI-powered analysis, 
              market intelligence, and real-time evaluation
            </motion.p>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="relative max-w-4xl mx-auto">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${features[currentFeature].color} text-white`}>
                    {React.createElement(features[currentFeature].icon, { className: "w-8 h-8" })}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-secondary-800 mb-2">
                  {features[currentFeature].title}
                </h3>
                <p className="text-secondary-600 text-lg">
                  {features[currentFeature].description}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link to="/evaluate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Evaluation
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2" />
                Try AI Chat
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-secondary-800 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-secondary-400 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-secondary-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero
