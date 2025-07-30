import { GoogleGenAI } from '@google/genai'
import { promptPerfectionEngine } from './prompt-perfection'

export class GeminiClient {
  private client: GoogleGenAI
  private model: string

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey: apiKey
    })
    // Using Gemini 2.5 Pro with the new Google GenAI SDK for superior performance
    this.model = 'gemini-2.5-pro'
  }

  async generateCode(prompt: string): Promise<AsyncIterable<string>> {
    // 🚀 AUTOMATIC PROMPT PERFECTION - Transform basic prompt into premium framework
    const perfectedPrompt = promptPerfectionEngine.perfectPrompt(prompt)
    
    console.log('🎯 Prompt Perfection Applied:', {
      original: prompt.substring(0, 100) + '...',
      perfected: perfectedPrompt.substring(0, 200) + '...'
    })

    try {
      const tools = [
        { codeExecution: {} },
        { googleSearch: {} }
      ]
      
      const config = {
        thinkingConfig: {
          thinkingBudget: -1, // Enable advanced reasoning
        },
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        tools,
      }
      
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: perfectedPrompt,
            },
          ],
        },
      ]

      const response = await this.client.models.generateContentStream({
        model: this.model,
        config,
        contents,
      })
      
      const generateChunks = async function* () {
        for await (const chunk of response) {
          if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
            continue
          }
          
          const part = chunk.candidates[0].content.parts[0]
          if (part.text) {
            yield part.text
          }
          
          // Handle code execution results if available
          if (part.executableCode) {
            yield `\n// Executable Code:\n${part.executableCode.code}\n`
          }
          
          if (part.codeExecutionResult) {
            yield `\n// Execution Result:\n${part.codeExecutionResult.output}\n`
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
      const tools = [
        { codeExecution: {} },
        { googleSearch: {} }
      ]
      
      const config = {
        thinkingConfig: {
          thinkingBudget: -1, // Enable advanced reasoning
        },
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        tools,
      }
      
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: perfectedPrompt,
            },
          ],
        },
      ]

      const response = await this.client.models.generateContent({
        model: this.model,
        config,
        contents,
      })
      
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts
        let result = ''
        
        for (const part of parts) {
          if (part.text) {
            result += part.text
          }
          if (part.executableCode) {
            result += `\n// Executable Code:\n${part.executableCode.code}\n`
          }
          if (part.codeExecutionResult) {
            result += `\n// Execution Result:\n${part.codeExecutionResult.output}\n`
          }
        }
        
        return result
      }
      
      throw new Error('No response received from Gemini 2.5 Pro')
    } catch (error) {
      console.error('Gemini 2.5 Pro Sync API Error:', error)
      throw new Error('Failed to generate code with Gemini 2.5 Pro')
    }
  }
}