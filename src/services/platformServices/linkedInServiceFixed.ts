
import { LinkedInPost, ContentItem, MediaBuffer } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';

export async function publishToLinkedIn(content: ContentItem): Promise<{ success: boolean; url?: string; error?: string }> {
  const keys = loadApiKeys();
  
  if (!keys.linkedin?.accessToken) {
    return { success: false, error: 'LinkedIn access token not configured' };
  }

  try {
    const post: LinkedInPost = {
      author: `urn:li:person:${keys.linkedin.accessToken}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${content.title}\n\n${content.excerpt}\n\n${content.tags.map(tag => `#${tag}`).join(' ')}`
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add media if available
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      post.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      post.specificContent['com.linkedin.ugc.ShareContent'].media = content.mediaUrls.map(url => ({
        status: 'READY',
        description: {
          text: content.excerpt
        },
        media: url,
        title: {
          text: content.title
        }
      }));
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.linkedin.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: `LinkedIn API error: ${response.status} - ${errorData.message || 'Unknown error'}` 
      };
    }

    const result = await response.json();
    const postUrl = `https://www.linkedin.com/feed/update/${result.id}`;
    
    return { 
      success: true, 
      url: postUrl 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export function getLinkedInMediaFromBuffer(): MediaBuffer[] {
  const buffer = localStorage.getItem('astrumverse_media_buffer_image');
  if (!buffer) return [];
  
  try {
    const mediaItems: MediaBuffer[] = JSON.parse(buffer);
    return mediaItems.filter(item => !item.used);
  } catch (error) {
    console.error('Error loading media buffer:', error);
    return [];
  }
}

export function markLinkedInMediaAsUsed(mediaId: string): void {
  const buffer = localStorage.getItem('astrumverse_media_buffer_image');
  if (!buffer) return;
  
  try {
    const mediaItems: MediaBuffer[] = JSON.parse(buffer);
    const updatedItems = mediaItems.map(item => 
      item.id === mediaId ? { ...item, used: true } : item
    );
    
    localStorage.setItem('astrumverse_media_buffer_image', JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error updating media buffer:', error);
  }
}
