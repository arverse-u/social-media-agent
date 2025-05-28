
import { loadApiKeys } from '@/config/apiKeys';
import { ApiResponse, ContentItem } from '@/types';
import { fetchHashnodeContent, fetchDevToContent, fetchTwitterContent, fetchLinkedInContent } from './realApiService';
import { csvVideoProcessor } from './csvVideoProcessor';

export async function fetchContent(): Promise<ApiResponse<ContentItem[]>> {
  return await fetchHashnodeContent();
}

export async function fetchFeedContent(): Promise<ApiResponse<ContentItem[]>> {
  // Get LinkedIn content
  const linkedinResult = await fetchLinkedInContent();
  
  // Get Twitter content  
  const twitterResult = await fetchTwitterContent();
  
  // Combine results
  const combinedData: ContentItem[] = [];
  
  if (linkedinResult.success && linkedinResult.data) {
    combinedData.push(...linkedinResult.data);
  }
  
  if (twitterResult.success && twitterResult.data) {
    combinedData.push(...twitterResult.data);
  }
  
  return {
    success: true,
    data: combinedData
  };
}

export async function fetchVideoContent(): Promise<ApiResponse<ContentItem[]>> {
  // This should be called after CSV is uploaded
  // For now, return the next video to be processed
  const instagramVideo = await csvVideoProcessor.getNextVideoForProcessing('instagram');
  const youtubeVideo = await csvVideoProcessor.getNextVideoForProcessing('youtube');
  
  const videos: ContentItem[] = [];
  
  if (instagramVideo.success && instagramVideo.data) {
    videos.push(instagramVideo.data);
  }
  
  if (youtubeVideo.success && youtubeVideo.data) {
    videos.push(youtubeVideo.data);
  }
  
  return {
    success: true,
    data: videos
  };
}

export async function fetchAllContent(): Promise<ApiResponse<ContentItem[]>> {
  const [hashnode, devto, feeds, videos] = await Promise.all([
    fetchHashnodeContent(),
    fetchDevToContent(), 
    fetchFeedContent(),
    fetchVideoContent()
  ]);
  
  const allContent: ContentItem[] = [];
  
  [hashnode, devto, feeds, videos].forEach(result => {
    if (result.success && result.data) {
      allContent.push(...result.data);
    }
  });
  
  return {
    success: true,
    data: allContent
  };
}

// Function to process uploaded CSV for video content
export async function processCSVFile(file: File, platform: 'instagram' | 'youtube'): Promise<ApiResponse<string>> {
  try {
    const csvContent = await file.text();
    csvVideoProcessor.loadCSVData(csvContent);
    
    return {
      success: true,
      data: `CSV loaded successfully. ${csvVideoProcessor.getTotalCount()} videos ready for processing.`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process CSV file'
    };
  }
}
