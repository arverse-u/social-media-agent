
import { generateContentWithGroq } from './groqService';
import { generateOptimizedContent } from './geminiService';
import { loadApiKeys } from '@/config/apiKeys';

interface ScheduleOptimization {
  platformId: string;
  optimalTimes: {
    day: string;
    time: string;
    reasoning: string;
    engagementScore: number;
  }[];
}

interface PlatformAnalytics {
  platform: string;
  followers: number;
  engagement: number;
  impressions: number;
  clicks: number;
  bestPerformingTimes: string[];
}

// Create the missing API call functions
export async function callGroqAPI(prompt: string, model: string = 'llama3-8b-8192') {
  const keys = loadApiKeys();
  if (!keys.ai?.openai?.apiKey) {
    throw new Error('API key not configured');
  }
  
  return await generateContentWithGroq(prompt, keys.ai.openai.apiKey, model);
}

export async function callGeminiAPI(prompt: string) {
  const keys = loadApiKeys();
  if (!keys.ai?.gemini?.apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  return { content };
}

export async function generateOptimalTimingSuggestions(platformAnalytics: PlatformAnalytics[]): Promise<ScheduleOptimization[]> {
  try {
    const prompt = `
    Based on the following platform analytics data, suggest optimal posting times for each platform.
    Consider engagement patterns, audience behavior, and platform-specific best practices.
    
    Analytics Data:
    ${JSON.stringify(platformAnalytics, null, 2)}
    
    For each platform, provide:
    1. Top 3 optimal posting days and times
    2. Reasoning based on analytics
    3. Engagement score prediction (1-10)
    
    Return the response as a JSON array with this structure:
    [
      {
        "platformId": "platform_name",
        "optimalTimes": [
          {
            "day": "monday",
            "time": "09:00",
            "reasoning": "High engagement based on analytics",
            "engagementScore": 8
          }
        ]
      }
    ]
    `;

    // Try Gemini first for suggestions
    let response;
    try {
      response = await callGeminiAPI(prompt);
    } catch (error) {
      console.log('Gemini API failed, generating fallback suggestions...');
      return generateFallbackSuggestions(platformAnalytics);
    }

    if (response?.content) {
      try {
        const suggestions = JSON.parse(response.content);
        // Store suggestions in localStorage for user to see
        localStorage.setItem('astrumverse_ai_timing_suggestions', JSON.stringify({
          suggestions,
          generatedAt: new Date().toISOString()
        }));
        return suggestions;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return generateFallbackSuggestions(platformAnalytics);
      }
    }

    return generateFallbackSuggestions(platformAnalytics);
  } catch (error) {
    console.error('Error generating timing suggestions:', error);
    return generateFallbackSuggestions(platformAnalytics);
  }
}

function generateFallbackSuggestions(platformAnalytics: PlatformAnalytics[]): ScheduleOptimization[] {
  return platformAnalytics.map(analytics => ({
    platformId: analytics.platform,
    optimalTimes: [
      {
        day: 'tuesday',
        time: '10:00',
        reasoning: 'Default optimal time based on general best practices',
        engagementScore: 7
      },
      {
        day: 'thursday',
        time: '15:00',
        reasoning: 'Afternoon engagement peak',
        engagementScore: 6
      },
      {
        day: 'saturday',
        time: '12:00',
        reasoning: 'Weekend activity time',
        engagementScore: 6
      }
    ]
  }));
}

export function scheduleNightlyAnalysisAndSuggestions(): void {
  // Schedule analysis to run every day at 12:00 AM IST
  const scheduleNextAnalysis = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const target = new Date(istTime);
    target.setHours(0, 0, 0, 0); // 12:00 AM IST
    
    // If target time has passed today, schedule for tomorrow
    if (target <= istTime) {
      target.setDate(target.getDate() + 1);
    }
    
    const timeUntilTarget = target.getTime() - now.getTime();
    
    setTimeout(async () => {
      console.log('Starting nightly analytics analysis and suggestion generation at', new Date().toISOString());
      
      try {
        const analyticsData = getStoredAnalytics();
        
        if (analyticsData.length > 0) {
          await generateOptimalTimingSuggestions(analyticsData);
          console.log('AI timing suggestions generated and stored');
        }
      } catch (error) {
        console.error('Error in nightly analysis:', error);
      }
      
      // Schedule next analysis
      scheduleNextAnalysis();
    }, timeUntilTarget);
    
    console.log(`Next AI analysis scheduled for: ${target.toISOString()}`);
  };
  
  scheduleNextAnalysis();
}

function getStoredAnalytics(): PlatformAnalytics[] {
  try {
    const stored = localStorage.getItem('astrumverse_analytics_data');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored analytics:', error);
    return [];
  }
}
