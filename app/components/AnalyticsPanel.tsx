'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UsersIcon, 
  CpuChipIcon,
  CloudArrowUpIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  metrics: {
    totalGenerations: number
    uniqueUsers: number
    todayGenerations: number
    modelUsage: Record<string, number>
    priorityUsage: Record<string, number>
    generationTypes: Record<string, number>
    deployments: Record<string, number>
  }
  trends: {
    averageGenerationsPerUser: string
    mostPopularModel: string
    mostUsedPriority: string
    fullStackAdoption: string
  }
}

interface AnalyticsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalyticsPanel({ isOpen, onClose }: AnalyticsPanelProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics()
    }
  }, [isOpen])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/analytics')
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">CodeGenesis AI Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <CpuChipIcon className="w-6 h-6 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Total Generations</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{data.metrics.totalGenerations}</div>
                  <div className="text-sm text-gray-400 mt-1">Today: {data.metrics.todayGenerations}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <UsersIcon className="w-6 h-6 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Unique Users</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{data.metrics.uniqueUsers}</div>
                  <div className="text-sm text-gray-400 mt-1">Avg: {data.trends.averageGenerationsPerUser}/user</div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <CloudArrowUpIcon className="w-6 h-6 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Full-Stack Adoption</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{data.trends.fullStackAdoption}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {data.metrics.generationTypes.fullstack} full-stack projects
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <ChartBarIcon className="w-6 h-6 text-orange-400" />
                    <span className="text-sm font-medium text-orange-300">Top Model</span>
                  </div>
                  <div className="text-2xl font-bold text-white capitalize">{data.trends.mostPopularModel}</div>
                  <div className="text-sm text-gray-400 mt-1">Most used AI model</div>
                </div>
              </div>

              {/* Detailed Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Usage */}
                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Model Usage</h3>
                  <div className="space-y-3">
                    {Object.entries(data.metrics.modelUsage).map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{model}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(data.metrics.modelUsage))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Usage */}
                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Priority Preferences</h3>
                  <div className="space-y-3">
                    {Object.entries(data.metrics.priorityUsage).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{priority}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(data.metrics.priorityUsage))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generation Types */}
                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Generation Types</h3>
                  <div className="space-y-3">
                    {Object.entries(data.metrics.generationTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-300">
                          {type === 'single' ? '📄 Single Page' : '🚀 Full-Stack'}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(data.metrics.generationTypes))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployments */}
                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Deployment Platforms</h3>
                  <div className="space-y-3">
                    {Object.entries(data.metrics.deployments).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{platform}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${count > 0 ? (count / Math.max(...Object.values(data.metrics.deployments), 1)) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={fetchAnalytics}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Refresh Analytics</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Failed to load analytics data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}