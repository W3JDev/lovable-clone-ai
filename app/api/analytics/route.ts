import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory analytics store (in production, use a database)
const analyticsStore = {
  totalGenerations: 0,
  totalUsers: new Set<string>(),
  modelUsage: {
    gemini: 0,
    deepseek: 0
  },
  priorityUsage: {
    quality: 0,
    speed: 0,
    cost: 0
  },
  generationTypes: {
    single: 0,
    fullstack: 0
  },
  deployments: {
    vercel: 0,
    netlify: 0,
    github: 0
  },
  dailyStats: new Map<string, number>()
}

function getClientId(request: NextRequest): string {
  // Use IP address as simple client identifier
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0] : 'anonymous'
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export async function GET() {
  try {
    const today = getTodayKey()
    
    return NextResponse.json({
      metrics: {
        totalGenerations: analyticsStore.totalGenerations,
        uniqueUsers: analyticsStore.totalUsers.size,
        todayGenerations: analyticsStore.dailyStats.get(today) || 0,
        modelUsage: analyticsStore.modelUsage,
        priorityUsage: analyticsStore.priorityUsage,
        generationTypes: analyticsStore.generationTypes,
        deployments: analyticsStore.deployments
      },
      trends: {
        averageGenerationsPerUser: analyticsStore.totalUsers.size > 0 
          ? (analyticsStore.totalGenerations / analyticsStore.totalUsers.size).toFixed(2)
          : '0',
        mostPopularModel: Object.entries(analyticsStore.modelUsage)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        mostUsedPriority: Object.entries(analyticsStore.priorityUsage)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        fullStackAdoption: analyticsStore.totalGenerations > 0
          ? ((analyticsStore.generationTypes.fullstack / analyticsStore.totalGenerations) * 100).toFixed(1) + '%'
          : '0%'
      },
      status: 'active'
    })
  } catch (error) {
    console.error('Error getting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      action, 
      model, 
      priority = 'quality', 
      generateType = 'single',
      provider 
    } = body

    const clientId = getClientId(request)
    const today = getTodayKey()

    // Track user
    analyticsStore.totalUsers.add(clientId)

    switch (action) {
      case 'generation':
        analyticsStore.totalGenerations++
        analyticsStore.dailyStats.set(today, (analyticsStore.dailyStats.get(today) || 0) + 1)
        
        if (model && analyticsStore.modelUsage[model as keyof typeof analyticsStore.modelUsage] !== undefined) {
          analyticsStore.modelUsage[model as keyof typeof analyticsStore.modelUsage]++
        }
        
        if (analyticsStore.priorityUsage[priority as keyof typeof analyticsStore.priorityUsage] !== undefined) {
          analyticsStore.priorityUsage[priority as keyof typeof analyticsStore.priorityUsage]++
        }
        
        if (analyticsStore.generationTypes[generateType as keyof typeof analyticsStore.generationTypes] !== undefined) {
          analyticsStore.generationTypes[generateType as keyof typeof analyticsStore.generationTypes]++
        }
        break

      case 'deployment':
        if (provider && analyticsStore.deployments[provider as keyof typeof analyticsStore.deployments] !== undefined) {
          analyticsStore.deployments[provider as keyof typeof analyticsStore.deployments]++
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "generation" or "deployment"' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `${action} tracked successfully`,
      metrics: {
        totalGenerations: analyticsStore.totalGenerations,
        uniqueUsers: analyticsStore.totalUsers.size
      }
    })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

// Reset analytics (for development/testing)
export async function DELETE() {
  try {
    analyticsStore.totalGenerations = 0
    analyticsStore.totalUsers.clear()
    analyticsStore.modelUsage = { gemini: 0, deepseek: 0 }
    analyticsStore.priorityUsage = { quality: 0, speed: 0, cost: 0 }
    analyticsStore.generationTypes = { single: 0, fullstack: 0 }
    analyticsStore.deployments = { vercel: 0, netlify: 0, github: 0 }
    analyticsStore.dailyStats.clear()

    return NextResponse.json({
      success: true,
      message: 'Analytics data reset successfully'
    })
  } catch (error) {
    console.error('Error resetting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to reset analytics' },
      { status: 500 }
    )
  }
}