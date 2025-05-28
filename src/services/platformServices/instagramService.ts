
import { ContentItem } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';
import { generateOptimizedContent } from '@/services/geminiService';
import { markMediaAsUsed } from '@/services/mediaBufferService';

interface InstagramPost {
  image_url: string;
  caption: string;
  access_token: string;
}

export const publishToInstagram = async (content: ContentItem): Promise<{ success: boolean; error?: string }> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.instagram?.accessToken || !keys.instagram?.pageId) {
      throw new Error('Instagram access token and page ID are required');
    }

    // Generate optimized content for Instagram
    const optimizedContent = await generateOptimizedContent(content, 'instagram');
    
    let mediaUrl = '';
    
    // Handle media based on content type
    if (content.contentType === 'reel' && content.mediaUrls && content.mediaUrls.length > 0) {
      // For video content, get video from Dropbox
      const videoFilename = content.mediaUrls[0];
      mediaUrl = await getVideoFromDropbox(videoFilename);
      
      if (!mediaUrl) {
        throw new Error('Failed to fetch video from Dropbox');
      }
    } else {
      // For regular posts, use cover image or default
      mediaUrl = content.coverImage || 'https://via.placeholder.com/1080x1080';
    }

    const postData: InstagramPost = {
      image_url: mediaUrl,
      caption: optimizedContent.content.substring(0, 2200), // Instagram caption limit
      access_token: keys.instagram.accessToken
    };

    // Create media object
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${keys.instagram.pageId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      }
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json();
      throw new Error(`Failed to create Instagram media: ${errorData.error?.message || mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json();

    // Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${keys.instagram.pageId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: keys.instagram.accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      throw new Error(`Failed to publish to Instagram: ${errorData.error?.message || publishResponse.statusText}`);
    }

    // Mark media as used if it was from buffer
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      markMediaAsUsed(content.mediaUrls[0]);
    }

    console.log('Successfully published to Instagram');
    return { success: true };
  } catch (error) {
    console.error('Error publishing to Instagram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

const getVideoFromDropbox = async (filename: string): Promise<string> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.youtube?.dropboxToken) {
      throw new Error('Dropbox token not configured');
    }

    // Get shared link for the file
    const response = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.youtube.dropboxToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: `/${filename}`,
        settings: {
          requested_visibility: 'public'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get Dropbox link: ${response.status}`);
    }

    const data = await response.json();
    return data.url.replace('?dl=0', '?raw=1'); // Direct download link
  } catch (error) {
    console.error('Error getting video from Dropbox:', error);
    return '';
  }
};
