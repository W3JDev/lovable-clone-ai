'use client'

import { useState, useEffect } from 'react'
import { 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ClipboardDocumentIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface DeploymentProvider {
  name: string
  description: string
  features: string[]
  icon: string
  color: string
}

interface DeploymentPanelProps {
  code: string
  isOpen: boolean
  onClose: () => void
}

export function DeploymentPanel({ code, isOpen, onClose }: DeploymentPanelProps) {
  const [providers, setProviders] = useState<Record<string, DeploymentProvider>>({})
  const [selectedProvider, setSelectedProvider] = useState<string>('vercel')
  const [projectName, setProjectName] = useState('codegenesis-project')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProviders()
    }
  }, [isOpen])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/deploy')
      const data = await response.json()
      setProviders(data.providers)
    } catch (error) {
      console.error('Failed to fetch deployment providers:', error)
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          provider: selectedProvider,
          projectName,
        }),
      })
      
      const result = await response.json()
      setDeploymentResult(result)
      
      // Track deployment analytics
      if (result.success) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deployment',
            provider: selectedProvider
          })
        }).catch(err => console.warn('Analytics tracking failed:', err))
      }
    } catch (error) {
      console.error('Deployment failed:', error)
      setDeploymentResult({ error: 'Failed to generate deployment instructions' })
    } finally {
      setIsDeploying(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStep(index)
      setTimeout(() => setCopiedStep(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <CloudArrowUpIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Deploy Your Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {!deploymentResult ? (
            <div className="p-6 space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  placeholder="my-awesome-project"
                />
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Choose Deployment Provider
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(providers).map(([key, provider]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedProvider(key)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedProvider === key
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <h3 className="font-semibold text-white mb-1">{provider.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
                      <div className="space-y-1">
                        {provider.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-500">
                            <CheckCircleIcon className="w-3 h-3 mr-1 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isDeploying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating Instructions...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      <span>Generate Deployment Instructions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {deploymentResult.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400">{deploymentResult.error}</p>
                </div>
              ) : (
                <>
                  {/* Success Header */}
                  <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-green-400">Deployment Instructions Ready!</h3>
                      <p className="text-sm text-gray-400">
                        Estimated deployment time: {deploymentResult.estimatedTime}
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Deployment Steps</h4>
                    <div className="space-y-3">
                      {deploymentResult.instructions.steps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="text-gray-300 flex-1">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Command Line Instructions */}
                  {deploymentResult.instructions.commandLine.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">Command Line Instructions</h4>
                      <div className="space-y-2">
                        {deploymentResult.instructions.commandLine.map((command: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg font-mono text-sm">
                            <span className="text-gray-300 flex-1">{command}</span>
                            <button
                              onClick={() => copyToClipboard(command, index)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors"
                            >
                              {copiedStep === index ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Next Steps</h4>
                    <ul className="space-y-2">
                      {deploymentResult.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeploymentResult(null)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Deploy to Different Provider
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}