
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Twitter posting with OAuth 1.0a
async function postToTwitter(content: any) {
  const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY");
  const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET");
  const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    throw new Error("Twitter API credentials not configured");
  }

  function generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    consumerSecret: string,
    tokenSecret: string
  ): string {
    const signatureBaseString = `${method}&${encodeURIComponent(
      url
    )}&${encodeURIComponent(
      Object.entries(params)
        .sort()
        .map(([k, v]) => `${k}=${v}`)
        .join("&")
    )}`;
    const signingKey = `${encodeURIComponent(
      consumerSecret
    )}&${encodeURIComponent(tokenSecret)}`;
    const hmacSha1 = createHmac("sha1", signingKey);
    const signature = hmacSha1.update(signatureBaseString).digest("base64");
    return signature;
  }

  function generateOAuthHeader(method: string, url: string): string {
    const oauthParams = {
      oauth_consumer_key: API_KEY!,
      oauth_nonce: Math.random().toString(36).substring(2),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: ACCESS_TOKEN!,
      oauth_version: "1.0",
    };

    const signature = generateOAuthSignature(
      method,
      url,
      oauthParams,
      API_SECRET!,
      ACCESS_TOKEN_SECRET!
    );

    const signedOAuthParams = {
      ...oauthParams,
      oauth_signature: signature,
    };

    const entries = Object.entries(signedOAuthParams).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return (
      "OAuth " +
      entries
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(", ")
    );
  }

  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const oauthHeader = generateOAuthHeader(method, url);

  // Format content for Twitter (280 character limit)
  let tweetText = content.optimized_content || content.optimized_title;
  if (tweetText.length > 250) {
    tweetText = tweetText.substring(0, 247) + "...";
  }
  
  // Add hashtags
  if (content.hashtags && content.hashtags.length > 0) {
    const hashtagText = " " + content.hashtags.slice(0, 3).map(tag => `#${tag}`).join(" ");
    if (tweetText.length + hashtagText.length <= 280) {
      tweetText += hashtagText;
    }
  }

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: tweetText }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// LinkedIn posting
async function postToLinkedIn(content: any) {
  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('LinkedIn access token not configured');
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: "urn:li:person:{person-id}",
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content.optimized_content + (content.hashtags ? "\n\n" + content.hashtags.map(tag => `#${tag}`).join(" ") : "")
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Instagram posting with video support
async function postToInstagram(content: any) {
  const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
  const userId = Deno.env.get('INSTAGRAM_USER_ID');
  
  if (!accessToken || !userId) {
    throw new Error('Instagram access token or user ID not configured');
  }

  // Check if this is video content
  const isVideo = content.ai_insights?.video_file;
  
  if (isVideo) {
    // Get video file from Dropbox
    const dropboxToken = Deno.env.get('DROPBOX_ACCESS_TOKEN');
    if (!dropboxToken) {
      throw new Error('Dropbox access token not configured for video upload');
    }

    // This is a simplified version - in production you'd need to:
    // 1. Download video from Dropbox
    // 2. Upload to Instagram's media endpoint
    // 3. Publish the video
    
    const response = await fetch(`https://graph.instagram.com/${userId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        media_type: 'VIDEO',
        video_url: 'placeholder_url', // Would need actual video URL
        caption: content.optimized_content + (content.hashtags ? "\n\n" + content.hashtags.map(tag => `#${tag}`).join(" ") : ""),
      }),
    });

    return await response.json();
  } else {
    // Image/text post
    const response = await fetch(`https://graph.instagram.com/${userId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        image_url: 'https://via.placeholder.com/800x600', // Would use actual image
        caption: content.optimized_content + (content.hashtags ? "\n\n" + content.hashtags.map(tag => `#${tag}`).join(" ") : ""),
      }),
    });

    return await response.json();
  }
}

// YouTube video upload
async function postToYouTube(content: any) {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  // This is a simplified version - YouTube upload requires OAuth2 flow
  // and multipart upload for video files
  
  const videoData = {
    snippet: {
      title: content.optimized_title,
      description: content.optimized_content + (content.hashtags ? "\n\nTags: " + content.hashtags.join(", ") : ""),
      tags: content.hashtags || [],
      categoryId: content.ai_insights?.category || "22" // Default to People & Blogs
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false
    }
  };

  // In production, this would involve:
  // 1. Getting video file from Dropbox
  // 2. Uploading via YouTube's resumable upload API
  // 3. Setting metadata
  
  return { message: 'YouTube upload requires OAuth2 implementation', videoData };
}

// Hashnode posting
async function postToHashnode(content: any) {
  const hashnodeToken = Deno.env.get('HASHNODE_API_KEY');
  
  if (!hashnodeToken) {
    throw new Error('Hashnode API token not configured');
  }

  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          title
          url
        }
      }
    }
  `;

  const response = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': hashnodeToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          title: content.optimized_title,
          contentMarkdown: content.optimized_content,
          tags: content.hashtags?.map(tag => ({ slug: tag.toLowerCase().replace(/\s+/g, '-') })) || [],
          publicationId: "your-publication-id" // Would be configured
        }
      }
    }),
  });

  return await response.json();
}

// Dev.to posting
async function postToDevTo(content: any) {
  const devtoApiKey = Deno.env.get('DEVTO_API_KEY');
  
  if (!devtoApiKey) {
    throw new Error('Dev.to API key not configured');
  }

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': devtoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: {
        title: content.optimized_title,
        body_markdown: content.optimized_content,
        published: true,
        tags: content.hashtags || []
      }
    }),
  });

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_id, platforms, auto_publish } = await req.json();
    
    if (!content_id) {
      throw new Error('Content ID is required');
    }

    // Get the processed content
    const { data: processedContent } = await supabase
      .from('processed_content')
      .select('*')
      .eq('id', content_id)
      .single();

    if (!processedContent) {
      throw new Error('Processed content not found');
    }

    const results = [];
    const targetPlatforms = platforms || [processedContent.target_platform];

    for (const platform of targetPlatforms) {
      try {
        let postResult = null;
        
        switch (platform) {
          case 'twitter':
            postResult = await postToTwitter(processedContent);
            break;
          case 'linkedin':
            postResult = await postToLinkedIn(processedContent);
            break;
          case 'instagram':
            postResult = await postToInstagram(processedContent);
            break;
          case 'youtube':
            postResult = await postToYouTube(processedContent);
            break;
          case 'hashnode':
            postResult = await postToHashnode(processedContent);
            break;
          case 'devto':
            postResult = await postToDevTo(processedContent);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        results.push({
          platform,
          success: true,
          result: postResult,
        });

        // Update content status
        await supabase
          .from('processed_content')
          .update({ 
            status: 'published',
            scheduled_for: null 
          })
          .eq('id', content_id);

        // Schedule analytics collection for this post
        await supabase
          .from('scheduled_tasks')
          .insert({
            task_type: 'collect_analytics',
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later
            task_data: {
              content_id: content_id,
              platform: platform,
              post_result: postResult
            }
          });

      } catch (error) {
        console.error(`Error posting to ${platform}:`, error);
        results.push({
          platform,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      results,
      message: `Publishing attempted for ${targetPlatforms.length} platforms`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in publish-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
