import OpenAI from 'openai'
import { promptPerfectionEngine } from './prompt-perfection'

export class DeepSeekClient {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com'
    })
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
      const stream = await this.client.chat.completions.create({
        model: 'deepseek-reasoner', // Using DeepSeek-R1 for superior code generation
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer who creates clean, modern, and functional code. You excel at generating high-quality, production-ready code with exceptional attention to detail.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        stream: true,
        max_tokens: 8000, // Increased for complex projects
        temperature: 0.3, // Lower for more consistent code output
      })

      const generateChunks = async function* () {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            yield content
          }
        }
      }

      return generateChunks()
    } catch (error) {
      console.error('DeepSeek API Error:', error)
      throw new Error('Failed to generate code with DeepSeek')
    }
  }

  async generateCodeSync(prompt: string): Promise<string> {
    // 🚀 AUTOMATIC PROMPT PERFECTION - Transform basic prompt into premium framework
    const perfectedPrompt = promptPerfectionEngine.perfectPrompt(prompt)

    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: perfectedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        stream: false
      })

      return completion.choices[0].message.content || ''
    } catch (error) {
      console.error('DeepSeek-R1 Sync API Error:', error)
      throw new Error('Failed to generate code with DeepSeek-R1')
    }
  }
}