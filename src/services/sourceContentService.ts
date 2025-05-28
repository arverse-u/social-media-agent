
import { ContentItem, ApiResponse } from '@/types';
import { generateContentWithGroq } from './groqService';
import { generateTags, improveContent, generateSummary } from './geminiService';
import { loadApiKeys } from '@/config/apiKeys';

interface SourceApiResponse {
  title: string;
  imageurl: string;
  description: string;
}

interface VideoContentItem {
  fileName: string;
  videoType: 'quiz' | 'top 3 daily updates' | 'product/service highlights' | 'did u know facts';
  content: string;
}

export async function fetchAndProcessSourceContent(
  platform: string,
  sourceUrl: string
): Promise<ApiResponse<ContentItem[]>> {
  try {
    console.log(`Fetching source content for ${platform} from ${sourceUrl}`);
    
    // Fetch content from source API
    const response = await fetch(sourceUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch from source API: ${response.status} ${response.statusText}`
      };
    }
    
    const sourceData: SourceApiResponse[] = await response.json();
    
    // Process each item with LLM enhancement
    const processedContent: ContentItem[] = [];
    
    for (const item of sourceData) {
      const enhancedContent = await enhanceContentWithLLM(item, platform);
      if (enhancedContent) {
        processedContent.push(enhancedContent);
      }
    }
    
    return {
      success: true,
      data: processedContent
    };
    
  } catch (error) {
    console.error('Error processing source content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function processVideoContentFromCSV(
  csvData: VideoContentItem[],
  platform: 'instagram' | 'youtube'
): Promise<ApiResponse<ContentItem[]>> {
  try {
    console.log(`Processing ${csvData.length} video items for ${platform}`);
    
    const processedContent: ContentItem[] = [];
    
    for (const videoItem of csvData) {
      const enhancedContent = await enhanceVideoContentWithLLM(videoItem, platform);
      if (enhancedContent) {
        processedContent.push(enhancedContent);
      }
    }
    
    return {
      success: true,
      data: processedContent
    };
    
  } catch (error) {
    console.error('Error processing video content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function enhanceContentWithLLM(
  sourceItem: SourceApiResponse,
  platform: string
): Promise<ContentItem | null> {
  try {
    const apiKeys = loadApiKeys();
    
    // Use Groq for content enhancement
    const enhancementPrompt = `
      Enhance the following content for ${platform} platform publishing:
      
      Title: ${sourceItem.title}
      Description: ${sourceItem.description}
      
      Please:
      1. Optimize the title for ${platform} engagement
      2. Create compelling content that fits ${platform}'s style
      3. Suggest relevant hashtags/tags
      4. Generate an engaging excerpt
      
      Return a JSON object with: title, content, excerpt, suggestedTags
    `;
    
    let enhancedData;
    if (apiKeys.ai?.backupAi1?.apiKey && apiKeys.ai.backupAi1.provider === 'groq') {
      const groqResponse = await generateContentWithGroq(
        enhancementPrompt,
        apiKeys.ai.backupAi1.apiKey
      );
      
      // Try to parse JSON from Groq response
      try {
        const jsonMatch = groqResponse.content.match(/{.*}/s);
        if (jsonMatch) {
          enhancedData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Failed to parse Groq JSON, using original content');
      }
    }
    
    // Fallback to Gemini for tag generation
    let tags: string[] = [];
    if (apiKeys.ai?.gemini?.apiKey) {
      const tagsResponse = await generateTags(sourceItem.description);
      if (tagsResponse.success) {
        tags = tagsResponse.data || [];
      }
    }
    
    // Generate summary with Gemini
    let summary = sourceItem.description.substring(0, 200);
    if (apiKeys.ai?.gemini?.apiKey) {
      const summaryResponse = await generateSummary(sourceItem.description);
      if (summaryResponse.success) {
        summary = summaryResponse.data || summary;
      }
    }
    
    const contentType = getContentTypeForPlatform(platform);
    
    const contentItem: ContentItem = {
      id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: enhancedData?.title || sourceItem.title,
      content: enhancedData?.content || sourceItem.description,
      excerpt: enhancedData?.excerpt || summary,
      author: 'System',
      contentType: contentType,
      category: contentType,
      publishStatus: 'draft',
      tags: enhancedData?.suggestedTags || tags,
      mediaUrls: sourceItem.imageurl ? [sourceItem.imageurl] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return contentItem;
    
  } catch (error) {
    console.error('Error enhancing content with LLM:', error);
    return null;
  }
}

async function enhanceVideoContentWithLLM(
  videoItem: VideoContentItem,
  platform: 'instagram' | 'youtube'
): Promise<ContentItem | null> {
  try {
    const apiKeys = loadApiKeys();
    
    const enhancementPrompt = `
      Create optimized content for ${platform} based on this video:
      
      Video Type: ${videoItem.videoType}
      Content: ${videoItem.content}
      File: ${videoItem.fileName}
      
      Please create:
      1. An engaging title optimized for ${platform}
      2. A compelling description that fits ${platform}'s format
      3. Relevant hashtags for maximum reach
      4. A brief excerpt for previews
      
      Return a JSON object with: title, content, excerpt, suggestedTags
    `;
    
    let enhancedData;
    if (apiKeys.ai?.backupAi1?.apiKey && apiKeys.ai.backupAi1.provider === 'groq') {
      const groqResponse = await generateContentWithGroq(
        enhancementPrompt,
        apiKeys.ai.backupAi1.apiKey
      );
      
      try {
        const jsonMatch = groqResponse.content.match(/{.*}/s);
        if (jsonMatch) {
          enhancedData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Failed to parse Groq JSON, using original content');
      }
    }
    
    let tags: string[] = [];
    if (apiKeys.ai?.gemini?.apiKey) {
      const tagsResponse = await generateTags(videoItem.content);
      if (tagsResponse.success) {
        tags = tagsResponse.data || [];
      }
    }
    
    const contentItem: ContentItem = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: enhancedData?.title || `${videoItem.videoType}: ${videoItem.fileName}`,
      content: enhancedData?.content || videoItem.content,
      excerpt: enhancedData?.excerpt || videoItem.content.substring(0, 200),
      author: 'System',
      contentType: 'reel',
      category: 'reel',
      publishStatus: 'draft',
      tags: enhancedData?.suggestedTags || tags,
      mediaUrls: [], // Video files would be uploaded separately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return contentItem;
    
  } catch (error) {
    console.error('Error enhancing video content with LLM:', error);
    return null;
  }
}

function getContentTypeForPlatform(platform: string): 'blog' | 'feed' | 'reel' {
  switch (platform.toLowerCase()) {
    case 'hashnode':
    case 'dev.to':
      return 'blog';
    case 'twitter':
    case 'linkedin':
      return 'feed';
    case 'instagram':
    case 'youtube':
      return 'reel';
    default:
      return 'feed';
  }
}
