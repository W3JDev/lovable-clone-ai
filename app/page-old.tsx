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
        body: JSON.stringify({ prompt: userMessage.content }),
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
        id: (Date.now() + 2).toString(),
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
    <div className="flex h-screen">
      {/* Main Chat Interface */}
      <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col transition-all duration-300`}>
        {/* Header */}
        <header className="p-6 border-b border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Lovable Clone
              </h1>
              <p className="text-gray-400 text-sm mt-1">AI-powered web development</p>
            </div>
            {generatedCode && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Lovable Clone</h2>
              <p className="text-gray-400">Describe what you want to build, and I&apos;ll generate the code for you!</p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>Try: &quot;Create a landing page for a coffee shop&quot;</p>
                <p>Or: &quot;Build a todo app with React&quot;</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                }`}
              >
                {message.type === 'assistant' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Assistant</span>
                      {message.content && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <ClipboardIcon className="w-4 h-4" />
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
            <div className="flex justify-start animate-slide-up">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <LoadingDots />
                  <span className="text-gray-400">Generating code...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-800/50 backdrop-blur-sm">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none backdrop-blur-sm min-h-[80px] max-h-[120px]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>

      {/* Preview Pane */}
      {showPreview && (
        <div className="w-1/2 border-l border-gray-800/50">
          <PreviewPane code={generatedCode} />
        </div>
      )}
    </div>
  )
}