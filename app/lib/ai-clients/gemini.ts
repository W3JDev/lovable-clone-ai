import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request. Return only the code without explanations unless specifically asked for them.

For web applications, provide complete HTML, CSS, and JavaScript. Make the design modern, responsive, and visually appealing with proper styling.

User request: ${prompt}

Please provide complete, working code that can be run directly in a browser.`

    try {
      const result = await this.model.generateContentStream(enhancedPrompt)
      
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
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate code with Gemini')
    }
  }

  async generateCodeSync(prompt: string): Promise<string> {
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request. Return only the code without explanations unless specifically asked for them.

For web applications, provide complete HTML, CSS, and JavaScript. Make the design modern, responsive, and visually appealing with proper styling.

User request: ${prompt}

Please provide complete, working code that can be run directly in a browser.`

    try {
      const result = await this.model.generateContent(enhancedPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate code with Gemini')
    }
  }
}