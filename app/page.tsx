'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ArrowUpIcon, 
  ClipboardIcon, 
  SparklesIcon, 
  CommandLineIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CodeBlock } from './components/CodeBlock'
import { PreviewPane } from './components/PreviewPane'
import { LoadingDots } from './components/LoadingDots'
import { DeploymentPanel } from './components/DeploymentPanel'
import { AnalyticsPanel } from './components/AnalyticsPanel'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Project {
  id: string
  name: string
  preview: string
  code: string
  timestamp: Date
  tags: string[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [currentModel, setCurrentModel] = useState('gemini')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [priority, setPriority] = useState<'speed' | 'quality' | 'cost'>('quality')
  const [generateType, setGenerateType] = useState<'single' | 'fullstack'>('single')
  const [showDeployment, setShowDeployment] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Track generation analytics
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generation',
          model: currentModel,
          priority: priority,
          generateType: generateType
        })
      }).catch(err => console.warn('Analytics tracking failed:', err))

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userMessage.content, 
          model: currentModel,
          priority: priority,
          generateType: generateType
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  assistantContent += data.content
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }
              } catch (error) {
                console.error('Error parsing chunk:', error)
              }
            }
          }
        }
      }

      setGeneratedCode(assistantContent)

      // Auto-save project
      const newProject: Project = {
        id: Date.now().toString(),
        name: userMessage.content.slice(0, 50) + '...',
        preview: assistantContent,
        code: assistantContent,
        timestamp: new Date(),
        tags: extractTags(userMessage.content)
      }
      setProjects(prev => [newProject, ...prev])

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while generating code. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const extractTags = (prompt: string): string[] => {
    const commonTags = ['react', 'html', 'css', 'javascript', 'landing', 'component', 'dashboard', 'form']
    return commonTags.filter(tag => prompt.toLowerCase().includes(tag))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const downloadProject = (project: Project) => {
    const blob = new Blob([project.code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const examplePrompts = [
    { 
      icon: '🏪', 
      title: 'Coffee Shop Landing', 
      prompt: `Create an ultra-premium coffee shop landing page with advanced enterprise-level design. Requirements:

VISUAL DESIGN:
- Hero section with full-screen video background showing coffee brewing process
- Implement glassmorphism navigation with blur effects and transparency layers
- Use premium typography (Inter/SF Pro) with gradient text effects
- Color palette: Warm browns (#6B4E3D), gold accents (#D4AF37), and cream (#F5F5DC)
- Add subtle 3D parallax scrolling effects

LAYOUT STRUCTURE:
- Fixed navigation with scroll-triggered animations
- Hero with animated call-to-action and floating elements
- Menu section with hover-animated cards displaying coffee items
- Interactive map integration for store locations
- Customer testimonials carousel with smooth transitions
- Newsletter signup with premium form validation

INTERACTIVE ELEMENTS:
- Smooth scroll navigation with section highlighting
- Product cards with 3D hover effects and quick-view modals
- Shopping cart sidebar with real-time calculations
- Mobile-responsive hamburger menu with slide animations
- Social media integration with live Instagram feed

TECHNICAL SPECIFICATIONS:
- Fully responsive design (mobile-first approach)
- Optimize for Core Web Vitals and accessibility (WCAG 2.1)
- Include structured data for SEO optimization
- Implement lazy loading for images and smooth fade-in animations
- Add contact form with validation and success/error states

Make it feel like a billion-dollar brand with attention to micro-interactions and premium aesthetics.`,
      gradient: 'from-amber-400 to-orange-600'
    },
    { 
      icon: '📱', 
      title: 'Mobile App UI', 
      prompt: `Design a cutting-edge mobile app interface that rivals top enterprise applications. Requirements:

DESIGN SYSTEM:
- Create a comprehensive design system with iOS/Material Design fusion
- Implement dynamic theming with light/dark mode transitions
- Use glassmorphism cards with backdrop blur and subtle shadows
- Typography hierarchy using system fonts optimized for mobile readability
- Color scheme: Primary (#007AFF), Secondary (#5856D6), Success (#34C759), Warning (#FF9500)

INTERFACE COMPONENTS:
- Bottom tab navigation with haptic feedback indicators
- Pull-to-refresh functionality with custom animations
- Floating action buttons with morphing states
- Card-based content layout with smooth transitions
- Progressive disclosure for complex information
- Smart search with real-time suggestions and filters

USER EXPERIENCE FEATURES:
- Gesture-based navigation (swipe, pinch, long-press)
- Contextual onboarding with interactive tutorials
- Micro-interactions for user feedback (loading states, success animations)
- Offline-first design with sync indicators
- Accessibility features (VoiceOver support, Dynamic Type)

ADVANCED FUNCTIONALITY:
- Dashboard with customizable widgets and data visualization
- User profile with avatar upload and settings management
- Real-time notifications with smart categorization
- Integrated chat/messaging with typing indicators
- Biometric authentication integration
- Multi-step forms with progress indicators

TECHNICAL IMPLEMENTATION:
- Responsive breakpoints for tablets and foldable devices
- Performance optimizations for smooth 60fps animations
- Progressive Web App capabilities with offline caching
- Integration points for native device features
- Comprehensive error handling with user-friendly messages

Create an interface that feels native, intuitive, and premium at every touchpoint.`,
      gradient: 'from-blue-400 to-purple-600'
    },
    { 
      icon: '💼', 
      title: 'Enterprise SaaS Dashboard', 
      prompt: `Build a sophisticated enterprise-grade SaaS dashboard that competes with industry leaders. Requirements:

EXECUTIVE OVERVIEW:
- Real-time KPI dashboard with customizable metrics widgets
- Interactive data visualization using charts, graphs, and heatmaps
- Executive summary cards with trend indicators and percentage changes
- Global filters and date range selectors with smart defaults
- Export functionality for reports (PDF, Excel, CSV)

NAVIGATION & LAYOUT:
- Collapsible sidebar with role-based menu items
- Breadcrumb navigation with contextual actions
- Multi-tab interface for different data views
- Global search with intelligent suggestions and shortcuts
- User profile dropdown with quick settings access

DATA VISUALIZATION:
- Interactive charts (line, bar, pie, donut, scatter plots)
- Real-time updating dashboards with WebSocket connections
- Drill-down capabilities for detailed analysis
- Comparison tools for period-over-period analysis
- Heat maps for geographic or categorical data representation

USER MANAGEMENT:
- Role-based access control interface
- Team management with invitation and permission systems
- Activity logs and audit trails with filtering
- User profile management with avatar uploads
- Bulk user operations with progress indicators

ENTERPRISE FEATURES:
- Multi-tenant architecture support with organization switching
- Advanced filtering and search across all data types
- Notification center with real-time alerts and updates
- Integration settings for third-party services
- API key management and webhook configuration
- White-label customization options

TECHNICAL REQUIREMENTS:
- Table components with sorting, filtering, and pagination
- Responsive design that works on all screen sizes
- Loading states and skeleton screens for better UX
- Error boundaries with graceful error handling
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization for large datasets

Design with the sophistication of Salesforce, the elegance of Notion, and the power of Tableau.`,
      gradient: 'from-green-400 to-teal-600'
    },
    { 
      icon: '🎨', 
      title: 'Creative Portfolio', 
      prompt: `Create a stunning creative portfolio website that showcases artistic work at the highest level. Requirements:

VISUAL IDENTITY:
- Immersive hero section with interactive background animations
- Typography mixing modern sans-serif with elegant serif fonts
- Color scheme: Monochromatic base with vibrant accent colors
- Grid-based layout with masonry-style project galleries
- Premium photography with optimized loading and zoom functionality

PORTFOLIO SHOWCASE:
- Project grid with hover animations revealing project details
- Individual project pages with full-screen image galleries
- Before/after sliders for design transformations
- Video integration with custom controls and autoplay options
- Process documentation with step-by-step breakdowns
- Client testimonials with rotating carousel display

INTERACTIVE ELEMENTS:
- Smooth parallax scrolling with depth layering
- CSS Grid and Flexbox for complex responsive layouts
- Custom cursor effects and hover interactions
- Page transitions with smooth animations between sections
- Interactive timeline showing career progression
- Skills visualization with animated progress indicators

CONTENT SECTIONS:
- About page with personal story and professional journey
- Services offered with detailed descriptions and pricing
- Blog section for design insights and tutorials
- Contact form with real-time validation and success states
- Social media integration with live feed displays
- Downloadable resume/CV with tracking analytics

TECHNICAL FEATURES:
- Lazy loading for optimized performance
- SEO optimization with proper meta tags and structured data
- Image optimization with WebP format and responsive sizing
- Dark/light mode toggle with smooth transitions
- Mobile-first responsive design with touch-optimized interactions
- Analytics integration for visitor tracking and insights

ADVANCED ANIMATIONS:
- GSAP or Framer Motion for complex animations
- Scroll-triggered animations with intersection observers
- 3D CSS transforms for depth and perspective
- Loading animations with creative progress indicators
- Micro-interactions that delight and engage users

Make it feel like a world-class creative agency website with personality and professional polish.`,
      gradient: 'from-pink-400 to-red-600'
    },
    { 
      icon: '🛍️', 
      title: 'E-commerce Store', 
      prompt: `Design a premium e-commerce platform that rivals Amazon and Shopify. Requirements:

PRODUCT CATALOG:
- Advanced product grid with multiple view options (grid, list, detailed)
- Smart filtering system with faceted search capabilities
- Product quick-view modals with zoom functionality
- Comparison tool for side-by-side product evaluation
- Wishlist functionality with social sharing options
- Recently viewed products with personalized recommendations

PRODUCT DETAILS:
- High-resolution image gallery with 360-degree view options
- Detailed product specifications in tabbed interface
- Customer reviews and ratings with verified purchase badges
- Related products carousel with intelligent suggestions
- Stock availability indicators with restock notifications
- Size/color variations with real-time inventory updates

SHOPPING EXPERIENCE:
- Persistent shopping cart with saved items across sessions
- One-click checkout with multiple payment options integration
- Guest checkout option with account creation prompts
- Real-time shipping calculations and delivery estimates
- Promotional code system with automatic discount applications
- Save for later functionality and abandoned cart recovery

USER ACCOUNT FEATURES:
- Comprehensive user dashboard with order history
- Address book management with default shipping/billing
- Order tracking with real-time status updates and notifications
- Return/exchange requests with guided workflow
- Customer support chat integration with order context
- Loyalty program integration with points and rewards display

BUSINESS INTELLIGENCE:
- Analytics dashboard for sales performance
- Inventory management with low-stock alerts
- Customer behavior tracking and insights
- A/B testing framework for optimization
- Multi-currency and multi-language support
- Tax calculation integration for global commerce

TECHNICAL IMPLEMENTATION:
- Progressive Web App with offline browsing capabilities
- Advanced search with autocomplete and typo tolerance
- SEO optimization for product pages and categories
- Performance optimization for fast page loads
- Security features including SSL and payment protection
- Integration capabilities with CRM and marketing tools

Create an e-commerce experience that converts browsers into buyers with enterprise-level functionality.`,
      gradient: 'from-purple-400 to-indigo-600'
    },
    { 
      icon: '📊', 
      title: 'Analytics Platform', 
      prompt: `Build a comprehensive analytics platform that rivals Google Analytics and Tableau. Requirements:

DASHBOARD ARCHITECTURE:
- Customizable dashboard builder with drag-and-drop widgets
- Real-time data streaming with WebSocket connections
- Multi-source data integration (APIs, databases, files)
- Interactive charts with drill-down and zoom capabilities
- Automated report generation with scheduled delivery
- Executive summary views with key insights highlighting

DATA VISUALIZATION:
- Advanced chart types: line, bar, area, scatter, bubble, sankey
- Geographic visualization with interactive maps and heatmaps
- Funnel analysis with conversion tracking and optimization
- Cohort analysis with retention and engagement metrics
- Comparative analysis with period-over-period insights
- Custom metric calculations with formula builder

USER EXPERIENCE:
- Intuitive query builder for non-technical users
- Natural language query processing for data exploration
- Collaborative features with shared dashboards and annotations
- Alert system with threshold-based notifications
- Export capabilities in multiple formats (PDF, Excel, CSV, PNG)
- Mobile-responsive design for on-the-go analytics

ENTERPRISE FEATURES:
- Role-based access control with granular permissions
- Data governance tools with lineage tracking
- API integrations for popular business tools
- White-label customization for client portals
- Multi-tenant architecture with data isolation
- Audit trails and compliance reporting features

ADVANCED ANALYTICS:
- Machine learning insights with trend prediction
- Anomaly detection with automated alerts
- Statistical analysis tools with confidence intervals
- A/B testing framework with statistical significance
- Customer segmentation with behavioral clustering
- Predictive modeling with scenario planning

TECHNICAL SPECIFICATIONS:
- High-performance data processing for large datasets
- Caching strategies for optimal query performance
- Real-time collaboration with live cursor tracking
- Comprehensive error handling with user guidance
- Accessibility compliance for inclusive design
- API documentation with interactive examples

Design an analytics platform that empowers data-driven decision making with enterprise scalability.`,
      gradient: 'from-cyan-400 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden stable-height">
      {/* Ultra Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 animate-gradient"></div>
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl animate-float-3d"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/10 to-transparent rounded-full blur-3xl animate-float-3d delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-2xl animate-pulse-glow"></div>
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row h-screen h-[100dvh]">
        {/* Ultra Premium Sidebar - Mobile Responsive */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 border-r border-white/10 glass-ultra">
          <div className="flex-shrink-0 p-4 lg:p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="ios-card p-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                      {project.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadProject(project)
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {project.timestamp.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface - Responsive */}
        <div className={`${showPreview ? 'lg:w-1/2 w-full' : 'flex-1'} flex flex-col transition-all duration-700 ease-in-out min-w-0 stable-container`}>
          
          {/* Ultra Premium Header - Mobile Optimized */}
          <header className="flex-shrink-0 p-4 sm:p-6 lg:p-8 xl:p-12 border-b border-white/10 glass-ultra stable-container performance-optimized">
            <div className="w-full fluid-container">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg animate-pulse-glow">
                    <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                      CodeGenesis AI
                    </h1>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1">Ultimate AI development platform that builds the future 🚀</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                  {generatedCode && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="btn-ultra flex items-center justify-center space-x-2 flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                      <span className="sm:hidden">{showPreview ? 'Hide' : 'Preview'}</span>
                    </button>
                  )}
                  
                  <select 
                    value={currentModel} 
                    onChange={(e) => setCurrentModel(e.target.value)}
                    className="input-ultra text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 flex-1 sm:flex-none"
                  >
                    <option value="gemini" className="bg-gray-900">Gemini 2.0</option>
                    <option value="deepseek" className="bg-gray-900">DeepSeek V3</option>
                  </select>
                  
                  {/* Priority Selector */}
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as 'speed' | 'quality' | 'cost')}
                    className="input-ultra text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 flex-1 sm:flex-none"
                    title="Generation Priority"
                  >
                    <option value="quality" className="bg-gray-900">🎯 Quality</option>
                    <option value="speed" className="bg-gray-900">⚡ Speed</option>
                    <option value="cost" className="bg-gray-900">💰 Cost</option>
                  </select>
                  
                  {/* Generation Type Selector */}
                  <select 
                    value={generateType} 
                    onChange={(e) => setGenerateType(e.target.value as 'single' | 'fullstack')}
                    className="input-ultra text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 flex-1 sm:flex-none"
                    title="Generation Type"
                  >
                    <option value="single" className="bg-gray-900">📄 Single Page</option>
                    <option value="fullstack" className="bg-gray-900">🚀 Full-Stack</option>
                  </select>
                  
                  {/* Deploy Button */}
                  {generatedCode && (
                    <button
                      onClick={() => setShowDeployment(!showDeployment)}
                      className="btn-ultra flex items-center justify-center space-x-1 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                      title="Deploy Project"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Deploy</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowAnalytics(true)}
                    className="p-2 sm:p-3 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300"
                    title="View Analytics"
                  >
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                  </button>
                  
                  <button className="p-2 sm:p-3 glass-ultra rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300">
                    <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Messages Container - Responsive */}
          <div className="flex-1 overflow-y-auto min-h-0 stable-container performance-optimized smooth-scroll">
            <div className="w-full fluid-container py-4 sm:py-6 lg:py-8">
              
              {/* Ultra Premium Welcome State */}
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12 lg:py-20 animate-scale-in-3d">
                  <div className="mb-8 sm:mb-12">
                    <div className="inline-flex p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-ultra mb-6 sm:mb-8 card-3d">
                      <CommandLineIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 perspective-1000">
                      Build the future with{' '}
                      <span className="text-gradient animate-gradient">
                        AI precision
                      </span>
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
                      Experience the next evolution of AI-powered development with ultra-premium tools and interfaces
                    </p>
                  </div>
                  
                  {/* 3D Example Cards - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 w-full">
                    {examplePrompts.map((example, index) => (
                      <div
                        key={index}
                        onClick={() => setInput(example.prompt)}
                        className="card-3d ios-card p-6 cursor-pointer group perspective-1000 animate-slide-up-3d"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${example.gradient} flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {example.icon}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3">
                          Create an ultra-premium {example.title.toLowerCase()} with enterprise-level design and advanced features...
                        </p>
                        <div className="mt-3 sm:mt-4 flex items-center justify-between">
                          <div className="flex items-center text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                            <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Try this template
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`MASTER PROMPT TEMPLATE - ${example.title}:\n\n${example.prompt}`)
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20"
                          >
                            View Full Prompt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Messages */}
              <div className="space-y-8 gpu-accelerated">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-3d stable-container`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`max-w-4xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 text-white card-3d' 
                        : 'glass-ultra text-white ios-card'
                    } rounded-3xl px-8 py-6 shadow-ultra performance-optimized min-h-[120px]`}>
                      {message.type === 'assistant' ? (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-300">AI Assistant</span>
                              <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                                {currentModel === 'gemini' ? 'Gemini 2.0' : 'DeepSeek V3'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                                title="Copy code"
                              >
                                <ClipboardIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  const project: Project = {
                                    id: Date.now().toString(),
                                    name: 'Downloaded Project',
                                    preview: message.content,
                                    code: message.content,
                                    timestamp: new Date(),
                                    tags: []
                                  }
                                  downloadProject(project)
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                                title="Download project"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group">
                                <BookmarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="code-premium">
                            <CodeBlock code={message.content} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg font-medium whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-scale-in-3d stable-container">
                    <div className="glass-ultra rounded-3xl px-8 py-6 ios-card min-h-[120px] flex items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 font-medium">Generating ultra-premium code...</span>
                        <LoadingDots />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Ultra Premium Input Section - Mobile Responsive */}
          <div className="flex-shrink-0 border-t border-white/10 glass-ultra stable-container performance-optimized">
            <div className="w-full fluid-container py-4 sm:py-6 lg:py-8">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your vision in detail... ✨"
                    className="input-ultra w-full text-base sm:text-lg min-h-[70px] sm:min-h-[80px] max-h-[140px] sm:max-h-[160px] pr-16 sm:pr-20 smooth-transition"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 btn-ultra p-3 sm:p-4 rounded-xl sm:rounded-2xl"
                  >
                    <ArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-400">
                    <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Enter</kbd> to send</span>
                    <span className="hidden sm:inline">Use <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Shift+Enter</kbd> for new line</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-400">
                      Powered by {currentModel === 'gemini' ? 'Gemini 2.0' : 'DeepSeek V3'}
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Ultra Premium Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block lg:w-1/2 border-l border-white/10">
            <PreviewPane code={generatedCode} />
          </div>
        )}
        
        {/* Mobile Preview Overlay - Enhanced */}
        {showPreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
            <div className="h-full flex flex-col glass-ultra">
              <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Live Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
                >
                  <span className="text-white text-xl sm:text-2xl">×</span>
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <PreviewPane code={generatedCode} />
              </div>
            </div>
          </div>
        )}
        
        {/* Deployment Panel */}
        <DeploymentPanel 
          code={generatedCode} 
          isOpen={showDeployment} 
          onClose={() => setShowDeployment(false)} 
        />
        
        {/* Analytics Panel */}
        <AnalyticsPanel 
          isOpen={showAnalytics} 
          onClose={() => setShowAnalytics(false)} 
        />
      </div>
    </div>
  )
}
