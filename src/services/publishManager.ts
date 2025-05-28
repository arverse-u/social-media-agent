import { ContentItem, PublishRecord, Platform } from '@/types';
import { 
  getContentItems, 
  updateContentItem, 
  getPublishRecords, 
  addPublishRecord, 
  updatePublishRecord,
  getPlatforms
} from './databaseService';
import { publishToHashnode } from './platformServices/hashnodeService';
import { publishToDevTo } from './platformServices/devToService';
import { publishToTwitter } from './platformServices/twitterService';
import { publishToLinkedIn } from './platformServices/linkedInService';
import { publishToInstagram } from './platformServices/instagramService';
import { publishToYouTube } from './platformServices/youTubeService';

// Variable to hold the scheduler interval ID
let schedulerIntervalId: number | null = null;

/**
 * Starts the publish scheduler to check for scheduled content periodically
 * @param intervalMinutes How often to check for content in minutes (defaults to 5)
 * @returns {void}
 */
export function startPublishScheduler(intervalMinutes: number = 5): void {
  // Clear any existing interval first
  stopPublishScheduler();
  
  // Convert minutes to milliseconds
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Set up the interval
  schedulerIntervalId = window.setInterval(() => {
    console.log(`Running scheduled content check (every ${intervalMinutes} minutes)`);
    processScheduledContent();
    checkAutomaticUploadSchedules();
  }, intervalMs);
  
  console.log(`Publish scheduler started (checking every ${intervalMinutes} minutes)`);
  
  // Run once immediately after starting
  processScheduledContent();
  checkAutomaticUploadSchedules();
}

/**
 * Stops the publish scheduler
 * @returns {void}
 */
export function stopPublishScheduler(): void {
  if (schedulerIntervalId !== null) {
    window.clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    console.log('Publish scheduler stopped');
  }
}

/**
 * Process scheduled content for publishing
 * @returns {Promise<void>}
 */
export async function processScheduledContent(): Promise<void> {
  const now = new Date();
  const allContent = getContentItems();
  
  // Filter for scheduled content due for publishing
  const scheduledContent = allContent.filter(content => 
    content.publishStatus === 'scheduled' && 
    content.scheduledDate && 
    new Date(content.scheduledDate) <= now
  );
  
  console.log(`Found ${scheduledContent.length} scheduled items ready for publishing`);
  
  // Process each scheduled item
  for (const content of scheduledContent) {
    await publishContent(content);
  }
}

/**
 * Check and process automatic upload schedules
 * @returns {Promise<void>}
 */
export async function checkAutomaticUploadSchedules(): Promise<void> {
  // Check if automatic scheduler is enabled
  const isSchedulerEnabled = localStorage.getItem('auto_scheduler_enabled') === 'true';
  
  if (!isSchedulerEnabled) {
    console.log('Automatic upload scheduler is disabled');
    return;
  }
  
  // Get schedules from localStorage
  const schedulesJson = localStorage.getItem('auto_upload_schedules');
  if (!schedulesJson) {
    console.log('No automatic upload schedules found');
    return;
  }
  
  const schedules = JSON.parse(schedulesJson);
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = Math.floor(now.getMinutes() / 5) * 5;
  const currentMinuteString = currentMinute.toString().padStart(2, '0');
  const currentDay = now.getDay(); // 0 is Sunday, 1-6 is Monday-Saturday
  
  // Get platforms
  const platforms = getPlatforms();
  const enabledPlatforms = platforms.filter(p => p.enabled && p.isConfigured);
  
  // Check each schedule
  for (const schedule of schedules) {
    // Skip if schedule is not enabled
    if (!schedule.enabled) continue;
    
    // Check if the current time matches this schedule
    if (schedule.hour === currentHour && schedule.minute === currentMinuteString) {
      // For daily schedules, check if today is one of the scheduled days
      if (schedule.frequency === 'daily' && !schedule.days.includes(currentDay === 0 ? 0 : currentDay)) {
        continue;
      }
      
      // Get AI optimization settings
      const aiSettingsJson = localStorage.getItem('auto_upload_ai_settings');
      const aiSettings = aiSettingsJson ? JSON.parse(aiSettingsJson) : null;
      
      // Get content items relevant to this schedule
      const contentType = schedule.contentType;
      const relevantPlatformIds = schedule.platformIds;
      
      // Get content that matches this type and is ready for publishing
      const allContent = getContentItems();
      const availableContent = allContent.filter(content => 
        content.contentType === contentType &&
        content.publishStatus === 'draft' &&
        !content.scheduledDate
      );
      
      if (availableContent.length === 0) {
        console.log(`No available ${contentType} content for automatic upload`);
        continue;
      }
      
      // Get the relevant platforms that are enabled
      const schedulePlatforms = enabledPlatforms.filter(p => 
        relevantPlatformIds.includes(p.id) && p.category === contentType
      );
      
      if (schedulePlatforms.length === 0) {
        console.log(`No configured platforms available for ${contentType} content`);
        continue;
      }
      
      // Select content for this schedule (for now, just the first available)
      const contentToPublish = availableContent[0];
      
      // If AI optimization is enabled, apply optimizations
      if (schedule.aiOptimized && aiSettings) {
        // In a real implementation, this would call an AI service to optimize the content
        applyAiOptimizations(contentToPublish, schedulePlatforms, aiSettings);
      }
      
      // Publish to each platform in the schedule
      for (const platform of schedulePlatforms) {
        await publishContentToPlatform(contentToPublish, platform.id);
      }
      
      // Update content status to published
      updateContentItem({
        ...contentToPublish,
        publishStatus: 'published',
      });
      
      console.log(`Automatic upload completed for schedule: ${schedule.id}`);
    }
  }
}

/**
 * Apply AI optimizations to content based on settings and platforms
 * @param content Content to optimize
 * @param platforms Platforms to optimize for
 * @param aiSettings AI optimization settings
 */
function applyAiOptimizations(content: ContentItem, platforms: Platform[], aiSettings: any): void {
  // This would be implemented with actual AI services in a production environment
  console.log('Applying AI optimizations to content:', content.id);
  
  // Example optimizations that could be applied:
  if (aiSettings.seoOptimization) {
    // Optimize title, tags for SEO
    console.log('- Applying SEO optimizations');
  }
  
  if (aiSettings.contentRefining) {
    // Refine content format for each platform
    console.log('- Refining content for platform requirements');
  }
  
  if (aiSettings.platformSpecificOptimization) {
    // Adjust content specifically for each target platform
    platforms.forEach(platform => {
      console.log(`- Optimizing specifically for ${platform.name}`);
    });
  }
}

/**
 * Publish content to a specific platform
 * @param content The content to publish
 * @param platformId The platform ID to publish to
 * @returns {Promise<void>}
 */
export async function publishContentToPlatform(content: ContentItem, platformId: Platform['id']): Promise<void> {
  try {
    // Use real publishing service
    const { publishToRealPlatforms } = await import('./realPublishingService');
    const results = await publishToRealPlatforms(content, [platformId]);
    
    const result = results[platformId];
    
    // Create a publish record
    const publishRecord: PublishRecord = {
      id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contentId: content.id,
      platform: platformId,
      status: result.success ? 'published' : 'failed',
      retryCount: 0,
      publishDate: new Date().toISOString(),
      publishedUrl: result.postUrl,
      errorMessage: result.error
    };
    
    addPublishRecord(publishRecord);
    
    // Update content status
    if (result.success) {
      updateContentItem({
        ...content,
        publishStatus: 'published',
      });
    }
    
  } catch (error) {
    console.error(`Error publishing content to ${platformId}:`, error);
    
    // Create failed record
    const failedRecord: PublishRecord = {
      id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contentId: content.id,
      platform: platformId,
      status: 'failed',
      retryCount: 0,
      publishDate: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
    
    addPublishRecord(failedRecord);
  }
}

/**
 * Publish content to configured platforms
 * @param content The content to publish
 * @returns {Promise<void>}
 */
export async function publishContent(content: ContentItem): Promise<void> {
  // Update content status to publishing
  const updatedContent = {
    ...content,
    publishStatus: 'published' as const,
  };
  
  updateContentItem(updatedContent);
  
  // Get enabled and configured platforms matching content type
  const platforms = getPlatforms().filter(platform => 
    platform.enabled && 
    platform.isConfigured && 
    platform.category === content.contentType
  );
  
  // Publish to each platform
  for (const platform of platforms) {
    await publishContentToPlatform(content, platform.id);
  }
}
