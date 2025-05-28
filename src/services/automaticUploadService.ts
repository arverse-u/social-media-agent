
import { loadApiKeys } from '@/config/apiKeys';
import { fetchContentFromSources } from './sourceContentService';
import { publishContent } from './platformPublishService';
import { addContentItem } from './databaseService';
import { ContentItem } from '@/types';
import { generateOptimizedContent } from './geminiService';

interface WeeklySchedule {
  id: string;
  platformId: string;
  selectedDays: string[];
  time: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
}

interface PlatformSettings {
  platformId: string;
  postsPerDay: number;
  enabled: boolean;
}

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  hasApiKeys: boolean;
}

export class AutomaticUploadService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting automatic upload service...');
    
    // Check every 5 minutes for scheduled posts
    this.checkInterval = setInterval(() => {
      this.checkAndExecuteSchedules();
    }, 5 * 60 * 1000);
    
    // Initial check
    this.checkAndExecuteSchedules();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Stopped automatic upload service');
  }

  private async checkAndExecuteSchedules() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      console.log(`Checking schedules for ${currentDay} at ${currentTime}`);

      const schedules = this.getActiveSchedules();
      const platforms = this.getActivePlatforms();
      const platformSettings = this.getPlatformSettings();

      for (const schedule of schedules) {
        if (this.shouldExecuteSchedule(schedule, currentDay, currentTime)) {
          const platform = platforms.find(p => p.id === schedule.platformId);
          const settings = platformSettings.find(s => s.platformId === schedule.platformId);
          
          if (platform && settings && platform.hasApiKeys) {
            await this.executeScheduleForPlatform(platform, settings);
          }
        }
      }
    } catch (error) {
      console.error('Error checking schedules:', error);
    }
  }

  private shouldExecuteSchedule(schedule: WeeklySchedule, currentDay: string, currentTime: string): boolean {
    if (!schedule.enabled) return false;
    if (!schedule.selectedDays.includes(currentDay)) return false;
    
    // Check if current time matches schedule time (within 5 minute window)
    const scheduleTime = schedule.time;
    const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    
    const scheduleMinutes = scheduleHour * 60 + scheduleMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    
    // Execute if within 5 minutes of schedule time
    return Math.abs(currentMinutes - scheduleMinutes) <= 5;
  }

  private async executeScheduleForPlatform(platform: any, settings: PlatformSettings) {
    try {
      console.log(`Executing schedule for ${platform.name}, posts per day: ${settings.postsPerDay}`);
      
      // Check if we've already posted enough times today
      const todayPostCount = this.getTodayPostCount(platform.id);
      if (todayPostCount >= settings.postsPerDay) {
        console.log(`Already posted ${todayPostCount} times today for ${platform.name}`);
        return;
      }

      // Fetch content from configured sources
      const sourceContent = await this.fetchSourceContent(platform.id);
      if (!sourceContent || sourceContent.length === 0) {
        console.log(`No source content available for ${platform.name}`);
        return;
      }

      // Process and publish content
      const remainingPosts = settings.postsPerDay - todayPostCount;
      const contentToProcess = sourceContent.slice(0, remainingPosts);

      for (const content of contentToProcess) {
        await this.processAndPublishContent(content, platform);
      }
      
    } catch (error) {
      console.error(`Error executing schedule for ${platform.name}:`, error);
    }
  }

  private async fetchSourceContent(platformId: string): Promise<any[]> {
    try {
      const keys = loadApiKeys();
      
      // Fetch content from configured sources based on platform
      const sourceContent = await fetchContentFromSources({
        platforms: [platformId],
        apiKeys: keys
      });
      
      return sourceContent;
    } catch (error) {
      console.error('Error fetching source content:', error);
      return [];
    }
  }

  private async processAndPublishContent(sourceContent: any, platform: any) {
    try {
      // Use AI to optimize content for the specific platform
      const optimizedContent = await this.optimizeContentForPlatform(sourceContent, platform.id);
      
      // Create content item
      const contentItem: ContentItem = {
        id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: optimizedContent.title,
        content: optimizedContent.content,
        excerpt: optimizedContent.excerpt || sourceContent.excerpt,
        author: sourceContent.author || 'Auto Publisher',
        tags: optimizedContent.tags || sourceContent.tags || [],
        coverImage: sourceContent.coverImage || '',
        sourceUrl: sourceContent.url || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishStatus: 'published',
        contentType: this.getContentTypeForPlatform(platform.id),
        category: this.getContentTypeForPlatform(platform.id),
        mediaUrls: sourceContent.mediaUrls || [],
      };

      // Publish to platform
      const publishResult = await publishContent(platform.id, contentItem, optimizedContent);
      
      if (publishResult.success) {
        contentItem.sourceUrl = publishResult.url || contentItem.sourceUrl;
        console.log(`Successfully published to ${platform.name}: ${contentItem.title}`);
        
        // Record the publication
        this.recordPublication(platform.id, contentItem.id);
      } else {
        contentItem.publishStatus = 'failed';
        console.error(`Failed to publish to ${platform.name}:`, publishResult.error);
      }

      // Save to database
      addContentItem(contentItem);
      
    } catch (error) {
      console.error('Error processing and publishing content:', error);
    }
  }

  private async optimizeContentForPlatform(sourceContent: any, platformId: string): Promise<any> {
    try {
      const keys = loadApiKeys();
      if (!keys.ai?.gemini?.apiKey) {
        // Return original content if no AI key
        return sourceContent;
      }

      const platformPrompts = {
        twitter: 'Optimize this content for Twitter: keep it concise, engaging, use relevant hashtags, max 280 characters',
        linkedin: 'Optimize this content for LinkedIn: professional tone, detailed insights, use relevant hashtags',
        hashnode: 'Optimize this content for Hashnode: technical depth, proper markdown formatting, engaging title',
        devTo: 'Optimize this content for Dev.to: developer-focused, include code examples if relevant, engaging title',
        instagram: 'Optimize this content for Instagram: visual-first approach, engaging captions, relevant hashtags',
        youtube: 'Optimize this content for YouTube: engaging title, detailed description, relevant tags'
      };

      const prompt = `${platformPrompts[platformId as keyof typeof platformPrompts] || 'Optimize this content'}: 
      
Title: ${sourceContent.title}
Content: ${sourceContent.content}
Tags: ${sourceContent.tags?.join(', ') || ''}

Return a JSON object with optimized title, content, excerpt, and tags array.`;

      const response = await generateOptimizedContent(prompt, keys.ai.gemini.apiKey);
      
      if (response?.content) {
        try {
          const optimized = JSON.parse(response.content);
          return {
            title: optimized.title || sourceContent.title,
            content: optimized.content || sourceContent.content,
            excerpt: optimized.excerpt || sourceContent.excerpt,
            tags: optimized.tags || sourceContent.tags || []
          };
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }
      
      return sourceContent;
    } catch (error) {
      console.error('Error optimizing content:', error);
      return sourceContent;
    }
  }

  private getContentTypeForPlatform(platformId: string): 'blog' | 'feed' | 'reel' {
    const typeMap: Record<string, 'blog' | 'feed' | 'reel'> = {
      hashnode: 'blog',
      devTo: 'blog',
      twitter: 'feed',
      linkedin: 'feed',
      instagram: 'feed',
      youtube: 'reel'
    };
    return typeMap[platformId] || 'feed';
  }

  private getTodayPostCount(platformId: string): number {
    const today = new Date().toDateString();
    const publications = JSON.parse(localStorage.getItem('astrumverse_daily_publications') || '{}');
    return publications[`${platformId}-${today}`] || 0;
  }

  private recordPublication(platformId: string, contentId: string) {
    const today = new Date().toDateString();
    const key = `${platformId}-${today}`;
    const publications = JSON.parse(localStorage.getItem('astrumverse_daily_publications') || '{}');
    publications[key] = (publications[key] || 0) + 1;
    localStorage.setItem('astrumverse_daily_publications', JSON.stringify(publications));
  }

  private getActiveSchedules(): WeeklySchedule[] {
    const stored = localStorage.getItem('astrumverse_weekly_schedules');
    return stored ? JSON.parse(stored).filter((s: WeeklySchedule) => s.enabled) : [];
  }

  private getActivePlatforms(): PlatformConfig[] {
    const stored = localStorage.getItem('astrumverse_automatic_platforms');
    return stored ? JSON.parse(stored).filter((p: PlatformConfig) => p.enabled) : [];
  }

  private getPlatformSettings(): PlatformSettings[] {
    const stored = localStorage.getItem('astrumverse_platform_settings');
    return stored ? JSON.parse(stored) : [];
  }
}

// Export singleton instance
export const automaticUploadService = new AutomaticUploadService();
