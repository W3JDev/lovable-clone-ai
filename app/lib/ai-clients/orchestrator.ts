import { AIClient, ModelType } from './index'

export interface TaskComplexity {
  simple: boolean      // Basic HTML/CSS
  frontend: boolean    // React components, complex UI
  backend: boolean     // APIs, server logic
  database: boolean    // Database design
  fullStack: boolean   // Complete applications
}

export interface ModelCapabilities {
  codeGeneration: number       // 1-10 scale
  reasoning: number           // 1-10 scale
  complexity: number          // 1-10 scale
  speed: number              // 1-10 scale
  cost: number               // 1-10 scale (lower is cheaper)
}

export class AIOrchestrator {
  private modelCapabilities: Record<ModelType, ModelCapabilities> = {
    gemini: {
      codeGeneration: 9,
      reasoning: 8,
      complexity: 8,
      speed: 7,
      cost: 6
    },
    deepseek: {
      codeGeneration: 8,
      reasoning: 9,
      complexity: 9,
      speed: 8,
      cost: 4
    }
  }

  analyzeTaskComplexity(prompt: string): TaskComplexity {
    const lowerPrompt = prompt.toLowerCase()
    
    const indicators = {
      simple: [
        'simple', 'basic', 'static', 'landing page', 'html', 'css'
      ],
      frontend: [
        'react', 'vue', 'angular', 'component', 'ui', 'interface', 'responsive'
      ],
      backend: [
        'api', 'server', 'backend', 'endpoint', 'auth', 'authentication'
      ],
      database: [
        'database', 'sql', 'mongodb', 'postgres', 'schema', 'model'
      ],
      fullStack: [
        'full-stack', 'complete app', 'entire application', 'end-to-end'
      ]
    }

    const complexity: TaskComplexity = {
      simple: false,
      frontend: false,
      backend: false,
      database: false,
      fullStack: false
    }

    for (const [category, keywords] of Object.entries(indicators)) {
      complexity[category as keyof TaskComplexity] = keywords.some(keyword => 
        lowerPrompt.includes(keyword)
      )
    }

    // Auto-detect complexity if not explicit
    if (!Object.values(complexity).some(Boolean)) {
      complexity.simple = true
    }

    // Full-stack implies all others
    if (complexity.fullStack) {
      complexity.frontend = true
      complexity.backend = true
      complexity.database = true
    }

    return complexity
  }

  selectOptimalModel(
    complexity: TaskComplexity, 
    availableModels: ModelType[],
    priority: 'speed' | 'quality' | 'cost' = 'quality'
  ): ModelType {
    if (availableModels.length === 0) {
      throw new Error('No AI models available')
    }

    if (availableModels.length === 1) {
      return availableModels[0]
    }

    // Calculate complexity score
    const complexityScore = Object.values(complexity).filter(Boolean).length

    let bestModel = availableModels[0]
    let bestScore = -1

    for (const model of availableModels) {
      const capabilities = this.modelCapabilities[model]
      let score = 0

      switch (priority) {
        case 'speed':
          score = capabilities.speed * 0.6 + capabilities.codeGeneration * 0.4
          break
        case 'cost':
          score = (10 - capabilities.cost) * 0.4 + capabilities.codeGeneration * 0.6
          break
        case 'quality':
        default:
          // For simple tasks, prioritize speed
          if (complexityScore <= 1) {
            score = capabilities.speed * 0.4 + capabilities.codeGeneration * 0.6
          }
          // For complex tasks, prioritize reasoning and complexity handling
          else if (complexityScore >= 3) {
            score = capabilities.reasoning * 0.4 + capabilities.complexity * 0.4 + capabilities.codeGeneration * 0.2
          }
          // For medium tasks, balanced approach
          else {
            score = capabilities.codeGeneration * 0.5 + capabilities.reasoning * 0.3 + capabilities.speed * 0.2
          }
          break
      }

      if (score > bestScore) {
        bestScore = score
        bestModel = model
      }
    }

    return bestModel
  }

  async generateWithOrchestration(
    prompt: string,
    aiClientManager: any,
    priority: 'speed' | 'quality' | 'cost' = 'quality'
  ): Promise<AsyncIterable<string>> {
    // Analyze task complexity
    const complexity = this.analyzeTaskComplexity(prompt)
    
    // Get available models
    const availableModels = aiClientManager.getAvailableModels()
    
    // Select optimal model
    const optimalModel = this.selectOptimalModel(complexity, availableModels, priority)
    
    // Log the decision for debugging
    console.log('AI Orchestration:', {
      complexity,
      selectedModel: optimalModel,
      priority,
      availableModels
    })
    
    // Set the optimal model and generate
    const originalModel = aiClientManager.getCurrentModel()
    aiClientManager.setModel(optimalModel)
    
    try {
      return await aiClientManager.generateCodeWithFallback(prompt)
    } finally {
      // Restore original model if different
      if (originalModel !== optimalModel) {
        aiClientManager.setModel(originalModel)
      }
    }
  }

  async generateFullStackProject(
    prompt: string,
    aiClientManager: any
  ): Promise<{
    frontend: AsyncIterable<string>
    backend?: AsyncIterable<string>
    database?: AsyncIterable<string>
  }> {
    const complexity = this.analyzeTaskComplexity(prompt)
    
    const result: any = {}
    
    // Generate frontend (always required)
    const frontendPrompt = `Create a modern, responsive frontend for: ${prompt}. 
    Use React with TypeScript, Tailwind CSS, and modern UI patterns. 
    Include proper component structure and responsive design.`
    
    result.frontend = await this.generateWithOrchestration(frontendPrompt, aiClientManager, 'quality')
    
    // Generate backend if needed
    if (complexity.backend || complexity.fullStack) {
      const backendPrompt = `Create a REST API backend for: ${prompt}.
      Use Node.js with Express and TypeScript. Include proper error handling,
      validation, and API documentation. Follow RESTful conventions.`
      
      result.backend = await this.generateWithOrchestration(backendPrompt, aiClientManager, 'quality')
    }
    
    // Generate database schema if needed
    if (complexity.database || complexity.fullStack) {
      const dbPrompt = `Design a database schema for: ${prompt}.
      Provide both SQL (PostgreSQL) and NoSQL (MongoDB) versions.
      Include relationships, indexes, and sample data.`
      
      result.database = await this.generateWithOrchestration(dbPrompt, aiClientManager, 'quality')
    }
    
    return result
  }
}

export const aiOrchestrator = new AIOrchestrator()