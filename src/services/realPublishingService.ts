
import { ContentItem } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';

export async function publishToRealPlatforms(content: ContentItem, platforms: string[]): Promise<any[]> {
  const results = [];
  
  for (const platform of platforms) {
    try {
      let result;
      
      switch (platform) {
        case 'twitter':
          result = await publishToTwitter(content);
          break;
        case 'linkedin':
          result = await publishToLinkedIn(content);
          break;
        case 'instagram':
          result = await publishToInstagram(content);
          break;
        case 'youtube':
          result = await publishToYouTube(content);
          break;
        case 'hashnode':
          result = await publishToHashnode(content);
          break;
        case 'devto':
          result = await publishToDevTo(content);
          break;
        default:
          result = { success: false, error: `Unsupported platform: ${platform}` };
      }
      
      results.push({
        platform,
        ...result
      });
    } catch (error) {
      results.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

async function publishToTwitter(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.twitter?.bearerToken) {
    return { success: false, error: 'Twitter credentials not configured' };
  }
  
  try {
    // Use first media URL if available
    const mediaId = content.mediaUrls?.[0];
    
    const tweetData: any = {
      text: `${content.title}\n\n${content.excerpt}`
    };
    
    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.twitter.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result,
      url: `https://twitter.com/user/status/${result.data.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishToLinkedIn(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.linkedin?.accessToken) {
    return { success: false, error: 'LinkedIn credentials not configured' };
  }
  
  try {
    const postData = {
      author: `urn:li:person:${keys.linkedin.accessToken}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${content.title}\n\n${content.content}`
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.linkedin.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result,
      url: `https://linkedin.com/posts/${result.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishToInstagram(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.instagram?.accessToken) {
    return { success: false, error: 'Instagram credentials not configured' };
  }
  
  try {
    // Get video file from Dropbox if mediaUrls contains filename
    const videoFilename = content.mediaUrls?.[0];
    if (!videoFilename) {
      return { success: false, error: 'No video file specified' };
    }
    
    // Fetch video from Dropbox
    const videoUrl = await fetchFromDropbox(videoFilename);
    if (!videoUrl) {
      return { success: false, error: 'Failed to fetch video from Dropbox' };
    }
    
    // Create Instagram media
    const mediaResponse = await fetch(`https://graph.instagram.com/${keys.instagram.userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: `${content.title}\n\n${content.content}`,
        access_token: keys.instagram.accessToken
      }),
    });
    
    if (!mediaResponse.ok) {
      throw new Error(`Instagram media creation error: ${mediaResponse.status}`);
    }
    
    const mediaResult = await mediaResponse.json();
    
    // Publish the media
    const publishResponse = await fetch(`https://graph.instagram.com/${keys.instagram.userId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: mediaResult.id,
        access_token: keys.instagram.accessToken
      }),
    });
    
    if (!publishResponse.ok) {
      throw new Error(`Instagram publish error: ${publishResponse.status}`);
    }
    
    const publishResult = await publishResponse.json();
    return {
      success: true,
      data: publishResult,
      url: `https://instagram.com/p/${publishResult.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishToYouTube(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.youtube?.accessToken) {
    return { success: false, error: 'YouTube credentials not configured' };
  }
  
  try {
    // Get video file from Dropbox if mediaUrls contains filename
    const videoFilename = content.mediaUrls?.[0];
    if (!videoFilename) {
      return { success: false, error: 'No video file specified' };
    }
    
    // Fetch video from Dropbox
    const videoBlob = await fetchVideoFromDropbox(videoFilename);
    if (!videoBlob) {
      return { success: false, error: 'Failed to fetch video from Dropbox' };
    }
    
    // Upload video to YouTube
    const uploadResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.youtube.accessToken}`,
      },
      body: new FormData([
        ['metadata', JSON.stringify({
          snippet: {
            title: content.title,
            description: content.content,
            tags: content.tags,
          },
          status: {
            privacyStatus: 'public'
          }
        })],
        ['media', videoBlob]
      ] as any),
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`YouTube upload error: ${uploadResponse.status}`);
    }
    
    const result = await uploadResponse.json();
    return {
      success: true,
      data: result,
      url: `https://youtube.com/watch?v=${result.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishToHashnode(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.hashnode?.token) {
    return { success: false, error: 'Hashnode credentials not configured' };
  }
  
  try {
    const response = await fetch('https://api.hashnode.com', {
      method: 'POST',
      headers: {
        'Authorization': keys.hashnode.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation PublishPost($input: PublishPostInput!) {
            publishPost(input: $input) {
              post {
                id
                url
              }
            }
          }
        `,
        variables: {
          input: {
            title: content.title,
            contentMarkdown: content.content,
            tags: content.tags.map(tag => ({ slug: tag })),
            coverImageURL: content.coverImage,
            publicationId: keys.hashnode.publicationId
          }
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Hashnode API error: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result.data.publishPost.post,
      url: result.data.publishPost.post.url
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishToDevTo(content: ContentItem): Promise<any> {
  const keys = loadApiKeys();
  
  if (!keys.devTo?.apiKey) {
    return { success: false, error: 'Dev.to credentials not configured' };
  }
  
  try {
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': keys.devTo.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: {
          title: content.title,
          body_markdown: content.content,
          published: true,
          tags: content.tags,
          main_image: content.coverImage,
          canonical_url: content.sourceUrl
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result,
      url: result.url
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function fetchFromDropbox(filename: string): Promise<string | null> {
  const keys = loadApiKeys();
  
  if (!keys.youtube?.dropboxToken) {
    return null;
  }
  
  try {
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
    
    if (response.ok) {
      const data = await response.json();
      return data.url.replace('?dl=0', '?raw=1');
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Dropbox:', error);
    return null;
  }
}

async function fetchVideoFromDropbox(filename: string): Promise<Blob | null> {
  const keys = loadApiKeys();
  
  if (!keys.youtube?.dropboxToken) {
    return null;
  }
  
  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.youtube.dropboxToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${filename}`
        }),
      },
    });
    
    if (response.ok) {
      return await response.blob();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching video from Dropbox:', error);
    return null;
  }
}
