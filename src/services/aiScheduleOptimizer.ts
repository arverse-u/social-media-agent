
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
  if (!keys.ai?.groq?.apiKey) {
    throw new Error('Groq API key not configured');
  }
  
  return await generateContentWithGroq(prompt, keys.ai.groq.apiKey, model);
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

export async function optimizeSchedulesWithAI(platformAnalytics: PlatformAnalytics[]): Promise<ScheduleOptimization[]> {
  try {
    const prompt = `
    Based on the following platform analytics data, suggest optimal posting times for each platform.
    Consider engagement patterns, audience behavior, and platform-specific best practices.
    
    Analytics Data:
    ${JSON.stringify(platformAnalytics, null, 2)}
    
    For each platform, provide:
    1. Optimal posting days and times
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

    // Try Groq first, fallback to Gemini
    let response;
    try {
      response = await callGroqAPI(prompt, 'llama-3.1-8b-instant');
    } catch (error) {
      console.log('Groq API failed, trying Gemini...');
      response = await callGeminiAPI(prompt);
    }

    if (response?.content) {
      try {
        const optimizations = JSON.parse(response.content);
        return optimizations;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return generateFallbackSchedules(platformAnalytics);
      }
    }

    return generateFallbackSchedules(platformAnalytics);
  } catch (error) {
    console.error('Error optimizing schedules with AI:', error);
    return generateFallbackSchedules(platformAnalytics);
  }
}

function generateFallbackSchedules(platformAnalytics: PlatformAnalytics[]): ScheduleOptimization[] {
  return platformAnalytics.map(analytics => ({
    platformId: analytics.platform,
    optimalTimes: [
      {
        day: 'tuesday',
        time: '10:00',
        reasoning: 'Default optimal time based on general best practices',
        engagementScore: 7
      }
    ]
  }));
}

export function scheduleHourlyOptimization(): void {
  // Schedule optimization to run every hour
  const runOptimization = async () => {
    console.log('Running hourly AI schedule optimization...');
    
    try {
      // Get current analytics from localStorage or service
      const analyticsData = getStoredAnalytics();
      
      if (analyticsData.length > 0) {
        const optimizations = await optimizeSchedulesWithAI(analyticsData);
        
        // Check if it's night time (12:00 AM IST) to update schedules for next day
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        
        if (istTime.getHours() === 0) { // 12:00 AM IST
          updateSchedulesForNextDay(optimizations);
        }
      }
    } catch (error) {
      console.error('Error in hourly optimization:', error);
    }
  };

  // Run immediately and then every hour
  runOptimization();
  setInterval(runOptimization, 60 * 60 * 1000); // Every hour
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

function updateSchedulesForNextDay(optimizations: ScheduleOptimization[]): void {
  try {
    const currentSchedules = JSON.parse(localStorage.getItem('astrumverse_weekly_schedules') || '[]');
    const aiOptimizationEnabled = JSON.parse(localStorage.getItem('astrumverse_ai_optimization') || 'false');
    
    if (!aiOptimizationEnabled) return;
    
    // Remove existing AI schedules
    const userSchedules = currentSchedules.filter((s: any) => s.createdBy === 'user');
    
    // Generate new AI schedules based on optimizations
    const newAiSchedules: any[] = [];
    
    optimizations.forEach(optimization => {
      optimization.optimalTimes.forEach((timeSlot, index) => {
        newAiSchedules.push({
          id: `ai-schedule-${Date.now()}-${optimization.platformId}-${index}`,
          platformId: optimization.platformId,
          dayOfWeek: timeSlot.day,
          time: timeSlot.time,
          enabled: true,
          createdBy: 'ai',
          aiReasoning: timeSlot.reasoning,
          createdAt: new Date().toISOString(),
        });
      });
    });
    
    // Save updated schedules
    const updatedSchedules = [...userSchedules, ...newAiSchedules];
    localStorage.setItem('astrumverse_weekly_schedules', JSON.stringify(updatedSchedules));
    
    console.log(`Updated AI schedules for next day: ${newAiSchedules.length} schedules created`);
  } catch (error) {
    console.error('Error updating schedules for next day:', error);
  }
}
