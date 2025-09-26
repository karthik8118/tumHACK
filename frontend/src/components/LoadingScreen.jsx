import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Zap, Target } from 'lucide-react'

const LoadingScreen = () => {
  const [currentIcon, setCurrentIcon] = useState(0)
  const [progress, setProgress] = useState(0)

  const icons = [
    { component: Brain, color: 'text-blue-500' },
    { component: Sparkles, color: 'text-purple-500' },
    { component: Zap, color: 'text-yellow-500' },
    { component: Target, color: 'text-green-500' }
  ]

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Icon rotation
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % icons.length)
    }, 500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(iconInterval)
    }
  }, [])

  const CurrentIcon = icons[currentIcon].component

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center z-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Main Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Rotating Icons */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-24 h-24 mx-auto"
            >
              {icons.map((icon, index) => {
                const IconComponent = icon.component
                const angle = (index * 90) * (Math.PI / 180)
                const radius = 40
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                
                return (
                  <motion.div
                    key={index}
                    className="absolute w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      left: `calc(50% + ${x}px - 16px)`,
                      top: `calc(50% + ${y}px - 16px)`,
                    }}
                    animate={{ scale: currentIcon === index ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconComponent className={`w-4 h-4 ${icon.color}`} />
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-4xl font-bold gradient-text mb-4"
        >
          MPG Unicorn Analyst
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-secondary-600 text-lg mb-8"
        >
          Initializing AI-powered unicorn analysis system...
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-80 mx-auto"
        >
          <div className="bg-secondary-200 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-secondary-500">
            {Math.round(progress)}% Complete
          </p>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex justify-center space-x-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 text-sm text-secondary-500"
        >
          <motion.p
            key={currentIcon}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentIcon === 0 && "Loading AI unicorn analysis agents..."}
            {currentIcon === 1 && "Preparing breakthrough evaluation tools..."}
            {currentIcon === 2 && "Connecting to research database..."}
            {currentIcon === 3 && "Ready to analyze your unicorn potential!"}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen


