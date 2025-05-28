
import { ContentItem } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';
import { generateOptimizedContent } from '@/services/geminiService';
import { markMediaAsUsed } from '@/services/mediaBufferService';

interface TwitterPost {
  text: string;
  media?: {
    media_ids: string[];
  };
}

export const publishToTwitter = async (content: ContentItem): Promise<{ success: boolean; error?: string }> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.twitter?.bearerToken || !keys.twitter?.apiKey || !keys.twitter?.apiKeySecret || !keys.twitter?.accessToken || !keys.twitter?.accessTokenSecret) {
      throw new Error('Twitter API credentials are required');
    }

    // Generate optimized content for Twitter
    const optimizedContent = await generateOptimizedContent(content, 'twitter');

    const postData: TwitterPost = {
      text: optimizedContent.content.substring(0, 280), // Twitter character limit
    };

    // Add media if available
    if (content.coverImage) {
      // For now, we'll include the media URL in the text since uploading media requires additional steps
      postData.text = `${postData.text}\n\n${content.coverImage}`;
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.twitter.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to publish to Twitter: ${response.status} - ${errorData}`);
    }

    // Mark media as used if it was from buffer
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      markMediaAsUsed(content.mediaUrls[0]);
    }

    console.log('Successfully published to Twitter');
    return { success: true };
  } catch (error) {
    console.error('Error publishing to Twitter:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
