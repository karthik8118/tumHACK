import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Users, 
  Lightbulb, 
  Target, 
  DollarSign,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Brain,
  Sparkles,
  AlertCircle,
  File,
  X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { backendService } from '../services/backend'
import toast from 'react-hot-toast'

const StartupForm = () => {
  const { state, actions } = useApp()
  const { sendStartupAnalysis } = useWebSocket()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAdvancedForm, setShowAdvancedForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    authors: '',
    technology: '',
    market: '',
    team: '',
    funding: '',
    impact: '',
    pdfFile: null,
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    actions.updateStartupData({ [field]: value })
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    setUploadedFile(file)
    setIsAnalyzing(true)
    actions.setAnalyzing(true)
    actions.updateAnalysisProgress(0)

    try {
      // Use direct API call for PDF analysis
      const result = await backendService.analyzePDF(file)
      if (result && result.unicorn_potential_score !== undefined) {
        actions.setAnalysisResults(result)
        toast.success('Analysis completed!')
        // Navigate to results page
        window.location.href = '/results'
      } else {
        toast.error('Analysis failed: Invalid response from server')
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to upload file: ' + error.message)
    } finally {
      setIsAnalyzing(false)
      actions.setAnalyzing(false)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a PDF file')
      return
    }

    actions.setAnalyzing(true)
    actions.updateAnalysisProgress(0)

    try {
      // Try WebSocket first, then fallback to direct API
      const success = sendStartupAnalysis({
        name: formData.name,
        description: formData.description,
        authors: formData.authors,
        technology: formData.technology,
        market: formData.market,
        team: formData.team,
        funding: formData.funding,
        impact: formData.impact,
        pdfFile: formData.pdfFile
      })

      if (!success) {
        // Fallback to direct API call
        try {
          const result = await backendService.analyzeText(formData.description)
          if (result && result.unicorn_potential_score !== undefined) {
            actions.setAnalysisResults(result)
            toast.success('Analysis completed!')
            // Navigate to results page
            window.location.href = '/results'
          } else {
            toast.error('Analysis failed: Invalid response from server')
          }
        } catch (apiError) {
          console.error('API fallback error:', apiError)
          toast.error('Analysis failed: ' + (apiError.message || 'Server connection error'))
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed')
    } finally {
      actions.setAnalyzing(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        handleFileUpload(file)
      } else {
        toast.error('Please upload a PDF or text file')
      }
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        handleFileUpload(file)
      } else {
        toast.error('Please upload a PDF or text file')
      }
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFormData(prev => ({ ...prev, pdfFile: null }))
    actions.updateStartupData({ pdfFile: null })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            MPG Unicorn Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your research paper or startup document for comprehensive AI-powered unicorn potential analysis
          </p>
        </motion.div>

        {/* Main Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Your Document
            </h2>
            <p className="text-gray-600">
              Simply upload a PDF or text file containing your research or startup information
            </p>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    File Uploaded Successfully!
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <File className="w-5 h-5" />
                    <span>{uploadedFile.name}</span>
                    <button
                      onClick={removeFile}
                      className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isAnalyzing && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Analyzing document...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drag & drop your file here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose File
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Supports PDF and text files up to 10MB
                </p>
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvancedForm(!showAdvancedForm)}
              className="flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <Users className="w-5 h-5 mr-2" />
              {showAdvancedForm ? 'Hide' : 'Show'} Advanced Form
            </motion.button>
          </div>
        </motion.div>

        {/* Advanced Form (Collapsible) */}
        <AnimatePresence>
          {showAdvancedForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Additional Information (Optional)
              </h3>
              <p className="text-gray-600 mb-6">
                Provide additional details to enhance the analysis accuracy
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter startup name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authors/Team
                  </label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => handleInputChange('authors', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team members or authors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technology Stack
                  </label>
                  <input
                    type="text"
                    value={formData.technology}
                    onChange={(e) => handleInputChange('technology', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the technology used"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Market
                  </label>
                  <input
                    type="text"
                    value={formData.market}
                    onChange={(e) => handleInputChange('market', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your target market"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Requirements
                  </label>
                  <input
                    type="text"
                    value={formData.funding}
                    onChange={(e) => handleInputChange('funding', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe funding needs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Impact
                  </label>
                  <input
                    type="text"
                    value={formData.impact}
                    onChange={(e) => handleInputChange('impact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe expected impact"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Progress */}
        {state.analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing Your Startup
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI agents are evaluating your startup across multiple dimensions...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {state.analysisProgress}% Complete
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default StartupForm