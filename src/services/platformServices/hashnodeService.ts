
import { HashnodePost, ContentItem, ApiResponse, PublishRecord } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';
import { getPlatformConfig, addPublishRecord, updatePublishRecord } from '../databaseService';

// Hashnode GraphQL API endpoint
const HASHNODE_API = 'https://api.hashnode.com/';

export const publishToHashnode = async (content: ContentItem): Promise<ApiResponse<PublishRecord>> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.hashnode.token) {
      return {
        success: false,
        error: 'Hashnode API token is not configured',
      };
    }

    // Get platform-specific configuration
    const config = getPlatformConfig('hashnode');
    
    if (!config) {
      return {
        success: false,
        error: 'Hashnode platform configuration not found',
      };
    }

    // Prepare tags in Hashnode format (they require tags as objects with slug property)
    const tags = content.tags.length > 0 
      ? content.tags.map(tag => ({ slug: tag.toLowerCase().replace(/\s+/g, '-') }))
      : config.defaultTags.map(tag => ({ slug: tag.toLowerCase().replace(/\s+/g, '-') }));
    
    // Prepare post data
    const post: HashnodePost = {
      title: content.title,
      contentMarkdown: content.content,
      tags: tags.slice(0, 8), // Hashnode allows up to 8 tags
    };

    // Add cover image if available
    if (content.coverImage) {
      post.coverImage = content.coverImage;
    }

    // If canonical link is enabled and source URL exists
    if (config.canonicalLink && content.sourceUrl) {
      post.isRepublished = {
        originalArticleURL: content.sourceUrl,
      };
    }

    // Create a publish record
    const publishRecord: PublishRecord = {
      id: `hashnode_${content.id}_${Date.now()}`,
      contentId: content.id,
      platform: 'hashnode',
      status: 'pending',
      retryCount: 0,
    };
    
    addPublishRecord(publishRecord);

    // GraphQL mutation for publishing article
    const query = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            slug
            title
            dateAdded
            publication {
              domain
            }
          }
        }
      }
    `;

    // Call the Hashnode GraphQL API to publish the post
    const response = await fetch(HASHNODE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': keys.hashnode.token,
      },
      body: JSON.stringify({
        query,
        variables: {
          input: {
            title: post.title,
            contentMarkdown: post.contentMarkdown,
            tags: post.tags,
            coverImageURL: post.coverImage,
            isRepublished: post.isRepublished,
          },
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      // Update publish record with error
      updatePublishRecord({
        ...publishRecord,
        status: 'failed',
        errorMessage: `Failed to publish to Hashnode: ${data.errors[0].message}`,
      });
      
      return {
        success: false,
        error: `Failed to publish to Hashnode: ${data.errors[0].message}`,
      };
    }

    // Extract published URL from response
    const post_data = data.data.publishPost.post;
    const publishedUrl = `https://${post_data.publication.domain}/${post_data.slug}`;
    
    // Update publish record with success
    updatePublishRecord({
      ...publishRecord,
      status: 'published',
      publishedUrl,
      publishDate: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        ...publishRecord,
        status: 'published',
        publishedUrl,
        publishDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error publishing to Hashnode:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const fetchHashnodeStats = async (postId: string): Promise<ApiResponse<any>> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.hashnode.token) {
      return {
        success: false,
        error: 'Hashnode API token is not configured',
      };
    }

    // GraphQL query for fetching post stats
    const query = `
      query PostStats($slug: String!) {
        post(slug: $slug) {
          totalReactions
          replyCount
          views
        }
      }
    `;

    // Call the Hashnode GraphQL API to get post stats
    const response = await fetch(HASHNODE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': keys.hashnode.token,
      },
      body: JSON.stringify({
        query,
        variables: {
          slug: postId,
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return {
        success: false,
        error: `Failed to fetch Hashnode stats: ${data.errors[0].message}`,
      };
    }

    return {
      success: true,
      data: data.data.post,
    };
  } catch (error) {
    console.error('Error fetching Hashnode stats:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
