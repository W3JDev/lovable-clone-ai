'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { 
  PlayIcon, 
  ArrowPathIcon, 
  ArrowsPointingOutIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface PreviewPaneProps {
  code: string
}

export function PreviewPane({ code }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const updatePreview = useCallback(async () => {
    if (!code || !iframeRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      let htmlContent = ''
      
      // Enhanced HTML processing for better preview
      if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
        if (code.includes('```html')) {
          const htmlMatch = code.match(/```html\n?([\s\S]*?)\n?```/)
          htmlContent = htmlMatch ? htmlMatch[1] : code
        } else {
          htmlContent = code.replace(/```[\s\S]*?\n/, '').replace(/\n?```$/, '')
        }
      } else {
        const htmlBodyMatch = code.match(/```html\n?([\s\S]*?)\n?```/) ||
                             code.match(/<body[\s\S]*?<\/body>/) ||
                             code.match(/<div[\s\S]*?<\/div>/) ||
                             code.match(/<[^>]+>[\s\S]*?<\/[^>]+>/)
        
        const cssMatch = code.match(/```css\n?([\s\S]*?)\n?```/) ||
                        code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
        
        const jsMatch = code.match(/```javascript\n?([\s\S]*?)\n?```/) ||
                       code.match(/```js\n?([\s\S]*?)\n?```/) ||
                       code.match(/<script[^>]*>([\s\S]*?)<\/script>/)

        let bodyContent = ''
        let cssContent = ''
        let jsContent = ''

        if (htmlBodyMatch) {
          bodyContent = htmlBodyMatch[0]
            .replace(/```html\n?/, '')
            .replace(/\n?```$/, '')
        } else if (code.includes('<')) {
          bodyContent = code
        } else {
          bodyContent = `
            <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);">
                <h1 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 700;">AI Generated Content</h1>
                <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem;">Your generated code will appear here when it contains valid HTML.</p>
                <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 16px; font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9rem; text-align: left; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
${code.substring(0, 500)}${code.length > 500 ? '...' : ''}
                </div>
              </div>
            </div>
          `
        }

        if (cssMatch) {
          cssContent = cssMatch[1] || cssMatch[0]
            .replace(/```css\n?/, '')
            .replace(/\n?```$/, '')
            .replace(/<\/?style[^>]*>/g, '')
        }

        if (jsMatch) {
          jsContent = jsMatch[1] || jsMatch[0]
            .replace(/```javascript\n?/, '')
            .replace(/```js\n?/, '')
            .replace(/\n?```$/, '')
            .replace(/<\/?script[^>]*>/g, '')
        }

        htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultra Preview</title>
    <style>
        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            background: #ffffff;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        ${cssContent}
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        try {
            ${jsContent}
        } catch (e) {
            console.error('JavaScript execution error:', e);
        }
    </script>
</body>
</html>`
      }

      // Create and set the iframe content
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()
      }

    } catch (err) {
      setError('Error rendering preview: ' + (err as Error).message)
      console.error('Preview error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (code) {
      const timer = setTimeout(() => {
        updatePreview()
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [code, updatePreview])

  const downloadProject = () => {
    if (!code) return
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareProject = async () => {
    if (navigator.share && code) {
      try {
        await navigator.share({
          title: 'AI Generated Project',
          text: 'Check out this AI-generated code!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="h-full flex flex-col glass-ultra">
      {/* Ultra Premium Header - Mobile Responsive */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Live Preview</h3>
            <span className="px-2 py-1 bg-green-400/20 rounded-full text-xs text-green-300 font-medium">
              Ultra HD
            </span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={updatePreview}
              disabled={isLoading}
              className="p-2 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 group"
              title="Refresh preview"
            >
              <ArrowPathIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={shareProject}
              className="p-2 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 group"
              title="Share project"
            >
              <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
            
            <button
              onClick={downloadProject}
              className="p-2 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 group"
              title="Download project"
            >
              <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
        
        {/* Device Toggle - Mobile Responsive */}
        <div className="flex items-center space-x-2">
          <div className="glass-ultra rounded-lg sm:rounded-xl p-1 flex">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300 ${
                viewMode === 'desktop' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ComputerDesktopIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300 ${
                viewMode === 'mobile' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <DevicePhoneMobileIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <div className="flex-1"></div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 group"
            title="Toggle fullscreen"
          >
            <ArrowsPointingOutIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Preview Content - Responsive */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 p-3 sm:p-6 min-h-0">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h4 className="text-gray-800 font-bold text-lg mb-3">Preview Error</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
              <button 
                onClick={updatePreview}
                className="btn-ultra bg-gradient-to-r from-red-500 to-pink-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                  <p className="text-gray-700 font-medium">Rendering ultra-premium preview...</p>
                </div>
              </div>
            )}
            
            <div className={`h-full ${
              viewMode === 'mobile' 
                ? 'max-w-sm mx-auto' 
                : 'w-full'
            } transition-all duration-500 ease-in-out`}>
              <div className={`h-full ${
                viewMode === 'mobile' 
                  ? 'rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-gray-800 shadow-2xl bg-black p-0.5 sm:p-1' 
                  : 'rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-300'
              }`}>
                <iframe
                  ref={iframeRef}
                  className={`w-full h-full border-0 ${
                    viewMode === 'mobile' 
                      ? 'rounded-xl sm:rounded-2xl bg-white' 
                      : 'rounded-lg sm:rounded-xl bg-white'
                  } transition-all duration-300`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                  title="Ultra Premium Live Preview"
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ultra Premium Footer */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <PlayIcon className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 font-medium">Live Preview</span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">Sandboxed Environment</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 capitalize">{viewMode} View</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
