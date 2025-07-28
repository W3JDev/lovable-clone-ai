import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lovable Clone - AI Code Generator',
  description: 'Generate web applications with AI using Gemini and DeepSeek models',
  keywords: ['AI', 'code generation', 'web development', 'Gemini', 'DeepSeek'],
  authors: [{ name: 'Lovable Clone Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen font-sans">
        <div className="bg-lovable-gradient min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}