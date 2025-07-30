import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request.

CRITICAL REQUIREMENTS:
1. Always provide COMPLETE HTML documents with proper DOCTYPE, head, and body tags
2. Include CSS styles within <style> tags in the head section - NO EXTERNAL STYLESHEETS
3. Make designs modern, responsive, and visually appealing with professional styling
4. Include JavaScript within <script> tags if needed
5. Use modern CSS features: flexbox, grid, gradients, shadows, animations
6. Ensure mobile responsiveness with proper viewport meta tag
7. Use beautiful color schemes and typography

User request: ${prompt}

Generate a complete, self-contained HTML file that renders beautifully in a browser with all styles included.`

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
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request.

CRITICAL REQUIREMENTS:
1. Always provide COMPLETE HTML documents with proper DOCTYPE, head, and body tags
2. Include CSS styles within <style> tags in the head section - NO EXTERNAL STYLESHEETS
3. Make designs modern, responsive, and visually appealing with professional styling
4. Include JavaScript within <script> tags if needed
5. Use modern CSS features: flexbox, grid, gradients, shadows, animations
6. Ensure mobile responsiveness with proper viewport meta tag
7. Use beautiful color schemes and typography

User request: ${prompt}

Generate a complete, self-contained HTML file that renders beautifully in a browser with all styles included.`

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