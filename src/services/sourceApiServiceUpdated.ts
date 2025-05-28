
import { loadApiKeys } from '@/config/apiKeys';
import { ApiResponse, ContentItem } from '@/types';

export async function fetchContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  // Check if Hashnode API is configured
  if (!keys.sourceApi?.hashnodeApi?.url || !keys.sourceApi?.hashnodeApi?.apiKey) {
    return {
      success: false,
      error: 'Hashnode API not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.hashnodeApi.url, {
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.hashnodeApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to ContentItem format
    const contentItems: ContentItem[] = data.map((item: any) => ({
      id: `hashnode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Untitled',
      content: item.content || item.description || '',
      excerpt: item.brief || item.excerpt || item.content?.substring(0, 200) || '',
      author: item.author?.name || 'Unknown',
      tags: item.tags?.map((tag: any) => tag.name || tag) || [],
      coverImage: item.coverImage?.url,
      sourceUrl: item.url,
      createdAt: item.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'blog' as const,
      category: 'blog' as const,
    }));

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchFeedContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  // Check if LinkedIn API is configured
  if (!keys.sourceApi?.linkedinApi?.url || !keys.sourceApi?.linkedinApi?.apiKey) {
    return {
      success: false,
      error: 'LinkedIn API not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.linkedinApi.url, {
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.linkedinApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to ContentItem format
    const contentItems: ContentItem[] = data.map((item: any) => ({
      id: `linkedin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Feed Post',
      content: item.content || item.text || '',
      excerpt: item.content?.substring(0, 200) || '',
      author: item.author?.name || 'Unknown',
      tags: item.hashtags || [],
      sourceUrl: item.url,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'feed' as const,
      category: 'feed' as const,
    }));

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching feed content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchVideoContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  // Check if YouTube Dropbox API is configured
  if (!keys.youtube?.dropboxToken || !keys.youtube?.dropboxApiKey) {
    return {
      success: false,
      error: 'YouTube Dropbox API not configured'
    };
  }

  try {
    // This would normally fetch from Dropbox API
    // For now, return empty array as placeholder
    const contentItems: ContentItem[] = [];

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching video content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
