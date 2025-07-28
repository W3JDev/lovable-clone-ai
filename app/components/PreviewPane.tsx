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
      // Extract HTML, CSS, and JavaScript from the code
      const htmlMatch = code.match(/```html\n?([\s\S]*?)\n?```/) || 
                       code.match(/<html[\s\S]*<\/html>/) ||
                       code.match(/<!DOCTYPE[\s\S]*<\/html>/)
      
      const cssMatch = code.match(/```css\n?([\s\S]*?)\n?```/) ||
                      code.match(/<style[\s\S]*?<\/style>/)
      
      const jsMatch = code.match(/```javascript\n?([\s\S]*?)\n?```/) ||
                     code.match(/```js\n?([\s\S]*?)\n?```/) ||
                     code.match(/<script[\s\S]*?<\/script>/)

      let htmlContent = ''
      
      if (htmlMatch) {
        htmlContent = htmlMatch[0].replace(/```html\n?/, '').replace(/\n?```$/, '')
      } else {
        // Create a basic HTML structure if only CSS/JS is provided
        htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        ${cssMatch ? cssMatch[0].replace(/```css\n?/, '').replace(/\n?```$/, '').replace(/<\/?style[^>]*>/g, '') : ''}
    </style>
</head>
<body>
    <div id="app">
        <h1>Generated Content</h1>
        <p>Your generated code will appear here when it contains valid HTML.</p>
    </div>
    <script>
        ${jsMatch ? jsMatch[0].replace(/```javascript\n?/, '').replace(/```js\n?/, '').replace(/\n?```$/, '').replace(/<\/?script[^>]*>/g, '') : ''}
    </script>
</body>
</html>`
      }

      // Create a blob URL for the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      iframeRef.current.src = url

      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)

    } catch (err) {
      setError('Error rendering preview: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (code) {
      updatePreview()
    }
  }, [code, updatePreview])

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Live Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={updatePreview}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh preview"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="p-4 text-red-400">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-500">⚠️</span>
              <span className="font-medium">Preview Error</span>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white">Loading preview...</div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="Code Preview"
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <PlayIcon className="w-4 h-4" />
          <span>Live preview • Sandboxed environment</span>
        </div>
      </div>
    </div>
  )
}