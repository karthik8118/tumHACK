import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  DollarSign, 
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const Dashboard = () => {
  const { state, actions } = useApp()
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('overview')

  // Get real data from analysis results
  const getRealData = () => {
    const analysisResults = state.analysisResults
    const currentTime = new Date().toISOString()
    
    return {
      evaluations: analysisResults ? [
        { 
          id: 1, 
          name: state.startupData?.name || 'Current Analysis', 
          score: analysisResults.unicorn_potential_score || 0, 
          date: currentTime.split('T')[0], 
          status: 'completed',
          details: analysisResults
        }
      ] : [],
      analytics: {
        totalEvaluations: analysisResults ? 1 : 0,
        averageScore: analysisResults?.unicorn_potential_score || 0,
        successRate: analysisResults?.unicorn_potential_score >= 70 ? 100 : 0,
        activeUsers: state.analyzing ? 1 : 0
      },
      trends: analysisResults ? [
        { date: new Date().toISOString().split('T')[0], evaluations: 1, score: analysisResults.unicorn_potential_score || 0 }
      ] : [],
      metrics: analysisResults ? [
        { name: 'Technology', value: analysisResults.tech_ip?.tech_score || 0, change: 'Live', color: 'blue' },
        { name: 'Market', value: analysisResults.market?.market_score || 0, change: 'Live', color: 'green' },
        { name: 'Team', value: analysisResults.team?.team_score || 0, change: 'Live', color: 'yellow' },
        { name: 'Scaling', value: analysisResults.scaling?.scaling_score || 0, change: 'Live', color: 'purple' },
        { name: 'Funding', value: analysisResults.funding?.funding_score || 0, change: 'Live', color: 'pink' },
        { name: 'Impact', value: analysisResults.impact?.impact_score || 0, change: 'Live', color: 'cyan' }
      ] : []
    }
  }
  
  const data = getRealData()

  const quickActions = [
    {
      icon: RefreshCw,
      label: 'Refresh Data',
      action: () => actions.setAnalyzing(true),
      color: 'bg-blue-500'
    },
    {
      icon: Download,
      label: 'Export Report',
      action: () => console.log('Exporting report...'),
      color: 'bg-green-500'
    },
    {
      icon: Filter,
      label: 'Filter Results',
      action: () => console.log('Opening filters...'),
      color: 'bg-purple-500'
    }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Startup Evaluation Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time analysis and insights for your startup evaluations
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3`}
            >
              <action.icon className="w-6 h-6" />
              <span className="font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{data.analytics.totalEvaluations}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{data.analytics.averageScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.analytics.successRate}%</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.analytics.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Metrics Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.metrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.metrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Detailed Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Evaluations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Evaluations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {evaluation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluation.score >= 70 ? 'bg-green-100 text-green-800' :
                        evaluation.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluation.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        evaluation.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard