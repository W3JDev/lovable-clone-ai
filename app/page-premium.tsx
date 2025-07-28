'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUpIcon, ClipboardIcon, SparklesIcon, CommandLineIcon, EyeIcon } from '@heroicons/react/24/outline'
import { CodeBlock } from './components/CodeBlock'
import { PreviewPane } from './components/PreviewPane'
import { LoadingDots } from './components/LoadingDots'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [currentModel, setCurrentModel] = useState('gemini')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 flex h-screen">
        {/* Main Interface */}
        <div className={`${showPreview ? 'lg:w-1/2 w-full' : 'w-full'} flex flex-col transition-all duration-500 ease-in-out`}>
          
          {/* Premium Header */}
          <header className="p-4 sm:p-6 lg:p-8 border-b border-white/10 backdrop-blur-xl bg-white/5">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-pink-600 shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                      Lovable Clone
                    </h1>
                    <p className="text-gray-300 text-sm mt-1 hidden sm:block">AI-powered web development magic ✨</p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {generatedCode && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                    </button>
                  )}
                  
                  {/* Model selector */}
                  <select 
                    value={currentModel} 
                    onChange={(e) => setCurrentModel(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="gemini" className="bg-gray-900">Gemini 2.0</option>
                    <option value="deepseek" className="bg-gray-900">DeepSeek</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              
              {/* Welcome State */}
              {messages.length === 0 && (
                <div className="text-center py-12 sm:py-20">
                  <div className="mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 mb-6">
                      <CommandLineIcon className="w-12 h-12 text-orange-300" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Build anything with{' '}
                      <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                        AI magic
                      </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                      Describe your vision and watch as AI brings it to life with modern, responsive code
                    </p>
                  </div>
                  
                  {/* Example prompts */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {[
                      { icon: '🏪', title: 'Coffee Shop Landing', prompt: 'Create a modern landing page for a coffee shop with warm colors' },
                      { icon: '✅', title: 'Todo App', prompt: 'Build a sleek todo app with dark mode and animations' },
                      { icon: '💰', title: 'Pricing Table', prompt: 'Design a pricing table with three tiers and gradient effects' },
                      { icon: '🚀', title: 'Hero Section', prompt: 'Create an animated hero section with call-to-action' },
                      { icon: '📊', title: 'Dashboard Cards', prompt: 'Build responsive dashboard cards with charts' },
                      { icon: '🎨', title: 'Portfolio Site', prompt: 'Design a creative portfolio website with galleries' }
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(example.prompt)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-left group backdrop-blur-sm"
                      >
                        <div className="text-2xl mb-2">{example.icon}</div>
                        <h3 className="font-semibold text-white mb-1 group-hover:text-orange-300 transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {example.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white' 
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                    } rounded-2xl px-6 py-4 shadow-lg`}>
                      {message.type === 'assistant' ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-sm text-gray-300">AI Assistant</span>
                            </div>
                            {message.content && (
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                title="Copy code"
                              >
                                <ClipboardIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                              </button>
                            )}
                          </div>
                          <CodeBlock code={message.content} />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300">Generating magic...</span>
                        <LoadingDots />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Premium Input Section */}
          <div className="border-t border-white/10 backdrop-blur-xl bg-white/5">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to build... ✨"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none backdrop-blur-sm min-h-[60px] max-h-[120px] text-lg"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-3 right-3 p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/25"
                  >
                    <ArrowUpIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-3 flex items-center space-x-4">
                  <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Shift+Enter</kbd> for new line</span>
                  <span className="text-orange-400">•</span>
                  <span>Powered by {currentModel === 'gemini' ? 'Gemini 2.0 Flash' : 'DeepSeek'}</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block lg:w-1/2 border-l border-white/10 backdrop-blur-xl bg-white/5">
            <PreviewPane code={generatedCode} />
          </div>
        )}
        
        {/* Mobile Preview Overlay */}
        {showPreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="h-full bg-white/10 backdrop-blur-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
              <div className="h-[calc(100%-80px)]">
                <PreviewPane code={generatedCode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
