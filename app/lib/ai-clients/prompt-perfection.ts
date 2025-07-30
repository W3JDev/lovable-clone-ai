/**
 * 🚀 PREMIUM PROMPT PERFECTION ENGINE
 * Transforms any basic prompt into a professional, structured, high-end prompt framework
 */

export interface PromptAnalysis {
  category: 'landing-page' | 'dashboard' | 'component' | 'app' | 'animation' | 'form' | 'portfolio' | 'ecommerce' | 'blog' | 'other'
  complexity: 'simple' | 'intermediate' | 'advanced' | 'enterprise'
  designStyle: 'modern' | 'minimalist' | 'corporate' | 'creative' | 'tech' | 'luxury' | 'startup'
  requiredFeatures: string[]
  targetAudience: string
  primaryColors: string[]
  industry: string
}

export class PromptPerfectionEngine {
  
  /**
   * Analyzes and categorizes the user's basic prompt
   */
  private analyzePrompt(prompt: string): PromptAnalysis {
    const lowerPrompt = prompt.toLowerCase()
    
    // Category detection
    let category: PromptAnalysis['category'] = 'other'
    if (lowerPrompt.includes('landing') || lowerPrompt.includes('homepage') || lowerPrompt.includes('website')) {
      category = 'landing-page'
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin') || lowerPrompt.includes('analytics')) {
      category = 'dashboard'
    } else if (lowerPrompt.includes('component') || lowerPrompt.includes('button') || lowerPrompt.includes('card')) {
      category = 'component'
    } else if (lowerPrompt.includes('app') || lowerPrompt.includes('application')) {
      category = 'app'
    } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('showcase')) {
      category = 'portfolio'
    } else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
      category = 'ecommerce'
    } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
      category = 'blog'
    }

    // Complexity detection
    let complexity: PromptAnalysis['complexity'] = 'simple'
    const complexityIndicators = [
      'advanced', 'complex', 'enterprise', 'sophisticated', 'professional', 'premium'
    ]
    const intermediateIndicators = [
      'interactive', 'responsive', 'dynamic', 'modern', 'animated'
    ]
    
    if (complexityIndicators.some(indicator => lowerPrompt.includes(indicator))) {
      complexity = 'enterprise'
    } else if (intermediateIndicators.some(indicator => lowerPrompt.includes(indicator))) {
      complexity = 'intermediate'
    }

    // Design style detection
    let designStyle: PromptAnalysis['designStyle'] = 'modern'
    if (lowerPrompt.includes('minimal') || lowerPrompt.includes('clean')) {
      designStyle = 'minimalist'
    } else if (lowerPrompt.includes('corporate') || lowerPrompt.includes('business')) {
      designStyle = 'corporate'
    } else if (lowerPrompt.includes('creative') || lowerPrompt.includes('artistic')) {
      designStyle = 'creative'
    } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('saas')) {
      designStyle = 'tech'
    } else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('premium')) {
      designStyle = 'luxury'
    } else if (lowerPrompt.includes('startup') || lowerPrompt.includes('innovation')) {
      designStyle = 'startup'
    }

    // Feature extraction
    const requiredFeatures: string[] = []
    const featureMap = {
      'form': ['form', 'contact', 'signup', 'login'],
      'navigation': ['nav', 'menu', 'header'],
      'footer': ['footer', 'bottom'],
      'gallery': ['gallery', 'photos', 'images'],
      'testimonials': ['testimonial', 'review', 'feedback'],
      'pricing': ['pricing', 'plan', 'subscription'],
      'team': ['team', 'about', 'staff'],
      'blog': ['blog', 'article', 'news'],
      'search': ['search', 'filter'],
      'cart': ['cart', 'shopping', 'checkout'],
      'authentication': ['login', 'signup', 'auth'],
      'dashboard': ['dashboard', 'analytics', 'charts'],
      'animation': ['animate', 'motion', 'transition'],
      'mobile': ['mobile', 'responsive'],
      'dark-mode': ['dark', 'theme'],
      'accessibility': ['accessible', 'a11y'],
      'seo': ['seo', 'meta', 'optimization']
    }

    Object.entries(featureMap).forEach(([feature, keywords]) => {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        requiredFeatures.push(feature)
      }
    })

    // Industry detection
    let industry = 'technology'
    const industries = {
      'coffee': ['coffee', 'cafe', 'espresso', 'latte'],
      'restaurant': ['restaurant', 'food', 'dining', 'menu'],
      'fitness': ['fitness', 'gym', 'workout', 'health'],
      'finance': ['finance', 'bank', 'investment', 'crypto'],
      'education': ['education', 'school', 'course', 'learning'],
      'healthcare': ['health', 'medical', 'doctor', 'clinic'],
      'real-estate': ['real estate', 'property', 'house', 'apartment'],
      'travel': ['travel', 'hotel', 'booking', 'vacation'],
      'fashion': ['fashion', 'clothing', 'style', 'apparel'],
      'technology': ['tech', 'software', 'app', 'digital']
    }

    Object.entries(industries).forEach(([ind, keywords]) => {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        industry = ind
      }
    })

    // Color scheme based on industry/style
    const colorSchemes = {
      'coffee': ['#8B4513', '#D2691E', '#F4A460'],
      'technology': ['#2563EB', '#7C3AED', '#059669'],
      'healthcare': ['#0EA5E9', '#22C55E', '#F8FAFC'],
      'finance': ['#1E40AF', '#059669', '#374151'],
      'luxury': ['#7C2D12', '#A16207', '#374151'],
      'minimalist': ['#374151', '#6B7280', '#F3F4F6'],
      'creative': ['#EC4899', '#8B5CF6', '#06B6D4']
    }

    const primaryColors = colorSchemes[industry as keyof typeof colorSchemes] || 
                         colorSchemes[designStyle as keyof typeof colorSchemes] || 
                         ['#2563EB', '#7C3AED', '#059669']

    return {
      category,
      complexity,
      designStyle,
      requiredFeatures,
      targetAudience: this.detectTargetAudience(prompt),
      primaryColors,
      industry
    }
  }

  private detectTargetAudience(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate')) {
      return 'Business professionals and corporate clients'
    } else if (lowerPrompt.includes('startup') || lowerPrompt.includes('tech')) {
      return 'Tech-savvy entrepreneurs and innovators'
    } else if (lowerPrompt.includes('customer') || lowerPrompt.includes('client')) {
      return 'End consumers and service clients'
    } else if (lowerPrompt.includes('young') || lowerPrompt.includes('millennial')) {
      return 'Young professionals and millennials'
    } else {
      return 'Modern web users seeking premium experiences'
    }
  }

  /**
   * Transforms basic prompt into premium professional framework
   */
  perfectPrompt(basicPrompt: string): string {
    const analysis = this.analyzePrompt(basicPrompt)
    
    const frameworks = {
      'landing-page': this.createLandingPageFramework,
      'dashboard': this.createDashboardFramework,
      'component': this.createComponentFramework,
      'app': this.createAppFramework,
      'animation': this.createAnimationFramework,
      'form': this.createFormFramework,
      'ecommerce': this.createEcommerceFramework,
      'portfolio': this.createPortfolioFramework,
      'blog': this.createBlogFramework,
      'other': this.createGenericFramework
    }

    const frameworkGenerator = frameworks[analysis.category] || frameworks.other
    return frameworkGenerator.call(this, basicPrompt, analysis)
  }

  private createLandingPageFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `🚀 PREMIUM LANDING PAGE GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create a stunning, conversion-optimized landing page based on: "${basicPrompt}"

**DESIGN REQUIREMENTS:**
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} design with ${analysis.complexity} complexity
• **Industry**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} sector
• **Target Audience**: ${analysis.targetAudience}
• **Color Palette**: Primary ${analysis.primaryColors[0]}, Secondary ${analysis.primaryColors[1]}, Accent ${analysis.primaryColors[2]}

**ESSENTIAL SECTIONS:**
1. **Hero Section**: Compelling headline, subheading, CTA button, background visual
2. **Value Proposition**: Clear benefits and unique selling points
3. **Features/Services**: Key offerings with icons and descriptions
4. **Social Proof**: Testimonials, logos, or trust indicators
5. **Call-to-Action**: Strategic placement and compelling copy
6. **Footer**: Contact info, links, social media

**TECHNICAL SPECIFICATIONS:**
• **Framework**: Pure HTML5, CSS3, JavaScript (ES6+)
• **Responsive**: Mobile-first design (320px to 2560px)
• **Performance**: Optimized loading, smooth animations
• **Accessibility**: WCAG 2.1 AA compliant
• **SEO**: Semantic HTML, meta tags, structured data

**ADVANCED FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} functionality`).join('\n')}

**VISUAL DESIGN:**
• Modern typography hierarchy (Google Fonts)
• Consistent spacing using 8px grid system
• Subtle shadows and gradients for depth
• Smooth hover effects and micro-interactions
• Professional imagery placeholders
• Icon system integration

**CONVERSION OPTIMIZATION:**
• Strategic CTA placement and design
• Urgency and scarcity elements
• Trust signals and credibility markers
• Clear value proposition messaging
• Friction-reduced user flow

Generate a complete, production-ready HTML file with embedded CSS and JavaScript that creates a stunning, professional landing page optimized for conversions and user experience.`
  }

  private createDashboardFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `📊 PREMIUM DASHBOARD GENERATION FRAMEWORK

**PROJECT BRIEF:**
Develop a sophisticated, data-driven dashboard based on: "${basicPrompt}"

**DESIGN REQUIREMENTS:**
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} dashboard with ${analysis.complexity} functionality
• **Industry**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} sector analytics
• **Users**: ${analysis.targetAudience}
• **Color Scheme**: Primary ${analysis.primaryColors[0]}, Data ${analysis.primaryColors[1]}, Success ${analysis.primaryColors[2]}

**CORE COMPONENTS:**
1. **Navigation Sidebar**: Menu items, user profile, settings
2. **Top Header**: Search, notifications, user dropdown
3. **Key Metrics Cards**: Important KPIs with trend indicators
4. **Data Visualizations**: Charts, graphs, progress bars
5. **Data Tables**: Sortable, filterable information display
6. **Action Panels**: Quick actions and controls

**TECHNICAL STACK:**
• **Framework**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
• **Charts**: CSS-based charts and SVG visualizations
• **Responsive**: Tablet and desktop optimized
• **Performance**: Efficient DOM manipulation
• **Data**: Mock JSON data with realistic metrics

**UI/UX PATTERNS:**
• Clean information hierarchy
• Consistent component spacing
• Intuitive navigation patterns
• Data visualization best practices
• Loading states and empty states
• Accessibility considerations

**INTERACTIVE FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} capabilities`).join('\n')}

**MODERN ELEMENTS:**
• Glassmorphism cards and panels
• Smooth transitions and animations
• Hover effects and active states
• Professional iconography
• Status indicators and badges
• Real-time data simulation

Generate a complete dashboard interface with embedded CSS and JavaScript that provides a professional, functional admin panel with realistic data and smooth interactions.`
  }

  private createComponentFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `🧩 PREMIUM COMPONENT GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create a reusable, professional component based on: "${basicPrompt}"

**DESIGN REQUIREMENTS:**
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} component design
• **Complexity**: ${analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)} functionality
• **Context**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} application
• **Colors**: ${analysis.primaryColors.join(', ')}

**COMPONENT SPECIFICATIONS:**
• **Reusability**: Modular and self-contained
• **Customization**: Configurable properties
• **States**: Default, hover, active, disabled, loading
• **Variants**: Multiple size and style options
• **Accessibility**: Full keyboard and screen reader support

**TECHNICAL IMPLEMENTATION:**
• **Semantic HTML**: Proper element structure
• **CSS Architecture**: BEM methodology or CSS modules
• **JavaScript**: Modern ES6+ functionality
• **Performance**: Optimized rendering
• **Cross-browser**: IE11+ compatibility

**INTERACTIVE BEHAVIOR:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} interaction`).join('\n')}

**DESIGN SYSTEM:**
• Consistent typography scale
• Standardized spacing units
• Color palette integration
• Icon system compatibility
• Animation timing functions

Generate a complete, professional component with HTML, CSS, and JavaScript that can be easily integrated into any project.`
  }

  private createAppFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `📱 PREMIUM APPLICATION GENERATION FRAMEWORK

**PROJECT BRIEF:**
Build a complete web application based on: "${basicPrompt}"

**APPLICATION ARCHITECTURE:**
• **Type**: ${analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)} application
• **Complexity**: ${analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)} features
• **Industry**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} domain
• **Users**: ${analysis.targetAudience}

**CORE FEATURES:**
1. **Authentication**: User login/signup system
2. **Navigation**: Intuitive app structure
3. **Main Interface**: Primary user workflows
4. **Data Management**: CRUD operations
5. **User Profile**: Account management
6. **Settings**: Configuration options

**TECHNICAL STACK:**
• **Frontend**: HTML5, CSS3, Vanilla JavaScript
• **Architecture**: Modular component structure
• **State Management**: Local storage integration
• **API**: RESTful service simulation
• **Security**: Input validation and sanitization

**USER EXPERIENCE:**
• **Onboarding**: Smooth user introduction
• **Navigation**: Intuitive information architecture
• **Feedback**: Loading states and success messages
• **Error Handling**: Graceful error management
• **Performance**: Fast interactions and transitions

**ADVANCED CAPABILITIES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} functionality`).join('\n')}

**DESIGN PRINCIPLES:**
• Mobile-first responsive design
• Consistent visual language
• Accessibility standards (WCAG 2.1)
• Performance optimization
• SEO best practices

Generate a complete web application with all necessary HTML, CSS, and JavaScript files that provides a professional, fully-functional user experience.`
  }

  private createEcommerceFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `🛒 PREMIUM E-COMMERCE GENERATION FRAMEWORK

**PROJECT BRIEF:**
Develop a conversion-optimized e-commerce solution based on: "${basicPrompt}"

**STORE REQUIREMENTS:**
• **Category**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} products
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} design approach
• **Audience**: ${analysis.targetAudience}
• **Brand Colors**: ${analysis.primaryColors.join(', ')}

**ESSENTIAL PAGES:**
1. **Homepage**: Featured products, categories, promotions
2. **Product Catalog**: Grid/list view with filtering
3. **Product Details**: Images, descriptions, reviews, add to cart
4. **Shopping Cart**: Item management and checkout preview
5. **Checkout**: Secure payment flow simulation
6. **User Account**: Order history and profile management

**E-COMMERCE FEATURES:**
• Product search and filtering
• Shopping cart functionality
• Wishlist capabilities
• Product recommendations
• Customer reviews system
• Inventory status indicators

**CONVERSION OPTIMIZATION:**
• Trust badges and security indicators
• Clear pricing and availability
• Compelling product imagery
• Social proof elements
• Urgency and scarcity tactics
• Simplified checkout process

**TECHNICAL IMPLEMENTATION:**
• **Performance**: Fast loading product pages
• **Security**: Secure form handling
• **SEO**: Product schema markup
• **Analytics**: Conversion tracking ready
• **Mobile**: Touch-optimized interface

**ADVANCED FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} integration`).join('\n')}

Generate a complete e-commerce website with HTML, CSS, and JavaScript that provides a professional shopping experience with realistic product data and smooth functionality.`
  }

  private createPortfolioFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `🎨 PREMIUM PORTFOLIO GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create a stunning professional portfolio based on: "${basicPrompt}"

**PORTFOLIO SPECIFICATIONS:**
• **Industry**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} professional
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} aesthetic
• **Level**: ${analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)} presentation
• **Audience**: ${analysis.targetAudience}

**ESSENTIAL SECTIONS:**
1. **Hero/Introduction**: Personal branding and value proposition
2. **About**: Professional story and expertise
3. **Portfolio/Work**: Project showcases with case studies
4. **Skills/Services**: Technical and creative capabilities
5. **Testimonials**: Client feedback and recommendations
6. **Contact**: Professional contact information

**SHOWCASE ELEMENTS:**
• Project thumbnail galleries
• Detailed case study presentations
• Before/after comparisons
• Process documentation
• Results and metrics
• Technology stack highlights

**PROFESSIONAL PRESENTATION:**
• Clean, sophisticated layouts
• High-quality imagery placeholders
• Consistent typography hierarchy
• Strategic white space usage
• Professional color palette
• Smooth navigation experience

**INTERACTIVE FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} showcase`).join('\n')}

**TECHNICAL EXCELLENCE:**
• **Performance**: Optimized image loading
• **SEO**: Professional visibility
• **Accessibility**: Inclusive design
• **Responsive**: All device compatibility
• **Print**: Print-friendly styles

Generate a complete portfolio website with HTML, CSS, and JavaScript that effectively showcases professional work and expertise with compelling visuals and smooth interactions.`
  }

  private createBlogFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `📝 PREMIUM BLOG GENERATION FRAMEWORK

**PROJECT BRIEF:**
Develop a professional blog platform based on: "${basicPrompt}"

**BLOG SPECIFICATIONS:**
• **Niche**: ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} content
• **Design**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} layout
• **Audience**: ${analysis.targetAudience}
• **Tone**: Professional and engaging

**CORE PAGES:**
1. **Homepage**: Featured articles and recent posts
2. **Article Pages**: Full blog post layouts
3. **Category Pages**: Organized content sections
4. **Archive**: Chronological post organization
5. **Author Pages**: Writer profiles and bios
6. **Search Results**: Content discovery interface

**CONTENT FEATURES:**
• Article reading experience
• Category and tag organization
• Search functionality
• Related posts suggestions
• Social sharing buttons
• Comment system interface

**READER ENGAGEMENT:**
• Newsletter subscription
• Social media integration
• Reading progress indicators
• Estimated reading time
• Article bookmarking
• Print-friendly layouts

**TECHNICAL OPTIMIZATION:**
• **SEO**: Structured data and meta optimization
• **Performance**: Fast content loading
• **Accessibility**: Screen reader friendly
• **Typography**: Optimal reading experience
• **Mobile**: Touch-optimized interface

**ADVANCED FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} capability`).join('\n')}

Generate a complete blog website with HTML, CSS, and JavaScript that provides an excellent reading experience with professional content presentation and user-friendly navigation.`
  }

  private createGenericFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `✨ PREMIUM WEB SOLUTION GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create a professional web solution based on: "${basicPrompt}"

**SOLUTION REQUIREMENTS:**
• **Category**: ${analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)} implementation
• **Complexity**: ${analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)} features
• **Style**: ${analysis.designStyle.charAt(0).toUpperCase() + analysis.designStyle.slice(1)} design
• **Target**: ${analysis.targetAudience}

**CORE COMPONENTS:**
• Primary user interface
• Navigation structure
• Content presentation
• Interactive elements
• Call-to-action areas
• Footer information

**DESIGN PRINCIPLES:**
• Modern, professional aesthetics
• Intuitive user experience
• Consistent visual hierarchy
• Strategic color usage: ${analysis.primaryColors.join(', ')}
• Responsive layout design
• Accessibility compliance

**TECHNICAL STANDARDS:**
• **HTML**: Semantic, valid markup
• **CSS**: Modern features and optimization
• **JavaScript**: Enhanced interactivity
• **Performance**: Fast loading and rendering
• **SEO**: Search engine optimized
• **Cross-browser**: Wide compatibility

**REQUIRED FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature.charAt(0).toUpperCase() + feature.slice(1)} functionality`).join('\n')}

**QUALITY STANDARDS:**
• Professional code structure
• Comprehensive functionality
• Polished visual design
• Smooth user interactions
• Error-free implementation
• Production-ready quality

Generate a complete, professional web solution with HTML, CSS, and JavaScript that meets all requirements and provides an exceptional user experience.`
  }

  private createFormFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `📝 PREMIUM FORM GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create a professional, user-friendly form based on: "${basicPrompt}"

**FORM SPECIFICATIONS:**
• Form Type: ${analysis.complexity} complexity
• Design Style: ${analysis.designStyle}
• Target Audience: ${analysis.targetAudience}
• Industry Context: ${analysis.industry}

**TECHNICAL REQUIREMENTS:**
• Complete HTML5 form with semantic markup
• Advanced CSS styling with modern design patterns
• Client-side validation with real-time feedback
• Responsive design for all devices
• Accessibility compliance (ARIA labels, focus management)
• Progressive enhancement
• Form submission handling with success/error states

**DESIGN SPECIFICATIONS:**
• Modern ${analysis.designStyle} aesthetic
• Primary colors: ${analysis.primaryColors.join(', ')}
• Intuitive field organization and grouping
• Clear visual hierarchy and typography
• Smooth animations and micro-interactions
• Professional error messaging
• Loading states and confirmation feedback

**FUNCTIONAL FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature}`).join('\n')}
• Input validation and sanitization
• Conditional field display logic
• File upload capabilities (if needed)
• Multi-step form progression (if complex)
• Auto-save and data persistence
• Keyboard navigation support

Generate a complete, accessible form solution with HTML, CSS, and JavaScript that provides excellent UX.`
  }

  private createAnimationFramework(basicPrompt: string, analysis: PromptAnalysis): string {
    return `🎬 PREMIUM ANIMATION GENERATION FRAMEWORK

**PROJECT BRIEF:**
Create stunning, performant animations based on: "${basicPrompt}"

**ANIMATION SPECIFICATIONS:**
• Animation Type: ${analysis.complexity} complexity
• Design Style: ${analysis.designStyle}
• Target Audience: ${analysis.targetAudience}
• Industry Context: ${analysis.industry}

**TECHNICAL REQUIREMENTS:**
• CSS3 animations with hardware acceleration
• Smooth 60fps performance
• Cross-browser compatibility
• Responsive animation scaling
• Reduced motion accessibility support
• Optimized animation timing and easing
• JavaScript animation controls (if needed)

**DESIGN SPECIFICATIONS:**
• Modern ${analysis.designStyle} aesthetic
• Primary colors: ${analysis.primaryColors.join(', ')}
• Fluid, natural motion curves
• Appropriate timing and duration
• Visual storytelling elements
• Brand-consistent animation style
• Interactive hover and click states

**ANIMATION FEATURES:**
${analysis.requiredFeatures.map(feature => `• ${feature}`).join('\n')}
• CSS keyframe animations
• Transform and transition effects
• SVG path animations (if applicable)
• Scroll-triggered animations
• Loading and progress indicators
• Micro-interactions and feedback
• Animation sequence orchestration

Generate complete, performant animation code with HTML, CSS, and JavaScript that creates engaging user experiences.`
  }
}

export const promptPerfectionEngine = new PromptPerfectionEngine()
