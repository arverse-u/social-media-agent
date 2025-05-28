
import { DevToPost, ContentItem, ApiResponse, PublishRecord } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';
import { getPlatformConfig, addPublishRecord, updatePublishRecord } from '../databaseService';

// Dev.to API endpoint
const DEV_TO_API = 'https://dev.to/api';

export const publishToDevTo = async (content: ContentItem): Promise<ApiResponse<PublishRecord>> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.devTo.apiKey) {
      return {
        success: false,
        error: 'Dev.to API key is not configured',
      };
    }

    // Get platform-specific configuration
    const config = getPlatformConfig('devTo');
    
    if (!config) {
      return {
        success: false,
        error: 'Dev.to platform configuration not found',
      };
    }

    // Prepare tags (Dev.to accepts up to 4 tags)
    const tags = content.tags.length > 0 
      ? content.tags.slice(0, 4) 
      : config.defaultTags.slice(0, 4);
    
    // Prepare post data
    const post: DevToPost = {
      article: {
        title: content.title,
        body_markdown: content.content,
        published: true,
        tags,
      }
    };

    // If canonical link is enabled and source URL exists
    if (config.canonicalLink && content.sourceUrl) {
      post.article.canonical_url = content.sourceUrl;
    }

    // If cover image is available
    if (content.coverImage) {
      post.article.main_image = content.coverImage;
    }

    // Create a publish record
    const publishRecord: PublishRecord = {
      id: `devTo_${content.id}_${Date.now()}`,
      contentId: content.id,
      platform: 'devTo',
      status: 'pending',
      retryCount: 0,
    };
    
    addPublishRecord(publishRecord);

    // Call the Dev.to API to publish the post
    const response = await fetch(`${DEV_TO_API}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': keys.devTo.apiKey,
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Update publish record with error
      updatePublishRecord({
        ...publishRecord,
        status: 'failed',
        errorMessage: `Failed to publish to Dev.to: ${response.status} ${errorText}`,
      });
      
      return {
        success: false,
        error: `Failed to publish to Dev.to: ${response.status} ${errorText}`,
      };
    }

    const data = await response.json();
    
    // Update publish record with success
    updatePublishRecord({
      ...publishRecord,
      status: 'published',
      publishedUrl: data.url,
      publishDate: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        ...publishRecord,
        status: 'published',
        publishedUrl: data.url,
        publishDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error publishing to Dev.to:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const fetchDevToStats = async (articleId: string): Promise<ApiResponse<any>> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.devTo.apiKey) {
      return {
        success: false,
        error: 'Dev.to API key is not configured',
      };
    }

    // Call the Dev.to API to get article stats
    const response = await fetch(`${DEV_TO_API}/articles/${articleId}`, {
      headers: {
        'api-key': keys.devTo.apiKey,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch Dev.to stats: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        views: data.page_views_count,
        reactions: data.positive_reactions_count,
        comments: data.comments_count,
      },
    };
  } catch (error) {
    console.error('Error fetching Dev.to stats:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
