
import { ContentItem, Platform } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';

interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  postId?: string;
}

export async function publishToHashnode(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.hashnode?.token) {
      return { success: false, error: 'Hashnode API key not configured' };
    }

    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            url
            title
          }
        }
      }
    `;

    const variables = {
      input: {
        title: formData.title,
        contentMarkdown: formData.content,
        tags: formData.tags.split(',').map((tag: string) => ({ slug: tag.trim().toLowerCase().replace(/\s+/g, '-') })),
        coverImageURL: formData.coverImageUrl || undefined,
        canonicalURL: formData.canonicalUrl || undefined,
        series: formData.series || undefined,
        publicationId: apiKeys.hashnode.publicationId || undefined,
      }
    };

    const response = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.hashnode.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();
    
    if (data.errors) {
      return { success: false, error: data.errors[0].message };
    }

    return {
      success: true,
      url: data.data.publishPost.post.url,
      postId: data.data.publishPost.post.id
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishToDevTo(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.devTo?.apiKey) {
      return { success: false, error: 'Dev.to API key not configured' };
    }

    const article = {
      title: formData.title,
      body_markdown: formData.content,
      published: true,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).slice(0, 4),
      canonical_url: formData.canonicalUrl || undefined,
      main_image: formData.coverImageUrl || undefined,
      series: formData.series || undefined,
    };

    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': apiKeys.devTo.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to publish to Dev.to' };
    }

    return {
      success: true,
      url: data.url,
      postId: data.id.toString()
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishToTwitter(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.twitter?.bearerToken) {
      return { success: false, error: 'Twitter API key not configured' };
    }

    let mediaIds: string[] = [];
    
    // Handle media upload if files are present
    if (formData.mediaFiles && formData.mediaFiles instanceof FileList && formData.mediaFiles.length > 0) {
      for (let i = 0; i < formData.mediaFiles.length; i++) {
        const file = formData.mediaFiles[i] as File;
        const mediaId = await uploadMediaToTwitter(file, apiKeys.twitter.bearerToken);
        if (mediaId) {
          mediaIds.push(mediaId);
        }
      }
    } else if (formData.mediaFiles && Array.isArray(formData.mediaFiles)) {
      for (const file of formData.mediaFiles) {
        if (file instanceof File) {
          const mediaId = await uploadMediaToTwitter(file, apiKeys.twitter.bearerToken);
          if (mediaId) {
            mediaIds.push(mediaId);
          }
        }
      }
    }

    const tweetData: any = {
      text: formData.content
    };

    if (mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.twitter.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to publish to Twitter' };
    }

    return {
      success: true,
      url: `https://twitter.com/user/status/${data.data.id}`,
      postId: data.data.id
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function uploadMediaToTwitter(file: File, bearerToken: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.media_id_string || null;
  } catch (error) {
    console.error('Error uploading media to Twitter:', error);
    return null;
  }
}

export async function publishToLinkedIn(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.linkedin?.accessToken) {
      return { success: false, error: 'LinkedIn API key not configured' };
    }

    let mediaUrn: string | undefined;
    
    if (formData.mediaFiles && formData.mediaFiles.length > 0) {
      const file = formData.mediaFiles instanceof FileList ? formData.mediaFiles[0] : formData.mediaFiles[0];
      if (file instanceof File) {
        mediaUrn = await uploadMediaToLinkedIn(file, apiKeys.linkedin.accessToken);
      }
    }

    const postData = {
      author: `urn:li:person:${apiKeys.linkedin.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: formData.content
          },
          shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
          ...(mediaUrn && {
            media: [{
              status: 'READY',
              description: {
                text: formData.title
              },
              media: mediaUrn,
              title: {
                text: formData.title
              }
            }]
          })
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.linkedin.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to publish to LinkedIn' };
    }

    return {
      success: true,
      url: `https://www.linkedin.com/feed/update/${data.id}`,
      postId: data.id
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function uploadMediaToLinkedIn(file: File, accessToken: string): Promise<string | null> {
  try {
    // This is a simplified version - actual LinkedIn media upload requires multiple steps
    // For production, implement the full LinkedIn media upload flow
    console.log('LinkedIn media upload not fully implemented');
    return null;
  } catch (error) {
    console.error('Error uploading media to LinkedIn:', error);
    return null;
  }
}

export async function publishToInstagram(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.instagram?.accessToken) {
      return { success: false, error: 'Instagram API key not configured' };
    }

    // Instagram requires media upload through Facebook Graph API
    // This is a placeholder for the complex Instagram publishing flow
    console.log('Instagram publishing requires Facebook Graph API implementation');
    
    return { success: false, error: 'Instagram publishing not yet implemented' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishToYouTube(content: ContentItem, formData: any): Promise<PublishResult> {
  try {
    const apiKeys = loadApiKeys();
    if (!apiKeys.youtube?.accessToken) {
      return { success: false, error: 'YouTube API key not configured' };
    }

    // YouTube requires video upload through Google APIs
    // This is a placeholder for the complex YouTube upload flow
    console.log('YouTube publishing requires Google APIs implementation');
    
    return { success: false, error: 'YouTube publishing not yet implemented' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function publishContent(
  platform: Platform['id'],
  content: ContentItem,
  formData: any
): Promise<PublishResult> {
  switch (platform) {
    case 'hashnode':
      return publishToHashnode(content, formData);
    case 'devTo':
      return publishToDevTo(content, formData);
    case 'twitter':
      return publishToTwitter(content, formData);
    case 'linkedin':
      return publishToLinkedIn(content, formData);
    case 'instagram':
      return publishToInstagram(content, formData);
    case 'youtube':
      return publishToYouTube(content, formData);
    default:
      return { success: false, error: 'Unsupported platform' };
  }
}
