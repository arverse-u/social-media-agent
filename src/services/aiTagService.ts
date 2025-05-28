
import { getAvailableAiApi } from '@/config/apiKeys';

interface TagGenerationResult {
  success: boolean;
  tags?: string[];
  error?: string;
}

export async function generateTags(content: string, platform?: string): Promise<TagGenerationResult> {
  try {
    const { provider, apiKey } = getAvailableAiApi();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'No AI API key configured'
      };
    }

    const platformContext = platform ? ` for ${platform}` : '';
    const prompt = `Generate 5-10 relevant tags${platformContext} for this content. Return only a JSON array of strings: "${content}"`;

    let response;
    
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a content tagging expert. Generate relevant tags and return them as a JSON array of strings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
        }),
      });
    } else if (provider === 'gemini') {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
          }
        }),
      });
    } else {
      // Groq fallback
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'Generate content tags and return as JSON array.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let content_result = '';

    if (provider === 'openai' || provider === 'groq') {
      content_result = data.choices[0].message.content;
    } else if (provider === 'gemini') {
      content_result = data.candidates[0].content.parts[0].text;
    }

    // Try to parse JSON response
    try {
      const tags = JSON.parse(content_result);
      return {
        success: true,
        tags: Array.isArray(tags) ? tags : []
      };
    } catch {
      // Fallback: extract tags from text
      const tagMatches = content_result.match(/#\w+|"[^"]+"/g);
      const extractedTags = tagMatches ? tagMatches.map(tag => tag.replace(/[#"]/g, '')) : [];
      
      return {
        success: true,
        tags: extractedTags.length > 0 ? extractedTags : ['general', 'content', 'post']
      };
    }

  } catch (error) {
    console.error('Tag generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tag generation failed'
    };
  }
}
