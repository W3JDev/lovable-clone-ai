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
        * { 
            box-sizing: border-box; 
        }
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            background: #ffffff;
        }
        .preview-container {
            position: relative;
            overflow: auto;
            height: 100vh;
        }
        .content-wrapper {
            position: relative;
            z-index: 1;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        ${cssContent}
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="content-wrapper animate-fade-in">
            ${bodyContent}
        </div>
    </div>
    ${jsContent ? `<script>
        // Enhanced interactivity with stability
        document.addEventListener('DOMContentLoaded', function() {
            // Add smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Add hover effects to cards with GPU acceleration
            document.querySelectorAll('.card').forEach(card => {
                card.style.transform = 'translate3d(0, 0, 0)';
                card.style.willChange = 'transform';
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translate3d(0, -4px, 0) scale(1.02)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translate3d(0, 0, 0) scale(1)';
                });
            });
            
            // Add click ripple effect to buttons
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    ripple.style.cssText = \`
                        position: absolute;
                        width: \${size}px;
                        height: \${size}px;
                        left: \${x}px;
                        top: \${y}px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                    \`;
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                });
            });
            
            // Original generated JavaScript
            try {
                ${jsContent}
            } catch (e) {
                console.error('JavaScript execution error:', e);
            }
        });
    </script>` : jsContent ? `<script>
        try {
            ${jsContent}
        } catch (e) {
            console.error('JavaScript execution error:', e);
        }
    </script>` : ''}
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
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border-l border-white/10 stable-container">
      {/* Enhanced Premium Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between performance-optimized">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                viewMode === 'desktop' 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Desktop view"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                viewMode === 'mobile' 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Mobile view"
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Toggle fullscreen"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
          <button
            onClick={updatePreview}
            disabled={isLoading}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Refresh preview"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Share preview"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Preview Content */}
      <div className="flex-1 relative stable-container">
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
            <div className={`w-full h-full flex items-center justify-center p-4 ${
              isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
            }`}>
              <iframe
                ref={iframeRef}
                className={`border-0 bg-white rounded-lg shadow-2xl performance-optimized ${
                  viewMode === 'mobile' 
                    ? 'w-[375px] h-[667px]' 
                    : 'w-full h-full'
                } ${isFullscreen ? 'w-full h-full rounded-none' : ''}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Live Code Preview"
                style={{ 
                  minHeight: viewMode === 'mobile' ? '667px' : '400px',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <PlayIcon className="w-4 h-4 text-green-400" />
            <span>Live preview</span>
            <span className="text-white/30">•</span>
            <span>Sandboxed environment</span>
            <span className="text-white/30">•</span>
            <span className="capitalize">{viewMode} view</span>
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
