import { NextRequest, NextResponse } from 'next/server'

// Simple UUID generator for session IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// In-memory storage for preview sessions (in production, use Redis or database)
const previewSessions = new Map<string, { html: string; createdAt: number }>()

// Clean up old sessions (remove after 1 hour)
function cleanupOldSessions() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  previewSessions.forEach((session, id) => {
    if (session.createdAt < oneHourAgo) {
      previewSessions.delete(id)
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    cleanupOldSessions()

    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      )
    }

    // Sanitize and prepare the code for preview
    let htmlContent = code

    // If it's not a complete HTML document, wrap it
    if (!htmlContent.includes('<!DOCTYPE') && !htmlContent.includes('<html')) {
      // Extract CSS and JS if they're in code blocks
      const cssMatch = code.match(/```css\n?([\s\S]*?)\n?```/)
      const jsMatch = code.match(/```javascript\n?([\s\S]*?)\n?```/) || 
                     code.match(/```js\n?([\s\S]*?)\n?```/)

      const css = cssMatch ? cssMatch[1] : ''
      const js = jsMatch ? jsMatch[1] : ''

      // Remove code blocks from HTML content
      htmlContent = code
        .replace(/```css\n?[\s\S]*?\n?```/g, '')
        .replace(/```javascript\n?[\s\S]*?\n?```/g, '')
        .replace(/```js\n?[\s\S]*?\n?```/g, '')
        .replace(/```html\n?|\n?```/g, '')

      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f9fafb;
        }
        ${css}
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        // Disable some potentially dangerous functions
        window.alert = function() { console.log('alert() disabled in preview'); };
        window.confirm = function() { console.log('confirm() disabled in preview'); return false; };
        
        ${js}
    </script>
</body>
</html>`
    }

    // Create a unique session ID
    const sessionId = generateId()
    
    // Store the session
    previewSessions.set(sessionId, {
      html: htmlContent,
      createdAt: Date.now()
    })

    return NextResponse.json({
      sessionId,
      previewUrl: `/api/preview/${sessionId}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    })

  } catch (error) {
    console.error('Error creating preview:', error)
    return NextResponse.json(
      { error: 'Failed to create preview' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const sessionId = url.pathname.split('/').pop()

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  const session = previewSessions.get(sessionId)
  
  if (!session) {
    return new Response('Preview session not found or expired', {
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    })
  }

  return new Response(session.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self';"
    }
  })
}