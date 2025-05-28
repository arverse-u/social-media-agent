
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Enhanced Gemini API call for content optimization
async function optimizeWithGemini(content: any, platform: string, contentType: string) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) return null;

  const prompt = `
    Optimize this content for ${platform} platform:
    
    Title: ${content.title}
    Description: ${content.description}
    Image URL: ${content.imageurl || 'None'}
    Content Type: ${contentType}
    
    Create optimized content with:
    1. SEO-optimized title (max 60 chars for blogs, 280 for social)
    2. Engaging description/content optimized for ${platform}
    3. 8-10 relevant hashtags for maximum reach
    4. Brief excerpt (150 chars)
    5. SEO score prediction (1-100)
    6. Engagement prediction (0.0-1.0)
    
    Return ONLY valid JSON:
    {
      "optimized_title": "title here",
      "optimized_content": "full content here", 
      "optimized_description": "description here",
      "hashtags": ["tag1", "tag2"],
      "excerpt": "brief excerpt",
      "seo_score": 85,
      "engagement_prediction": 0.75,
      "reasoning": "why these optimizations work"
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// Fetch content from Hashnode
async function fetchHashnodeContent() {
  const hashnodeApiKey = Deno.env.get('HASHNODE_API_KEY');
  if (!hashnodeApiKey) return [];

  try {
    const query = `
      query {
        publication(host: "hashnode.com") {
          posts(first: 20) {
            edges {
              node {
                id
                title
                brief
                coverImage {
                  url
                }
                url
                publishedAt
                content {
                  markdown
                }
                tags {
                  name
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': hashnodeApiKey,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const posts = data.data?.publication?.posts?.edges || [];
    
    const processedContent = [];
    for (const edge of posts) {
      const post = edge.node;
      const optimized = await optimizeWithGemini({
        title: post.title,
        description: post.brief,
        imageurl: post.coverImage?.url
      }, 'hashnode', 'blog');

      if (optimized) {
        await supabase.from('raw_content').insert({
          source_platform: 'hashnode',
          title: post.title,
          description: post.brief,
          image_url: post.coverImage?.url,
          source_url: post.url,
          raw_data: post
        });

        await supabase.from('processed_content').insert({
          target_platform: 'hashnode',
          optimized_title: optimized.optimized_title,
          optimized_content: optimized.optimized_content,
          optimized_description: optimized.optimized_description,
          hashtags: optimized.hashtags,
          seo_score: optimized.seo_score,
          engagement_prediction: optimized.engagement_prediction,
          ai_insights: { reasoning: optimized.reasoning },
          status: 'optimized'
        });

        processedContent.push(optimized);
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error('Error fetching Hashnode content:', error);
    return [];
  }
}

// Fetch content from Dev.to
async function fetchDevToContent() {
  const devtoApiKey = Deno.env.get('DEVTO_API_KEY');
  if (!devtoApiKey) return [];

  try {
    const response = await fetch('https://dev.to/api/articles/me', {
      headers: { 'api-key': devtoApiKey },
    });

    const articles = await response.json();
    const processedContent = [];

    for (const article of articles.slice(0, 20)) {
      const optimized = await optimizeWithGemini({
        title: article.title,
        description: article.description,
        imageurl: article.cover_image
      }, 'devto', 'blog');

      if (optimized) {
        await supabase.from('raw_content').insert({
          source_platform: 'devto',
          title: article.title,
          description: article.description,
          image_url: article.cover_image,
          source_url: article.url,
          raw_data: article
        });

        await supabase.from('processed_content').insert({
          target_platform: 'devto',
          optimized_title: optimized.optimized_title,
          optimized_content: optimized.optimized_content,
          optimized_description: optimized.optimized_description,
          hashtags: optimized.hashtags,
          seo_score: optimized.seo_score,
          engagement_prediction: optimized.engagement_prediction,
          ai_insights: { reasoning: optimized.reasoning },
          status: 'optimized'
        });

        processedContent.push(optimized);
      }
    }

    return processedContent;
  } catch (error) {
    console.error('Error fetching Dev.to content:', error);
    return [];
  }
}

// Fetch content from Twitter/X
async function fetchTwitterContent() {
  const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  if (!twitterBearerToken) return [];

  try {
    const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=from:yourusername&max_results=50&tweet.fields=created_at,public_metrics,attachments', {
      headers: { 'Authorization': `Bearer ${twitterBearerToken}` },
    });

    const data = await response.json();
    const tweets = data.data || [];
    const processedContent = [];

    for (const tweet of tweets) {
      const optimized = await optimizeWithGemini({
        title: tweet.text.substring(0, 50) + '...',
        description: tweet.text,
        imageurl: null
      }, 'twitter', 'feed');

      if (optimized) {
        await supabase.from('raw_content').insert({
          source_platform: 'twitter',
          title: tweet.text.substring(0, 100),
          description: tweet.text,
          source_url: `https://twitter.com/user/status/${tweet.id}`,
          raw_data: tweet
        });

        await supabase.from('processed_content').insert({
          target_platform: 'twitter',
          optimized_title: optimized.optimized_title,
          optimized_content: optimized.optimized_content,
          optimized_description: optimized.optimized_description,
          hashtags: optimized.hashtags,
          seo_score: optimized.seo_score,
          engagement_prediction: optimized.engagement_prediction,
          ai_insights: { reasoning: optimized.reasoning },
          status: 'optimized'
        });

        processedContent.push(optimized);
      }
    }

    return processedContent;
  } catch (error) {
    console.error('Error fetching Twitter content:', error);
    return [];
  }
}

// Fetch content from LinkedIn
async function fetchLinkedInContent() {
  const linkedinToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  if (!linkedinToken) return [];

  try {
    const response = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:{person-id}&count=50', {
      headers: { 'Authorization': `Bearer ${linkedinToken}` },
    });

    const data = await response.json();
    const posts = data.elements || [];
    const processedContent = [];

    for (const post of posts) {
      const text = post.text?.text || '';
      const optimized = await optimizeWithGemini({
        title: text.substring(0, 50) + '...',
        description: text,
        imageurl: null
      }, 'linkedin', 'feed');

      if (optimized) {
        await supabase.from('raw_content').insert({
          source_platform: 'linkedin',
          title: text.substring(0, 100),
          description: text,
          raw_data: post
        });

        await supabase.from('processed_content').insert({
          target_platform: 'linkedin',
          optimized_title: optimized.optimized_title,
          optimized_content: optimized.optimized_content,
          optimized_description: optimized.optimized_description,
          hashtags: optimized.hashtags,
          seo_score: optimized.seo_score,
          engagement_prediction: optimized.engagement_prediction,
          ai_insights: { reasoning: optimized.reasoning },
          status: 'optimized'
        });

        processedContent.push(optimized);
      }
    }

    return processedContent;
  } catch (error) {
    console.error('Error fetching LinkedIn content:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform } = await req.json();
    let result = [];

    switch (platform) {
      case 'hashnode':
        result = await fetchHashnodeContent();
        break;
      case 'devto':
        result = await fetchDevToContent();
        break;
      case 'twitter':
        result = await fetchTwitterContent();
        break;
      case 'linkedin':
        result = await fetchLinkedInContent();
        break;
      case 'all':
        const [hashnode, devto, twitter, linkedin] = await Promise.all([
          fetchHashnodeContent(),
          fetchDevToContent(), 
          fetchTwitterContent(),
          fetchLinkedInContent()
        ]);
        result = [...hashnode, ...devto, ...twitter, ...linkedin];
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      message: `Fetched and optimized ${result.length} content items from ${platform}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
