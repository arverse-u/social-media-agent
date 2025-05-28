
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

// Collect analytics from Twitter/X
async function collectTwitterAnalytics() {
  const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  if (!bearerToken) return [];

  try {
    const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=from:yourusername&max_results=100&tweet.fields=created_at,public_metrics,organic_metrics', {
      headers: { 'Authorization': `Bearer ${bearerToken}` },
    });

    const data = await response.json();
    const tweets = data.data || [];
    const analytics = [];

    for (const tweet of tweets) {
      const metrics = tweet.public_metrics || {};
      const organic = tweet.organic_metrics || {};
      
      const analyticsData = {
        platform: 'twitter',
        post_id: tweet.id,
        post_url: `https://twitter.com/user/status/${tweet.id}`,
        views: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        shares: metrics.retweet_count || 0,
        comments: metrics.reply_count || 0,
        engagement_rate: calculateEngagementRate(metrics),
        reach: organic.impression_count || metrics.impression_count || 0,
        impressions: metrics.impression_count || 0,
        click_through_rate: organic.url_link_clicks ? (organic.url_link_clicks / metrics.impression_count) : 0,
        date_posted: tweet.created_at,
        collected_at: new Date().toISOString()
      };

      analytics.push(analyticsData);
    }

    return analytics;
  } catch (error) {
    console.error('Error collecting Twitter analytics:', error);
    return [];
  }
}

// Collect analytics from LinkedIn
async function collectLinkedInAnalytics() {
  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  if (!accessToken) return [];

  try {
    // Get user's posts
    const postsResponse = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:{person-id}&count=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const postsData = await postsResponse.json();
    const posts = postsData.elements || [];
    const analytics = [];

    for (const post of posts) {
      // Get analytics for each post
      const analyticsResponse = await fetch(`https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${post.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const analyticsData = await analyticsResponse.json();
      const stats = analyticsData.elements?.[0] || {};

      const data = {
        platform: 'linkedin',
        post_id: post.id,
        post_url: post.content?.contentEntities?.[0]?.entityLocation,
        views: stats.totalShareStatistics?.impressionCount || 0,
        likes: stats.totalShareStatistics?.likeCount || 0,
        shares: stats.totalShareStatistics?.shareCount || 0,
        comments: stats.totalShareStatistics?.commentCount || 0,
        engagement_rate: calculateEngagementRate({
          like_count: stats.totalShareStatistics?.likeCount || 0,
          share_count: stats.totalShareStatistics?.shareCount || 0,
          comment_count: stats.totalShareStatistics?.commentCount || 0,
          impression_count: stats.totalShareStatistics?.impressionCount || 0
        }),
        reach: stats.totalShareStatistics?.impressionCount || 0,
        impressions: stats.totalShareStatistics?.impressionCount || 0,
        click_through_rate: stats.totalShareStatistics?.clickCount ? 
          (stats.totalShareStatistics.clickCount / stats.totalShareStatistics.impressionCount) : 0,
        date_posted: new Date(post.created?.time || Date.now()).toISOString(),
        collected_at: new Date().toISOString()
      };

      analytics.push(data);
    }

    return analytics;
  } catch (error) {
    console.error('Error collecting LinkedIn analytics:', error);
    return [];
  }
}

// Collect analytics from Instagram
async function collectInstagramAnalytics() {
  const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
  if (!accessToken) return [];

  try {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,timestamp,insights.metric(impressions,reach,likes,comments,shares,saved)&access_token=${accessToken}`);
    
    const data = await response.json();
    const posts = data.data || [];
    const analytics = [];

    for (const post of posts) {
      const insights = post.insights?.data || [];
      const impressions = insights.find(i => i.name === 'impressions')?.values?.[0]?.value || 0;
      const reach = insights.find(i => i.name === 'reach')?.values?.[0]?.value || 0;
      const likes = insights.find(i => i.name === 'likes')?.values?.[0]?.value || 0;
      const comments = insights.find(i => i.name === 'comments')?.values?.[0]?.value || 0;
      const shares = insights.find(i => i.name === 'shares')?.values?.[0]?.value || 0;

      const analyticsData = {
        platform: 'instagram',
        post_id: post.id,
        post_url: `https://instagram.com/p/${post.id}`,
        views: impressions,
        likes: likes,
        shares: shares,
        comments: comments,
        engagement_rate: calculateEngagementRate({
          like_count: likes,
          comment_count: comments,
          share_count: shares,
          impression_count: impressions
        }),
        reach: reach,
        impressions: impressions,
        click_through_rate: 0, // Instagram doesn't provide this metric directly
        date_posted: post.timestamp,
        collected_at: new Date().toISOString()
      };

      analytics.push(analyticsData);
    }

    return analytics;
  } catch (error) {
    console.error('Error collecting Instagram analytics:', error);
    return [];
  }
}

// Collect analytics from YouTube
async function collectYouTubeAnalytics() {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) return [];

  try {
    // Get channel's videos
    const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=50&key=${apiKey}`);
    const videosData = await videosResponse.json();
    const videos = videosData.items || [];
    
    const analytics = [];

    for (const video of videos) {
      // Get analytics for each video
      const analyticsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id.videoId}&key=${apiKey}`);
      const analyticsData = await analyticsResponse.json();
      const stats = analyticsData.items?.[0]?.statistics || {};

      const data = {
        platform: 'youtube',
        post_id: video.id.videoId,
        post_url: `https://youtube.com/watch?v=${video.id.videoId}`,
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0'),
        shares: 0, // YouTube doesn't provide share count in basic API
        comments: parseInt(stats.commentCount || '0'),
        engagement_rate: calculateEngagementRate({
          like_count: parseInt(stats.likeCount || '0'),
          comment_count: parseInt(stats.commentCount || '0'),
          impression_count: parseInt(stats.viewCount || '0')
        }),
        reach: parseInt(stats.viewCount || '0'),
        impressions: parseInt(stats.viewCount || '0'),
        click_through_rate: 0, // Would need YouTube Analytics API for this
        date_posted: video.snippet.publishedAt,
        collected_at: new Date().toISOString()
      };

      analytics.push(data);
    }

    return analytics;
  } catch (error) {
    console.error('Error collecting YouTube analytics:', error);
    return [];
  }
}

// Calculate engagement rate
function calculateEngagementRate(metrics: any) {
  const engagement = (metrics.like_count || 0) + (metrics.comment_count || 0) + (metrics.share_count || 0);
  const impressions = metrics.impression_count || 1;
  return engagement / impressions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting analytics collection at:', new Date().toISOString());

    // Collect analytics from all platforms
    const [twitterAnalytics, linkedinAnalytics, instagramAnalytics, youtubeAnalytics] = await Promise.all([
      collectTwitterAnalytics(),
      collectLinkedInAnalytics(),
      collectInstagramAnalytics(),
      collectYouTubeAnalytics()
    ]);

    const allAnalytics = [
      ...twitterAnalytics,
      ...linkedinAnalytics,
      ...instagramAnalytics,
      ...youtubeAnalytics
    ];

    // Store analytics in database
    const insertPromises = allAnalytics.map(analytics => 
      supabase.from('platform_analytics').insert(analytics)
    );

    await Promise.all(insertPromises);

    console.log(`Collected analytics for ${allAnalytics.length} posts across all platforms`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Analytics collected for ${allAnalytics.length} posts`,
      breakdown: {
        twitter: twitterAnalytics.length,
        linkedin: linkedinAnalytics.length,
        instagram: instagramAnalytics.length,
        youtube: youtubeAnalytics.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in collect-analytics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
