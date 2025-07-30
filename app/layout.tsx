import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'CodeGenesis AI - Ultimate AI Development Platform',
  description: 'The most advanced AI-powered development platform for full-stack applications. Generate complete projects with enterprise-grade features.',
  keywords: ['AI', 'code generation', 'full-stack development', 'enterprise', 'deployment', 'collaboration', 'Gemini', 'DeepSeek'],
  authors: [{ name: 'CodeGenesis AI Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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