import { loadApiKeys } from '@/config/apiKeys';
import { ApiResponse, ContentItem } from '@/types';

// Real API service for fetching content from platform-specific source APIs
export async function fetchHashnodeContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  if (!keys.sourceApi?.hashnodeApi?.url || !keys.sourceApi?.hashnodeApi?.apiKey) {
    return {
      success: false,
      error: 'Hashnode API credentials not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.hashnodeApi.url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.hashnodeApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API response to ContentItem format
    const contentItems: ContentItem[] = Array.isArray(data) ? data.map((item: any) => ({
      id: `hashnode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Untitled',
      content: item.description || item.content || '',
      excerpt: item.description?.substring(0, 200) || '',
      author: item.author || 'Unknown',
      tags: Array.isArray(item.tags) ? item.tags : [],
      coverImage: item.imageurl || item.image || '',
      sourceUrl: item.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'blog' as const,
      category: 'blog' as const,
    })) : [];

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching Hashnode content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchDevToContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  if (!keys.sourceApi?.devToApi?.url || !keys.sourceApi?.devToApi?.apiKey) {
    return {
      success: false,
      error: 'Dev.to API credentials not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.devToApi.url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.devToApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const contentItems: ContentItem[] = Array.isArray(data) ? data.map((item: any) => ({
      id: `devto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Untitled',
      content: item.description || item.content || '',
      excerpt: item.description?.substring(0, 200) || '',
      author: item.author || 'Unknown',
      tags: Array.isArray(item.tags) ? item.tags : [],
      coverImage: item.imageurl || item.image || '',
      sourceUrl: item.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'blog' as const,
      category: 'blog' as const,
    })) : [];

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching Dev.to content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchTwitterContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  if (!keys.sourceApi?.twitterApi?.url || !keys.sourceApi?.twitterApi?.apiKey) {
    return {
      success: false,
      error: 'Twitter API credentials not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.twitterApi.url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.twitterApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const contentItems: ContentItem[] = Array.isArray(data) ? data.map((item: any) => ({
      id: `twitter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Twitter Post',
      content: item.description || item.content || '',
      excerpt: item.description?.substring(0, 200) || '',
      author: item.author || 'Unknown',
      tags: Array.isArray(item.tags) ? item.tags : [],
      coverImage: item.imageurl || item.image || '',
      sourceUrl: item.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'feed' as const,
      category: 'feed' as const,
    })) : [];

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching Twitter content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchLinkedInContent(): Promise<ApiResponse<ContentItem[]>> {
  const keys = loadApiKeys();
  
  if (!keys.sourceApi?.linkedinApi?.url || !keys.sourceApi?.linkedinApi?.apiKey) {
    return {
      success: false,
      error: 'LinkedIn API credentials not configured'
    };
  }

  try {
    const response = await fetch(keys.sourceApi.linkedinApi.url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keys.sourceApi.linkedinApi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const contentItems: ContentItem[] = Array.isArray(data) ? data.map((item: any) => ({
      id: `linkedin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'LinkedIn Post',
      content: item.description || item.content || '',
      excerpt: item.description?.substring(0, 200) || '',
      author: item.author || 'Unknown',
      tags: Array.isArray(item.tags) ? item.tags : [],
      coverImage: item.imageurl || item.image || '',
      sourceUrl: item.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft' as const,
      contentType: 'feed' as const,
      category: 'feed' as const,
    })) : [];

    return {
      success: true,
      data: contentItems
    };

  } catch (error) {
    console.error('Error fetching LinkedIn content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
