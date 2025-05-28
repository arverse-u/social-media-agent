
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

// Enhanced content optimization using Groq Llama3
async function optimizeVideoContentWithGroq(videoData: any, platform: string) {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) return null;

  const prompt = `
    Create optimized video content for ${platform}:
    
    Video File: ${videoData.filename}
    Video Type: ${videoData.videotype}
    Content Description: ${videoData.content}
    Platform: ${platform}
    
    Generate comprehensive metadata optimized for maximum engagement:
    
    For ${platform === 'youtube' ? 'YouTube' : 'Instagram'}:
    - Title: Catchy, SEO-optimized (${platform === 'youtube' ? '60 chars max' : '125 chars max'})
    - Description: Engaging, keyword-rich description
    - Tags/Hashtags: 10-15 relevant tags for discovery
    - Category: Best category for this content
    - Thumbnail text suggestion
    - Best posting time recommendation
    
    Return ONLY valid JSON:
    {
      "optimized_title": "engaging title here",
      "optimized_description": "full description with keywords",
      "hashtags": ["tag1", "tag2", "tag3"],
      "category": "category name",
      "thumbnail_text": "suggested thumbnail text",
      "best_posting_time": "recommended time",
      "seo_score": 85,
      "engagement_prediction": 0.8,
      "reasoning": "optimization strategy explanation"
    }
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert video content optimizer specializing in YouTube and Instagram. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
}

// Fetch video from Dropbox
async function fetchVideoFromDropbox(filename: string) {
  const dropboxToken = Deno.env.get('DROPBOX_ACCESS_TOKEN');
  if (!dropboxToken) return null;

  try {
    const response = await fetch('https://api.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dropboxToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: `/${filename}` }),
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch video ${filename} from Dropbox: ${response.status}`);
      return null;
    }

    const videoBlob = await response.blob();
    const arrayBuffer = await videoBlob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching video from Dropbox:', error);
    return null;
  }
}

function parseCSV(csvData: string) {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData, platform } = await req.json();
    
    if (!csvData) {
      throw new Error('CSV data is required');
    }

    if (!['instagram', 'youtube'].includes(platform)) {
      throw new Error('Platform must be instagram or youtube');
    }

    const rows = parseCSV(csvData);
    const processedVideos = [];

    for (const row of rows) {
      const filename = row.videofilename || row.filename || '';
      const videotype = row.videotype || row.type || '';
      const content = row.content || row.description || '';

      if (filename && videotype && content) {
        // Optimize content with Groq
        const optimized = await optimizeVideoContentWithGroq({
          filename,
          videotype,
          content
        }, platform);

        if (optimized) {
          // Store video metadata in database
          const { data: videoRecord, error } = await supabase
            .from('video_content')
            .insert({
              filename,
              video_type: videotype,
              content_description: content,
              target_platforms: [platform],
              processed: false,
              dropbox_path: `/${filename}`
            })
            .select()
            .single();

          if (error) {
            console.error('Error inserting video content:', error);
            continue;
          }

          // Store optimized content
          await supabase.from('processed_content').insert({
            target_platform: platform,
            optimized_title: optimized.optimized_title,
            optimized_content: optimized.optimized_description,
            optimized_description: optimized.optimized_description,
            hashtags: optimized.hashtags,
            seo_score: optimized.seo_score,
            engagement_prediction: optimized.engagement_prediction,
            ai_insights: {
              reasoning: optimized.reasoning,
              category: optimized.category,
              thumbnail_text: optimized.thumbnail_text,
              best_posting_time: optimized.best_posting_time,
              video_file: filename,
              video_type: videotype
            },
            status: 'optimized'
          });

          // Fetch video data from Dropbox for future upload
          const videoData = await fetchVideoFromDropbox(filename);
          
          processedVideos.push({
            ...optimized,
            filename,
            videotype,
            hasVideoData: !!videoData,
            videoRecord
          });
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${processedVideos.length} videos for ${platform}`,
      videos: processedVideos.length,
      data: processedVideos
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-csv function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
