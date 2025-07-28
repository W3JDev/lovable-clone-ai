'use client'

import React, { useEffect, useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('html', xml)
SyntaxHighlighter.registerLanguage('jsx', javascript)
SyntaxHighlighter.registerLanguage('tsx', typescript)

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [detectedLanguage, setDetectedLanguage] = useState(language || 'javascript')

  useEffect(() => {
    if (!language && code) {
      // Simple language detection
      if (code.includes('<!DOCTYPE') || code.includes('<html')) {
        setDetectedLanguage('html')
      } else if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) {
        setDetectedLanguage('typescript')
      } else if (code.includes('function ') || code.includes('const ') || code.includes('import ')) {
        setDetectedLanguage('javascript')
      } else if (code.includes('{') && code.includes('}') && code.includes(':')) {
        setDetectedLanguage('css')
      }
    }
  }, [code, language])

  if (!code) {
    return <div className="text-gray-400">No code to display</div>
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {detectedLanguage}
        </span>
      </div>
      <SyntaxHighlighter
        language={detectedLanguage}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
        showLineNumbers={code.split('\n').length > 5}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}