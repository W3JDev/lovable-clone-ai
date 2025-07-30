import { GoogleGenerativeAI } from '@google/generative-ai'
import { promptPerfectionEngine } from './prompt-perfection'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
    // Using Gemini 2.5 Pro for superior UI/UX design and code integration
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-pro' })
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    // 🚀 AUTOMATIC PROMPT PERFECTION - Transform basic prompt into premium framework
    const perfectedPrompt = promptPerfectionEngine.perfectPrompt(prompt)
    
    console.log('🎯 Prompt Perfection Applied:', {
      original: prompt.substring(0, 100) + '...',
      perfected: perfectedPrompt.substring(0, 200) + '...'
    })

    try {
      const result = await this.model.generateContentStream(perfectedPrompt)
      
      const generateChunks = async function* () {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          if (chunkText) {
            yield chunkText
          }
        }
      }
      
      return generateChunks()
    } catch (error) {
      console.error('Gemini 2.5 Pro API Error:', error)
      throw new Error('Failed to generate code with Gemini 2.5 Pro')
    }
  }

  async generateCodeSync(prompt: string): Promise<string> {
    // 🚀 AUTOMATIC PROMPT PERFECTION - Transform basic prompt into premium framework
    const perfectedPrompt = promptPerfectionEngine.perfectPrompt(prompt)

    try {
      const result = await this.model.generateContent(perfectedPrompt)
      return result.response.text()
    } catch (error) {
      console.error('Gemini 2.5 Pro Sync API Error:', error)
      throw new Error('Failed to generate code with Gemini 2.5 Pro')
    }
  }
}