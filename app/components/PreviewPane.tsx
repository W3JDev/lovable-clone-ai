'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface PreviewPaneProps {
  code: string
}

export function PreviewPane({ code }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePreview = useCallback(async () => {
    if (!code || !iframeRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      let htmlContent = ''
      
      // Check if the code contains a complete HTML document
      if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
        // Extract complete HTML document
        if (code.includes('```html')) {
          const htmlMatch = code.match(/```html\n?([\s\S]*?)\n?```/)
          htmlContent = htmlMatch ? htmlMatch[1] : code
        } else {
          // Remove markdown code blocks if any and extract HTML
          htmlContent = code.replace(/```[\s\S]*?\n/, '').replace(/\n?```$/, '')
        }
      } else {
        // Extract different parts for building HTML
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
          // If there are HTML tags but no markdown, use the raw code
          bodyContent = code
        } else {
          bodyContent = `<div style="padding: 20px; text-align: center;">
            <h1>Generated Content</h1>
            <p>Preview will appear here when HTML content is generated.</p>
            <pre style="background: #f5f5f5; padding: 10px; text-align: left; border-radius: 5px;">${code.substring(0, 300)}${code.length > 300 ? '...' : ''}</pre>
          </div>`
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
    <title>Live Preview</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            background: #ffffff;
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
      // Small delay to ensure iframe is ready
      const timer = setTimeout(() => {
        updatePreview()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [code, updatePreview])

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border-l border-white/10">
      {/* Premium Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={updatePreview}
            disabled={isLoading}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Refresh preview"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-xl mb-4">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <h4 className="text-white font-medium mb-2">Preview Error</h4>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button 
              onClick={updatePreview}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-white flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/20">
                  <ArrowPathIcon className="w-5 h-5 animate-spin text-orange-400" />
                  <span>Rendering preview...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white rounded-t-lg"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Live Code Preview"
              style={{ minHeight: '400px' }}
            />
          </>
        )}
      </div>

      {/* Premium Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <PlayIcon className="w-4 h-4 text-green-400" />
            <span>Live preview</span>
            <span className="text-white/30">•</span>
            <span>Sandboxed environment</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
