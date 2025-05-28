import { collectRealAnalytics, scheduleAnalyticsCollection } from './realAnalyticsService';

// Start the analytics collection scheduler
scheduleAnalyticsCollection();

export async function collectAnalytics() {
  try {
    const analytics = await collectRealAnalytics();
    
    // Store in localStorage
    const existingAnalytics = JSON.parse(localStorage.getItem('platform_analytics') || '[]');
    const newEntry = {
      date: new Date().toISOString(),
      analytics: analytics
    };
    existingAnalytics.push(newEntry);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredAnalytics = existingAnalytics.filter((entry: any) => 
      new Date(entry.date) > thirtyDaysAgo
    );
    
    localStorage.setItem('platform_analytics', JSON.stringify(filteredAnalytics));
    
    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    console.error('Error collecting analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function optimizeContent(contentId: string) {
  // Get content from database
  const contentItems = JSON.parse(localStorage.getItem('content_items') || '[]');
  const content = contentItems.find((item: any) => item.id === contentId);
  
  if (!content) {
    return {
      success: false,
      error: 'Content not found'
    };
  }
  
  // Add to autonomous optimization queue
  const { autonomousOptimizer } = await import('./aiOptimizationService');
  autonomousOptimizer.addToOptimizationQueue(content);
  
  return {
    success: true,
    data: 'Content added to optimization queue'
  };
}

export async function publishContent(contentId: string, platforms: string[]) {
  try {
    // Get content from database
    const contentItems = JSON.parse(localStorage.getItem('content_items') || '[]');
    const content = contentItems.find((item: any) => item.id === contentId);
    
    if (!content) {
      return {
        success: false,
        error: 'Content not found'
      };
    }
    
    // Publish to real platforms
    const { publishToRealPlatforms } = await import('./realPublishingService');
    const results = await publishToRealPlatforms(content, platforms);
    
    // Update content status
    const updatedContent = {
      ...content,
      publishStatus: 'published',
      publishedAt: new Date().toISOString(),
      publishResults: results
    };
    
    const updatedItems = contentItems.map((item: any) => 
      item.id === contentId ? updatedContent : item
    );
    
    localStorage.setItem('content_items', JSON.stringify(updatedItems));
    
    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Error publishing content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
