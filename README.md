# Lovable Clone - AI Code Generator

A modern web application that replicates Lovable's functionality using AI models like Gemini 1.5 Pro and DeepSeek for code generation with real-time preview capabilities.

## 🚀 Features

- **AI-Powered Code Generation**: Support for Gemini 1.5 Pro and DeepSeek models
- **Real-time Streaming**: Watch code generate in real-time with streaming responses
- **Live Preview**: Instant preview of generated HTML, CSS, and JavaScript
- **Modern UI**: Beautiful dark theme with orange-to-pink gradient design
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Rate Limiting**: Built-in protection against API abuse
- **Model Switching**: Easy switching between different AI models
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini 1.5 Pro, DeepSeek API
- **Styling**: Tailwind CSS with custom gradient themes
- **Icons**: Heroicons, Lucide React
- **Code Highlighting**: React Syntax Highlighter
- **State Management**: React hooks and context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/W3JDev/lovable-clone-ai.git
   cd lovable-clone-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting API Keys

### Gemini API (Google AI Studio)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

### DeepSeek API
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account and sign in
3. Navigate to API keys section
4. Generate a new API key
5. Copy the key to your `.env.local` file

## 🎯 Usage

1. **Enter a Prompt**: Describe what you want to build in the text area
2. **Generate Code**: Click the up arrow button or press Enter
3. **Watch Real-time Generation**: See code appear as it's being generated
4. **Preview Your Creation**: Click "Show Preview" to see the live result
5. **Copy Code**: Use the copy button to copy generated code

### Example Prompts

- "Create a landing page for a coffee shop with modern design"
- "Build a responsive todo app with dark theme"
- "Make a pricing table with three tiers"
- "Create an animated hero section with gradient background"

## 🔧 API Endpoints

### `/api/generate` (POST)
Generate code using AI models with streaming response.

**Request:**
```json
{
  "prompt": "Create a modern landing page",
  "model": "gemini" // optional: "gemini" or "deepseek"
}
```

### `/api/models` (GET/POST)
Get available models or switch between them.

**GET Response:**
```json
{
  "availableModels": ["gemini", "deepseek"],
  "currentModel": "gemini",
  "status": "healthy"
}
```

### `/api/preview` (POST)
Create a preview session for generated code.

**Request:**
```json
{
  "code": "<html>...</html>"
}
```

## 🚦 Rate Limiting

- **Default Limit**: 15 requests per minute per IP
- **Window**: 60 seconds
- **Scope**: Per IP address

## 🛡️ Security Features

- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Prevents API abuse
- **Sandbox Preview**: Safe code execution in isolated environment
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🎨 Customization

### Modifying the Gradient Theme
Edit `tailwind.config.ts` to customize the gradient:

```javascript
backgroundImage: {
  'lovable-gradient': 'linear-gradient(135deg, #your-colors-here)',
}
```

### Adding New AI Models
1. Create a new client in `app/lib/ai-clients/`
2. Implement the `AIClient` interface
3. Add the client to `AIClientManager`

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Responsive layouts
- Mobile-optimized text input
- Swipe gestures for navigation

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Docker

```bash
# Build the image
docker build -t lovable-clone .

# Run the container
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key lovable-clone
```

## 🔍 Troubleshooting

### Common Issues

1. **"No AI models available"**
   - Check that you have valid API keys in your environment variables
   - Verify API key format and permissions

2. **Rate limit exceeded**
   - Wait for the rate limit window to reset (60 seconds)
   - Consider implementing user authentication for higher limits

3. **Preview not working**
   - Ensure the generated code includes valid HTML structure
   - Check browser console for JavaScript errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lovable](https://lovable.dev) for the inspiration
- [Google Gemini](https://deepmind.google/technologies/gemini/) for the AI capabilities
- [DeepSeek](https://www.deepseek.com/) for the alternative AI model
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/W3JDev/lovable-clone-ai/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue

---

Made with ❤️ by the Lovable Clone team