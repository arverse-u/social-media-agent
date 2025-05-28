
import { ContentItem } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';
import { generateOptimizedContent } from '@/services/geminiService';
import { markMediaAsUsed } from '@/services/mediaBufferService';

interface LinkedInPost {
  author: string;
  lifecycleState: 'PUBLISHED';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE';
      media?: Array<{
        status: 'READY';
        description: {
          text: string;
        };
        media: string;
        title?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC';
  };
}

export const publishToLinkedIn = async (content: ContentItem): Promise<{ success: boolean; error?: string }> => {
  try {
    const keys = loadApiKeys();
    
    if (!keys.linkedin?.accessToken || !keys.linkedin?.personId) {
      throw new Error('LinkedIn access token and person ID are required');
    }

    // Generate optimized content for LinkedIn
    const optimizedContent = await generateOptimizedContent(content, 'linkedin');

    const postData: LinkedInPost = {
      author: `urn:li:person:${keys.linkedin.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: optimizedContent.content.substring(0, 3000), // LinkedIn post limit
          },
          shareMediaCategory: content.coverImage ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Add media if available
    if (content.coverImage) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: optimizedContent.excerpt || optimizedContent.title,
          },
          media: content.coverImage,
          title: {
            text: optimizedContent.title,
          },
        },
      ];
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.linkedin.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to publish to LinkedIn: ${response.status} - ${errorData}`);
    }

    // Mark media as used if it was from buffer
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      markMediaAsUsed(content.mediaUrls[0]);
    }

    console.log('Successfully published to LinkedIn');
    return { success: true };
  } catch (error) {
    console.error('Error publishing to LinkedIn:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
