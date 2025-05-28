import { generateContentWithGroq } from './groqService';
import { generateTags } from './geminiService';

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  hasApiKeys: boolean;
}

interface WeeklySchedule {
  id: string;
  platformId: string;
  dayOfWeek: string;
  time: string;
  postsPerDay: number;
  enabled: boolean;
  createdByAI: boolean;
  aiReasoning?: string;
}

interface PlatformAnalytics {
  platform: string;
  followers: number;
  engagement: number;
  impressions: number;
  clicks: number;
  bestPostingTimes: string[];
  bestDays: string[];
}

const PLATFORM_OPTIMAL_TIMES = {
  'hashnode': ['09:00', '14:00', '18:00'],
  'devTo': ['08:00', '13:00', '17:00'],
  'twitter': ['09:00', '12:00', '15:00', '18:00'],
  'linkedin': ['08:00', '12:00', '17:00'],
  'instagram': ['11:00', '14:00', '17:00', '20:00'],
  'youtube': ['14:00', '18:00', '20:00']
};

const PLATFORM_OPTIMAL_DAYS = {
  'hashnode': ['tuesday', 'wednesday', 'thursday'],
  'devTo': ['tuesday', 'wednesday', 'thursday'],
  'twitter': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  'linkedin': ['tuesday', 'wednesday', 'thursday'],
  'instagram': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  'youtube': ['thursday', 'friday', 'saturday', 'sunday']
};

export async function generateOptimalSchedules(platforms: PlatformConfig[]): Promise<WeeklySchedule[]> {
  const schedules: WeeklySchedule[] = [];
  
  try {
    // Get current analytics for all platforms
    const analytics = await getCurrentAnalytics(platforms);
    
    for (const platform of platforms) {
      const platformAnalytics = analytics.find(a => a.platform === platform.id);
      const optimalTimes = PLATFORM_OPTIMAL_TIMES[platform.id as keyof typeof PLATFORM_OPTIMAL_TIMES] || ['09:00'];
      const optimalDays = PLATFORM_OPTIMAL_DAYS[platform.id as keyof typeof PLATFORM_OPTIMAL_DAYS] || ['monday'];
      
      // Generate AI reasoning for the schedule
      const aiReasoning = await generateScheduleReasoning(platform, platformAnalytics);
      
      // Create schedules for optimal days
      for (let i = 0; i < Math.min(optimalDays.length, 3); i++) {
        const day = optimalDays[i];
        const time = optimalTimes[i % optimalTimes.length];
        
        const schedule: WeeklySchedule = {
          id: `ai-schedule-${platform.id}-${day}-${Date.now()}`,
          platformId: platform.id,
          dayOfWeek: day,
          time: time,
          postsPerDay: getPlatformOptimalPostFrequency(platform.id),
          enabled: true,
          createdByAI: true,
          aiReasoning: aiReasoning
        };
        
        schedules.push(schedule);
      }
    }
    
    return schedules;
  } catch (error) {
    console.error('Error generating optimal schedules:', error);
    return [];
  }
}

export async function optimizeExistingSchedules(
  currentSchedules: WeeklySchedule[], 
  platforms: PlatformConfig[]
): Promise<WeeklySchedule[]> {
  try {
    // Get current analytics
    const analytics = await getCurrentAnalytics(platforms);
    
    // Only optimize AI-created schedules
    const optimizedSchedules = await Promise.all(
      currentSchedules.map(async (schedule) => {
        if (!schedule.createdByAI) {
          return schedule; // Don't modify manual schedules
        }
        
        const platformAnalytics = analytics.find(a => a.platform === schedule.platformId);
        
        if (platformAnalytics && shouldOptimizeSchedule(schedule, platformAnalytics)) {
          const newTiming = await getOptimalTiming(schedule.platformId, platformAnalytics);
          const newReasoning = await generateScheduleReasoning(
            platforms.find(p => p.id === schedule.platformId)!,
            platformAnalytics
          );
          
          return {
            ...schedule,
            dayOfWeek: newTiming.day,
            time: newTiming.time,
            aiReasoning: newReasoning
          };
        }
        
        return schedule;
      })
    );
    
    return optimizedSchedules;
  } catch (error) {
    console.error('Error optimizing schedules:', error);
    return currentSchedules;
  }
}

async function getCurrentAnalytics(platforms: PlatformConfig[]): Promise<PlatformAnalytics[]> {
  // This would integrate with real analytics APIs
  // For now, return mock data with some variation
  return platforms.map(platform => ({
    platform: platform.id,
    followers: Math.floor(Math.random() * 10000) + 1000,
    engagement: Math.floor(Math.random() * 5) + 1,
    impressions: Math.floor(Math.random() * 50000) + 10000,
    clicks: Math.floor(Math.random() * 1000) + 100,
    bestPostingTimes: PLATFORM_OPTIMAL_TIMES[platform.id as keyof typeof PLATFORM_OPTIMAL_TIMES] || ['09:00'],
    bestDays: PLATFORM_OPTIMAL_DAYS[platform.id as keyof typeof PLATFORM_OPTIMAL_DAYS] || ['monday']
  }));
}

async function generateScheduleReasoning(
  platform: PlatformConfig, 
  analytics?: PlatformAnalytics
): Promise<string> {
  try {
    const prompt = `Generate a brief explanation (max 80 characters) for why this posting schedule is optimal for ${platform.name}. 
    Analytics: ${analytics ? `${analytics.engagement}% engagement rate, ${analytics.followers} followers` : 'No analytics available'}
    Focus on timing and audience behavior.`;
    
    // Try to use Groq first, fallback to simple reasoning
    try {
      const result = await generateContentWithGroq(prompt, process.env.GROQ_API_KEY || '', 'llama3-8b-8192');
      return result.content.slice(0, 80) + (result.content.length > 80 ? '...' : '');
    } catch (groqError) {
      console.log('Groq service unavailable, using fallback reasoning');
      return `Optimized for ${platform.name} audience engagement patterns`;
    }
  } catch (error) {
    return `Optimized for ${platform.name} audience engagement patterns`;
  }
}

function getPlatformOptimalPostFrequency(platformId: string): number {
  const frequencies = {
    'hashnode': 1,
    'devTo': 1,
    'twitter': 3,
    'linkedin': 1,
    'instagram': 2,
    'youtube': 1
  };
  
  return frequencies[platformId as keyof typeof frequencies] || 1;
}

function shouldOptimizeSchedule(schedule: WeeklySchedule, analytics: PlatformAnalytics): boolean {
  // Simple logic to determine if schedule needs optimization
  // In a real implementation, this would be more sophisticated
  return analytics.engagement < 2 || Math.random() > 0.8; // 20% chance to optimize
}

async function getOptimalTiming(platformId: string, analytics: PlatformAnalytics): Promise<{day: string, time: string}> {
  const optimalTimes = PLATFORM_OPTIMAL_TIMES[platformId as keyof typeof PLATFORM_OPTIMAL_TIMES] || ['09:00'];
  const optimalDays = PLATFORM_OPTIMAL_DAYS[platformId as keyof typeof PLATFORM_OPTIMAL_DAYS] || ['monday'];
  
  // Use analytics to pick the best timing
  const bestTime = analytics.bestPostingTimes?.[0] || optimalTimes[0];
  const bestDay = analytics.bestDays?.[0] || optimalDays[0];
  
  return {
    day: bestDay,
    time: bestTime
  };
}
