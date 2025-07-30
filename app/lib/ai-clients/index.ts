import { GeminiClient } from './gemini'
import { DeepSeekClient } from './deepseek'
import { aiOrchestrator } from './orchestrator'

export interface AIClient {
  generateCode(prompt: string): Promise<AsyncIterable<string>>
  generateCodeSync(prompt: string): Promise<string>
}

export type ModelType = 'gemini' | 'deepseek'

export class AIClientManager {
  private geminiClient?: GeminiClient
  private deepseekClient?: DeepSeekClient
  private currentModel: ModelType = 'gemini'

  constructor() {
    // Initialize clients if API keys are available
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GeminiClient(process.env.GEMINI_API_KEY)
    }
    
    if (process.env.DEEPSEEK_API_KEY) {
      this.deepseekClient = new DeepSeekClient(process.env.DEEPSEEK_API_KEY)
    }
  }

  setModel(model: ModelType) {
    this.currentModel = model
  }

  getCurrentModel(): ModelType {
    return this.currentModel
  }

  getAvailableModels(): ModelType[] {
    const models: ModelType[] = []
    if (this.geminiClient) models.push('gemini')
    if (this.deepseekClient) models.push('deepseek')
    return models
  }

  private getClient(): AIClient {
    if (this.currentModel === 'gemini' && this.geminiClient) {
      return this.geminiClient
    }
    
    if (this.currentModel === 'deepseek' && this.deepseekClient) {
      return this.deepseekClient
    }

    // Fallback logic
    if (this.geminiClient) {
      this.currentModel = 'gemini'
      return this.geminiClient
    }
    
    if (this.deepseekClient) {
      this.currentModel = 'deepseek'
      return this.deepseekClient
    }

    throw new Error('No AI clients available. Please check your API keys.')
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    const client = this.getClient()
    return client.generateCode(prompt)
  }

  async generateCodeSync(prompt: string): Promise<string> {
    const client = this.getClient()
    return client.generateCodeSync(prompt)
  }

  async generateCodeWithFallback(prompt: string): Promise<AsyncIterable<string>> {
    try {
      return await this.generateCode(prompt)
    } catch (error) {
      console.error(`Error with ${this.currentModel}:`, error)
      
      // Try fallback model
      const availableModels = this.getAvailableModels()
      const fallbackModel = availableModels.find(model => model !== this.currentModel)
      
      if (fallbackModel) {
        console.log(`Falling back to ${fallbackModel}`)
        const originalModel = this.currentModel
        this.setModel(fallbackModel)
        
        try {
          return await this.generateCode(prompt)
        } catch (fallbackError) {
          // Restore original model and throw
          this.setModel(originalModel)
          throw fallbackError
        }
      }
      
      throw error
    }
  }

  // New orchestrated generation methods
  async generateWithIntelligentRouting(
    prompt: string, 
    priority: 'speed' | 'quality' | 'cost' = 'quality'
  ): Promise<AsyncIterable<string>> {
    return aiOrchestrator.generateWithOrchestration(prompt, this, priority)
  }

  async generateFullStackProject(prompt: string): Promise<{
    frontend: AsyncIterable<string>
    backend?: AsyncIterable<string>
    database?: AsyncIterable<string>
  }> {
    return aiOrchestrator.generateFullStackProject(prompt, this)
  }

  getModelCapabilities() {
    return {
      gemini: {
        name: 'Gemini 1.5 Pro',
        description: 'Google\'s advanced multimodal AI with exceptional code generation and reasoning',
        strengths: ['Advanced reasoning', 'Multimodal capabilities', 'Large context window'],
        bestFor: ['Complex UI/UX', 'Full-stack development', 'Design systems']
      },
      deepseek: {
        name: 'DeepSeek V3',
        description: 'Specialized coding model with deep reasoning capabilities',
        strengths: ['Complex logic', 'Backend systems', 'Code optimization'],
        bestFor: ['Backend APIs', 'Algorithms', 'System architecture']
      }
    }
  }
}

// Export singleton instance
export const aiClientManager = new AIClientManager()