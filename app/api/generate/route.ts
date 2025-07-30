import { NextRequest, NextResponse } from 'next/server'
import { aiClientManager } from '@/app/lib/ai-clients'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous'
  return ip
}

function checkRateLimit(key: string, limit: number = 15, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making another request.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { prompt, model, priority = 'quality', generateType = 'single' } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 5000 characters allowed for enterprise features.' },
        { status: 400 }
      )
    }

    // Validate priority
    if (priority && !['speed', 'quality', 'cost'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be one of: speed, quality, cost' },
        { status: 400 }
      )
    }

    // Set model if provided
    if (model && ['gemini', 'deepseek'].includes(model)) {
      aiClientManager.setModel(model)
    }

    // Check if any AI clients are available
    const availableModels = aiClientManager.getAvailableModels()
    if (availableModels.length === 0) {
      return NextResponse.json(
        { error: 'No AI models available. Please check your API keys configuration.' },
        { status: 503 }
      )
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false
        
        const safeEnqueue = (data: Uint8Array) => {
          if (!isClosed) {
            try {
              controller.enqueue(data)
            } catch (error) {
              if (error instanceof Error && error.message.includes('Controller is already closed')) {
                console.warn('Stream already closed, ignoring enqueue')
                isClosed = true
              } else {
                console.warn('Controller enqueue failed:', error)
                isClosed = true
              }
            }
          }
        }
        
        const safeClose = () => {
          if (!isClosed) {
            try {
              controller.close()
              isClosed = true
            } catch (error) {
              console.warn('Controller close failed:', error)
            }
          }
        }

        try {
          let codeStream: AsyncIterable<string>
          
          // Use intelligent routing for enhanced generation
          if (generateType === 'fullstack') {
            // Handle full-stack generation
            const fullStackResult = await aiClientManager.generateFullStackProject(prompt)
            
            // For now, just stream the frontend (could be enhanced to stream all parts)
            codeStream = fullStackResult.frontend
            
            // Send metadata about what's being generated
            const metadata = JSON.stringify({ 
              type: 'metadata',
              generating: ['frontend', ...(fullStackResult.backend ? ['backend'] : []), ...(fullStackResult.database ? ['database'] : [])]
            })
            safeEnqueue(encoder.encode(`data: ${metadata}\n\n`))
          } else {
            // Use intelligent routing for single generation
            codeStream = await aiClientManager.generateWithIntelligentRouting(prompt, priority)
          }
          
          for await (const chunk of codeStream) {
            if (isClosed) break
            const data = JSON.stringify({ content: chunk })
            safeEnqueue(encoder.encode(`data: ${data}\n\n`))
          }
          
          if (!isClosed) {
            safeEnqueue(encoder.encode('data: [DONE]\n\n'))
            safeClose()
          }
        } catch (error) {
          console.error('Error generating code:', error)
          const errorData = JSON.stringify({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          })
          safeEnqueue(encoder.encode(`data: ${errorData}\n\n`))
          safeClose()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}