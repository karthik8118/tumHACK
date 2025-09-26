import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Users, 
  Lightbulb, 
  DollarSign,
  Globe,
  Brain,
  Download,
  Share2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Star,
  Zap
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import toast from 'react-hot-toast'

const EvaluationResults = () => {
  const { state, actions } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMetric, setSelectedMetric] = useState(null)

  const results = state.analysisResults || {
    unicorn_potential_score: 75,
    tech_ip: {
      summary: { trl: 7, novelty_score: 8.5, patent_potential: 9 },
      analysis: "High technical readiness with strong innovation potential"
    },
    market: {
      market_size: "€2.5B",
      competitors: 12,
      market_gap: 8.2,
      analysis: "Large addressable market with significant competitive advantage"
    },
    team: {
      team_score_0_5: 4.2,
      missing_roles: ["Marketing", "Sales"],
      analysis: "Strong technical team, needs commercial expertise"
    },
    scaling: {
      scaling_score_0_5: 3.8,
      growth_potential: "High",
      analysis: "Good scalability potential with some operational challenges"
    },
    funding: {
      funding_score_0_5: 4.0,
      recommended_sources: ["VC", "Grants", "Corporate"],
      analysis: "Well-positioned for multiple funding sources"
    },
    impact: {
      impact_score_0_5: 4.5,
      sdg_alignment: ["SDG 3", "SDG 9", "SDG 11"],
      analysis: "Strong alignment with multiple UN Sustainable Development Goals"
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tech', label: 'Technology', icon: Lightbulb },
    { id: 'market', label: 'Market', icon: Target },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'scaling', label: 'Scaling', icon: TrendingUp },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'impact', label: 'Impact', icon: Globe },
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600 bg-success-100'
    if (score >= 60) return 'text-warning-600 bg-warning-100'
    return 'text-danger-600 bg-danger-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const chartData = [
    { name: 'Technology', score: results.tech_ip?.summary?.trl * 10 || 70, max: 100 },
    { name: 'Market', score: results.market?.market_gap * 10 || 82, max: 100 },
    { name: 'Team', score: results.team?.team_score_0_5 * 20 || 84, max: 100 },
    { name: 'Scaling', score: results.scaling?.scaling_score_0_5 * 20 || 76, max: 100 },
    { name: 'Funding', score: results.funding?.funding_score_0_5 * 20 || 80, max: 100 },
    { name: 'Impact', score: results.impact?.impact_score_0_5 * 20 || 90, max: 100 },
  ]

  const radarData = [
    { subject: 'Innovation', A: results.tech_ip?.summary?.novelty_score * 10 || 85, fullMark: 100 },
    { subject: 'Market Size', A: results.market?.market_gap * 10 || 82, fullMark: 100 },
    { subject: 'Team Strength', A: results.team?.team_score_0_5 * 20 || 84, fullMark: 100 },
    { subject: 'Scalability', A: results.scaling?.scaling_score_0_5 * 20 || 76, fullMark: 100 },
    { subject: 'Funding Ready', A: results.funding?.funding_score_0_5 * 20 || 80, fullMark: 100 },
    { subject: 'Impact', A: results.impact?.impact_score_0_5 * 20 || 90, fullMark: 100 },
  ]

  const pieData = [
    { name: 'Technology', value: results.tech_ip?.summary?.trl * 10 || 70, color: '#3b82f6' },
    { name: 'Market', value: results.market?.market_gap * 10 || 82, color: '#10b981' },
    { name: 'Team', value: results.team?.team_score_0_5 * 20 || 84, color: '#f59e0b' },
    { name: 'Scaling', value: results.scaling?.scaling_score_0_5 * 20 || 76, color: '#ef4444' },
    { name: 'Funding', value: results.funding?.funding_score_0_5 * 20 || 80, color: '#8b5cf6' },
    { name: 'Impact', value: results.impact?.impact_score_0_5 * 20 || 90, color: '#06b6d4' },
  ]

  const handleExport = () => {
    // Create a comprehensive report
    const report = {
      startup: state.startupData.name,
      timestamp: new Date().toISOString(),
      unicorn_potential_score: results.unicorn_potential_score,
      detailed_analysis: results
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.startupData.name || 'startup'}_evaluation_report.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Report exported successfully!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Startup Evaluation Results',
          text: `Check out my startup evaluation results! Score: ${results.unicorn_potential_score}/100`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Main Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-48 h-48 mx-auto relative"
          >
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-secondary-200"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - results.unicorn_potential_score / 100)}`}
                className="text-primary-600"
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - results.unicorn_potential_score / 100) }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">
                  {results.unicorn_potential_score}
                </div>
                <div className="text-sm text-secondary-600">Unicorn Potential</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getScoreColor(results.unicorn_potential_score)}`}>
            <Award className="w-4 h-4 mr-2" />
            {getScoreLabel(results.unicorn_potential_score)}
          </div>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-800 mb-1">
            {results.market?.market_size || '€2.5B'}
          </div>
          <div className="text-sm text-secondary-600">Market Size</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-800 mb-1">
            {results.team?.team_score_0_5 || 4.2}/5
          </div>
          <div className="text-sm text-secondary-600">Team Score</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-accent-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-800 mb-1">
            {results.tech_ip?.summary?.trl || 7}/9
          </div>
          <div className="text-sm text-secondary-600">Tech Readiness</div>
        </div>
      </motion.div>
    </div>
  )

  const renderDetailedTab = (tabId) => {
    const data = results[tabId]
    if (!data) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-secondary-800 mb-4 capitalize">
            {tabId.replace('_', ' ')} Analysis
          </h3>
          
          <div className="prose max-w-none">
            <p className="text-secondary-700 leading-relaxed">
              {data.analysis || `Detailed analysis for ${tabId} would appear here.`}
            </p>
          </div>
        </div>

        {/* Specific metrics for each tab */}
        {tabId === 'tech_ip' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Technology Readiness</h4>
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {data.summary?.trl || 7}/9
              </div>
              <div className="text-sm text-secondary-600">TRL Level</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Novelty Score</h4>
              <div className="text-3xl font-bold text-success-600 mb-1">
                {data.summary?.novelty_score || 8.5}/10
              </div>
              <div className="text-sm text-secondary-600">Innovation Level</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Patent Potential</h4>
              <div className="text-3xl font-bold text-accent-600 mb-1">
                {data.summary?.patent_potential || 9}/10
              </div>
              <div className="text-sm text-secondary-600">IP Strength</div>
            </div>
          </div>
        )}

        {tabId === 'market' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Market Size</h4>
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {data.market_size || '€2.5B'}
              </div>
              <div className="text-sm text-secondary-600">Addressable Market</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Competitors</h4>
              <div className="text-3xl font-bold text-warning-600 mb-1">
                {data.competitors || 12}
              </div>
              <div className="text-sm text-secondary-600">Identified</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-secondary-800 mb-2">Market Gap</h4>
              <div className="text-3xl font-bold text-success-600 mb-1">
                {data.market_gap || 8.2}/10
              </div>
              <div className="text-sm text-secondary-600">Opportunity</div>
            </div>
          </div>
        )}

        {tabId === 'team' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-semibold text-secondary-800 mb-4">Team Assessment</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <span className="font-medium">Overall Team Score</span>
                <span className="text-2xl font-bold text-primary-600">
                  {data.team_score_0_5 || 4.2}/5
                </span>
              </div>
              {data.missing_roles && data.missing_roles.length > 0 && (
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <h5 className="font-medium text-warning-800 mb-2">Missing Roles</h5>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_roles.map((role, index) => (
                      <span key={index} className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  if (!state.analysisResults && !results.unicorn_potential_score) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12"
          >
            <BarChart3 className="w-16 h-16 text-secondary-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-secondary-800 mb-4">
              No Analysis Results
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              Complete a startup evaluation to see your results here
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => actions.setCurrentStep(1)}
              className="btn-primary px-8 py-4 text-lg"
            >
              Start Evaluation
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Evaluation Results
            </h1>
            <p className="text-xl text-secondary-600">
              {state.startupData.name || 'Your Startup'} Analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="btn-secondary px-4 py-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="btn-primary px-4 py-2"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg mb-8"
        >
          <div className="border-b border-secondary-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? renderOverview() : renderDetailedTab(activeTab)}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EvaluationResults


