import OpenAI from 'openai'

export class DeepSeekClient {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com'
    })
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request. Return only the code without explanations unless specifically asked for them.

For web applications, provide complete HTML, CSS, and JavaScript. Make the design modern, responsive, and visually appealing with proper styling.

User request: ${prompt}

Please provide complete, working code that can be run directly in a browser.`

    try {
      const stream = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer who creates clean, modern, and functional code.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        stream: true,
        max_tokens: 4000,
        temperature: 0.7,
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
    const enhancedPrompt = `You are an expert web developer. Generate clean, modern, and functional code based on the following request. Return only the code without explanations unless specifically asked for them.

For web applications, provide complete HTML, CSS, and JavaScript. Make the design modern, responsive, and visually appealing with proper styling.

User request: ${prompt}

Please provide complete, working code that can be run directly in a browser.`

    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer who creates clean, modern, and functional code.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('DeepSeek API Error:', error)
      throw new Error('Failed to generate code with DeepSeek')
    }
  }
}