import { NextRequest, NextResponse } from 'next/server'
import { aiClientManager } from '@/app/lib/ai-clients'

export async function GET() {
  try {
    const availableModels = aiClientManager.getAvailableModels()
    const currentModel = aiClientManager.getCurrentModel()

    return NextResponse.json({
      availableModels,
      currentModel,
      status: availableModels.length > 0 ? 'healthy' : 'no_models_available'
    })
  } catch (error) {
    console.error('Error getting models:', error)
    return NextResponse.json(
      { error: 'Failed to get model information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model } = body

    if (!model || !['gemini', 'deepseek'].includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model. Must be either "gemini" or "deepseek"' },
        { status: 400 }
      )
    }

    const availableModels = aiClientManager.getAvailableModels()
    if (!availableModels.includes(model)) {
      return NextResponse.json(
        { error: `Model "${model}" is not available. Check API key configuration.` },
        { status: 400 }
      )
    }

    aiClientManager.setModel(model)
    
    return NextResponse.json({
      success: true,
      currentModel: aiClientManager.getCurrentModel(),
      message: `Switched to ${model} model`
    })
  } catch (error) {
    console.error('Error switching model:', error)
    return NextResponse.json(
      { error: 'Failed to switch model' },
      { status: 500 }
    )
  }
}