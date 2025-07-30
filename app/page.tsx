'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ArrowUpIcon, 
  ClipboardIcon, 
  SparklesIcon, 
  CommandLineIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { CodeBlock } from './components/CodeBlock'
import { PreviewPane } from './components/PreviewPane'
import { LoadingDots } from './components/LoadingDots'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Project {
  id: string
  name: string
  preview: string
  code: string
  timestamp: Date
  tags: string[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [currentModel, setCurrentModel] = useState('gemini')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content, model: currentModel }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  assistantContent += data.content
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }
              } catch (error) {
                console.error('Error parsing chunk:', error)
              }
            }
          }
        }
      }

      setGeneratedCode(assistantContent)

      // Auto-save project
      const newProject: Project = {
        id: Date.now().toString(),
        name: userMessage.content.slice(0, 50) + '...',
        preview: assistantContent,
        code: assistantContent,
        timestamp: new Date(),
        tags: extractTags(userMessage.content)
      }
      setProjects(prev => [newProject, ...prev])

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while generating code. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const extractTags = (prompt: string): string[] => {
    const commonTags = ['react', 'html', 'css', 'javascript', 'landing', 'component', 'dashboard', 'form']
    return commonTags.filter(tag => prompt.toLowerCase().includes(tag))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const downloadProject = (project: Project) => {
    const blob = new Blob([project.code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const examplePrompts = [
    { 
      icon: '🏪', 
      title: 'Coffee Shop Landing', 
      prompt: 'Create a premium coffee shop landing page with hero section, menu cards, and contact form',
      gradient: 'from-amber-400 to-orange-600'
    },
    { 
      icon: '📱', 
      title: 'Mobile App UI', 
      prompt: 'Design a modern mobile app interface with glassmorphism and smooth animations',
      gradient: 'from-blue-400 to-purple-600'
    },
    { 
      icon: '💼', 
      title: 'SaaS Dashboard', 
      prompt: 'Build a comprehensive SaaS dashboard with charts, metrics, and user management',
      gradient: 'from-green-400 to-teal-600'
    },
    { 
      icon: '🎨', 
      title: 'Portfolio Site', 
      prompt: 'Create a creative portfolio website with 3D effects and project galleries',
      gradient: 'from-pink-400 to-red-600'
    },
    { 
      icon: '🛍️', 
      title: 'E-commerce Store', 
      prompt: 'Design an e-commerce product page with shopping cart and checkout flow',
      gradient: 'from-purple-400 to-indigo-600'
    },
    { 
      icon: '📊', 
      title: 'Analytics Platform', 
      prompt: 'Build an analytics platform with real-time data visualization and reports',
      gradient: 'from-cyan-400 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden will-change-transform transform-gpu-optimized">
      {/* Ultra Premium Background Effects - GPU OPTIMIZED */}
      <div className="absolute inset-0 will-change-transform">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 animate-gradient transform3d-gpu"></div>
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl animate-float-3d transform3d-gpu"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/10 to-transparent rounded-full blur-3xl animate-float-3d delay-2000 transform3d-gpu"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-2xl animate-pulse-glow transform3d-gpu"></div>
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row h-screen h-[100dvh] contain-layout-style-paint">
        {/* Ultra Premium Sidebar - Mobile Responsive */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 border-r border-white/10 glass-ultra">
          <div className="flex-shrink-0 p-4 lg:p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="ios-card p-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                      {project.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadProject(project)
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {project.timestamp.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface - FULL WIDTH RESPONSIVE REVOLUTION */}
        <div className={`${showPreview ? 'lg:w-1/2 w-full' : 'flex-1'} flex flex-col transition-all duration-700 ease-in-out min-w-0 will-change-transform transform3d-gpu`}>
          
          {/* Ultra Premium Header - FULL WIDTH LIBERATION */}
          <header className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 glass-ultra will-change-transform transform3d-gpu">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 contain-layout">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg animate-pulse-glow will-change-transform">
                    <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent will-change-transform">
                      Lovable Ultra
                    </h1>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1">Next-generation AI development platform ✨</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                  {generatedCode && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="btn-ultra flex items-center justify-center space-x-2 flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                      <span className="sm:hidden">{showPreview ? 'Hide' : 'Preview'}</span>
                    </button>
                  )}
                  
                  <select 
                    value={currentModel} 
                    onChange={(e) => setCurrentModel(e.target.value)}
                    className="input-ultra text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 flex-1 sm:flex-none"
                  >
                    <option value="gemini" className="bg-gray-900">Gemini 2.0</option>
                    <option value="deepseek" className="bg-gray-900">DeepSeek V3</option>
                  </select>
                  
                  <button className="p-2 sm:p-3 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300">
                    <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Messages Container - FULL WIDTH RESPONSIVE REVOLUTION */}
          <div className="flex-1 overflow-y-auto min-h-0 will-change-scroll contain-layout-style">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-full">
              
              {/* Ultra Premium Welcome State - FULL WIDTH */}
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12 lg:py-20 animate-scale-in-3d will-change-transform">
                  <div className="mb-8 sm:mb-12">
                    <div className="inline-flex p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-ultra mb-6 sm:mb-8 card-3d transform3d-gpu">
                      <CommandLineIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 perspective-1000 will-change-transform">
                      Build the future with{' '}
                      <span className="text-gradient animate-gradient">
                        AI precision
                      </span>
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
                      Experience the next evolution of AI-powered development with ultra-premium tools and interfaces
                    </p>
                  </div>
                  
                  {/* 3D Example Cards - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
                    {examplePrompts.map((example, index) => (
                      <div
                        key={index}
                        onClick={() => setInput(example.prompt)}
                        className="card-3d ios-card p-6 cursor-pointer group perspective-1000 animate-slide-up-3d"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${example.gradient} flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {example.icon}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                          {example.prompt.length > 80 ? example.prompt.substring(0, 80) + '...' : example.prompt}
                        </p>
                        <div className="mt-3 sm:mt-4 flex items-center text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Try this prompt
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Messages */}
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-3d`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`max-w-4xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 text-white card-3d' 
                        : 'glass-ultra text-white ios-card'
                    } rounded-3xl px-8 py-6 shadow-ultra`}>
                      {message.type === 'assistant' ? (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-300">AI Assistant</span>
                              <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                                {currentModel === 'gemini' ? 'Gemini 2.0' : 'DeepSeek V3'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                                title="Copy code"
                              >
                                <ClipboardIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  const project: Project = {
                                    id: Date.now().toString(),
                                    name: 'Downloaded Project',
                                    preview: message.content,
                                    code: message.content,
                                    timestamp: new Date(),
                                    tags: []
                                  }
                                  downloadProject(project)
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                                title="Download project"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group">
                                <BookmarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="code-premium">
                            <CodeBlock code={message.content} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg font-medium whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-scale-in-3d">
                    <div className="glass-ultra rounded-3xl px-8 py-6 ios-card">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 font-medium">Generating ultra-premium code...</span>
                        <LoadingDots />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Ultra Premium Input Section - FULL WIDTH RESPONSIVE REVOLUTION */}
          <div className="flex-shrink-0 border-t border-white/10 glass-ultra will-change-transform">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <form onSubmit={handleSubmit} className="relative contain-layout">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your vision in detail... ✨"
                    className="input-ultra w-full text-base sm:text-lg min-h-[70px] sm:min-h-[80px] max-h-[140px] sm:max-h-[160px] pr-16 sm:pr-20 transform3d-gpu will-change-scroll"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 btn-ultra p-3 sm:p-4 rounded-xl sm:rounded-2xl will-change-transform"
                  >
                    <ArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-400">
                    <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Enter</kbd> to send</span>
                    <span className="hidden sm:inline">Use <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Shift+Enter</kbd> for new line</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-400">
                      Powered by {currentModel === 'gemini' ? 'Gemini 2.0' : 'DeepSeek V3'}
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Ultra Premium Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block lg:w-1/2 border-l border-white/10">
            <PreviewPane code={generatedCode} />
          </div>
        )}
        
        {/* Mobile Preview Overlay - Enhanced */}
        {showPreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
            <div className="h-full flex flex-col glass-ultra">
              <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Live Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
                >
                  <span className="text-white text-xl sm:text-2xl">×</span>
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <PreviewPane code={generatedCode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
