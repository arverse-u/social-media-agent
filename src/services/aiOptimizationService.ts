import { loadApiKeys } from '@/config/apiKeys';
import { ContentItem } from '@/types';

interface OptimizationResult {
  optimizedTitle: string;
  optimizedContent: string;
  optimizedTags: string[];
  seoScore: number;
  engagementPrediction: number;
  recommendations: string[];
}

export class AutonomousAIOptimizer {
  private isRunning: boolean = false;
  private optimizationQueue: ContentItem[] = [];

  constructor() {
    this.startAutonomousOptimization();
  }

  addToOptimizationQueue(content: ContentItem): void {
    this.optimizationQueue.push(content);
  }

  private startAutonomousOptimization(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run optimization every 30 seconds
    setInterval(async () => {
      if (this.optimizationQueue.length > 0) {
        const content = this.optimizationQueue.shift();
        if (content) {
          await this.optimizeContent(content);
        }
      }
      
      // Also run autonomous analysis
      await this.runAutonomousAnalysis();
    }, 30000);
  }

  private async optimizeContent(content: ContentItem): Promise<OptimizationResult | null> {
    const keys = loadApiKeys();
    
    try {
      // Use Gemini 2.0 Flash for content optimization
      if (keys.ai?.gemini?.apiKey) {
        const geminiResult = await this.optimizeWithGemini(content, keys.ai.gemini.apiKey);
        if (geminiResult) {
          // Store optimization result
          this.storeOptimizationResult(content.id, geminiResult);
          return geminiResult;
        }
      }

      // Fallback to Groq Llama3
      if (keys.ai?.backupAi1?.apiKey && keys.ai.backupAi1.provider === 'groq') {
        const groqResult = await this.optimizeWithGroq(content, keys.ai.backupAi1.apiKey);
        if (groqResult) {
          this.storeOptimizationResult(content.id, groqResult);
          return groqResult;
        }
      }

    } catch (error) {
      console.error('Error optimizing content:', error);
    }

    return null;
  }

  private async optimizeWithGemini(content: ContentItem, apiKey: string): Promise<OptimizationResult | null> {
    const prompt = `
    Analyze and optimize this content for maximum SEO and engagement:
    
    Platform: ${content.category}
    Title: ${content.title}
    Content: ${content.content}
    Current Tags: ${content.tags.join(', ')}
    
    Provide intelligent optimization with:
    1. SEO-optimized title (platform-appropriate length)
    2. Enhanced content with better structure and keywords
    3. Optimized hashtags/tags for maximum discoverability
    4. SEO score prediction (1-100)
    5. Engagement prediction (0.0-1.0)
    6. Specific recommendations for improvement
    
    Focus on:
    - Trending keywords and topics
    - Platform-specific best practices
    - Audience engagement optimization
    - Search visibility enhancement
    
    Return ONLY valid JSON:
    {
      "optimizedTitle": "improved title",
      "optimizedContent": "enhanced content",
      "optimizedTags": ["tag1", "tag2", "tag3"],
      "seoScore": 85,
      "engagementPrediction": 0.8,
      "recommendations": ["specific improvement 1", "specific improvement 2"]
    }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('Gemini optimization error:', error);
    }

    return null;
  }

  private async optimizeWithGroq(content: ContentItem, apiKey: string): Promise<OptimizationResult | null> {
    const prompt = `
    Optimize this ${content.category} content for maximum performance:
    
    Title: ${content.title}
    Content: ${content.content}
    Tags: ${content.tags.join(', ')}
    
    Provide intelligent optimization focusing on SEO, engagement, and platform best practices.
    
    Return ONLY valid JSON:
    {
      "optimizedTitle": "improved title",
      "optimizedContent": "enhanced content", 
      "optimizedTags": ["tag1", "tag2"],
      "seoScore": 85,
      "engagementPrediction": 0.8,
      "recommendations": ["improvement 1", "improvement 2"]
    }
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content optimizer. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      const content_text = data.choices[0].message.content;
      
      const jsonMatch = content_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Groq optimization error:', error);
    }

    return null;
  }

  private async runAutonomousAnalysis(): Promise<void> {
    // Analyze current content performance and make intelligent decisions
    const analytics = JSON.parse(localStorage.getItem('platform_analytics') || '[]');
    const contentItems = JSON.parse(localStorage.getItem('content_items') || '[]');
    
    if (analytics.length > 0 && contentItems.length > 0) {
      // Identify underperforming content
      const underperformingContent = this.identifyUnderperformingContent(analytics, contentItems);
      
      // Add to optimization queue
      underperformingContent.forEach(content => {
        if (!this.optimizationQueue.find(item => item.id === content.id)) {
          this.optimizationQueue.push(content);
        }
      });

      // Generate autonomous recommendations
      await this.generateAutonomousRecommendations(analytics);
    }
  }

  private identifyUnderperformingContent(analytics: any[], contentItems: ContentItem[]): ContentItem[] {
    // Simple algorithm to identify content with low engagement
    const underperforming: ContentItem[] = [];
    
    const latestAnalytics = analytics[analytics.length - 1]?.analytics || [];
    
    contentItems.forEach(content => {
      const contentAge = Date.now() - new Date(content.createdAt).getTime();
      const daysSinceCreated = contentAge / (1000 * 60 * 60 * 24);
      
      // If content is older than 1 day and has low engagement potential, mark for optimization
      if (daysSinceCreated > 1 && content.publishStatus === 'draft') {
        underperforming.push(content);
      }
    });
    
    return underperforming;
  }

  private async generateAutonomousRecommendations(analytics: any[]): Promise<void> {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) return;

    const prompt = `
    Analyze this social media performance data and provide autonomous optimization recommendations:
    
    Analytics Data: ${JSON.stringify(analytics.slice(-7))} // Last 7 entries
    
    Generate intelligent recommendations for:
    1. Best posting times for each platform
    2. Content types that perform best
    3. Hashtag strategies
    4. Engagement optimization tactics
    5. SEO improvements
    
    Focus on autonomous decision-making for continuous improvement.
    
    Return JSON with actionable recommendations.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${keys.ai.gemini.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        }),
      });

      const data = await response.json();
      const recommendations = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (recommendations) {
        // Store recommendations for user review
        const existingRecommendations = JSON.parse(localStorage.getItem('ai_recommendations') || '[]');
        existingRecommendations.push({
          timestamp: new Date().toISOString(),
          recommendations: recommendations
        });
        
        // Keep only last 30 recommendations
        if (existingRecommendations.length > 30) {
          existingRecommendations.splice(0, existingRecommendations.length - 30);
        }
        
        localStorage.setItem('ai_recommendations', JSON.stringify(existingRecommendations));
      }
    } catch (error) {
      console.error('Error generating autonomous recommendations:', error);
    }
  }

  private storeOptimizationResult(contentId: string, result: OptimizationResult): void {
    const optimizations = JSON.parse(localStorage.getItem('content_optimizations') || '{}');
    optimizations[contentId] = {
      ...result,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('content_optimizations', JSON.stringify(optimizations));
  }

  getOptimizationHistory(): any[] {
    return Object.values(JSON.parse(localStorage.getItem('content_optimizations') || '{}'));
  }

  getAIRecommendations(): any[] {
    return JSON.parse(localStorage.getItem('ai_recommendations') || '[]');
  }
}

export const autonomousOptimizer = new AutonomousAIOptimizer();
