import { GeminiResponse, ApiResponse } from '@/types';
import { loadApiKeys } from '@/config/apiKeys';

// Gemini API endpoint
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';

export async function generateTags(content: string): Promise<ApiResponse<string[]>> {
  try {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) {
      return {
        success: false,
        error: 'Gemini API key is not configured',
      };
    }

    const prompt = `
      Extract relevant tags from the following content. 
      Return only a JSON array of tag strings, with each tag being a single word or short phrase.
      Provide between 5-8 tags that best represent the content and would perform well for SEO.
      
      Content:
      ${content.substring(0, 3000)}
    `;

    const response = await fetch(`${GEMINI_API}/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to generate tags: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return {
        success: false,
        error: 'No tag suggestions received from Gemini',
      };
    }

    // Extract JSON array from response (Gemini might include explanatory text)
    const jsonMatch = text.match(/\[.*?\]/s);
    if (jsonMatch) {
      try {
        const tags = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: tags,
        };
      } catch (e) {
        console.error('Failed to parse tag JSON', e);
      }
    }

    // Fallback: try to extract tags by splitting text
    const extractedTags = text
      .replace(/[\[\]"']/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    return {
      success: true,
      data: extractedTags,
    };
  } catch (error) {
    console.error('Error generating tags:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function improveContent(content: string, goal: string): Promise<ApiResponse<string>> {
  try {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) {
      return {
        success: false,
        error: 'Gemini API key is not configured',
      };
    }

    const prompt = `
      Improve the following content based on this goal: ${goal}
      
      Keep the same overall meaning and structure, but enhance it according to the goal.
      Return only the improved content without any additional text or explanation.
      
      Original Content:
      ${content.substring(0, 5000)}
    `;

    const response = await fetch(`${GEMINI_API}/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to improve content: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!improvedContent) {
      return {
        success: false,
        error: 'No improved content received from Gemini',
      };
    }

    return {
      success: true,
      data: improvedContent,
    };
  } catch (error) {
    console.error('Error improving content:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function suggestOptimalPublishTime(contentType: string, platform: string): Promise<ApiResponse<string>> {
  try {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) {
      return {
        success: false,
        error: 'Gemini API key is not configured',
      };
    }

    const prompt = `
      Suggest an optimal time to publish a ${contentType} on ${platform} for maximum engagement.
      
      Return only a JSON object with the following structure:
      {
        "dayOfWeek": "Monday-Sunday",
        "timeOfDay": "HH:MM AM/PM",
        "timezone": "EST/PST/etc",
        "explanation": "Brief reason"
      }
    `;

    const response = await fetch(`${GEMINI_API}/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 250,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to suggest optimal publish time: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!suggestion) {
      return {
        success: false,
        error: 'No suggestion received from Gemini',
      };
    }

    // Try to parse JSON from the response
    try {
      const jsonMatch = suggestion.match(/{.*}/s);
      if (jsonMatch) {
        const timeData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: timeData,
        };
      }
    } catch (e) {
      console.error('Failed to parse time suggestion JSON', e);
    }

    return {
      success: false,
      error: 'Failed to parse time suggestion',
    };
  } catch (error) {
    console.error('Error suggesting optimal publish time:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function generateSummary(content: string): Promise<ApiResponse<string>> {
  try {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) {
      return {
        success: false,
        error: 'Gemini API key is not configured',
      };
    }

    const prompt = `
      Create a concise summary of the following content in 2-3 sentences.
      
      Content:
      ${content.substring(0, 5000)}
    `;

    const response = await fetch(`${GEMINI_API}/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to generate summary: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summary) {
      return {
        success: false,
        error: 'No summary received from Gemini',
      };
    }

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function generateOptimizedContent(content: any, platform: string): Promise<{ content: string; title: string; excerpt: string }> {
  try {
    const keys = loadApiKeys();
    
    if (!keys.ai?.gemini?.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `
      Optimize the following content for ${platform}:
      
      Title: ${content.title}
      Content: ${content.content}
      
      Please optimize this content specifically for ${platform} platform.
      Return a JSON object with:
      {
        "title": "optimized title",
        "content": "optimized content",
        "excerpt": "brief excerpt"
      }
      
      Platform-specific requirements:
      - Twitter: Keep content under 280 characters
      - LinkedIn: Professional tone, up to 3000 characters
      - Instagram: Engaging caption with hashtags, up to 2200 characters
      - YouTube: Descriptive title and detailed description
    `;

    const response = await fetch(`${GEMINI_API}/models/gemini-1.5-flash:generateContent?key=${keys.ai.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to optimize content: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const optimizedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!optimizedText) {
      throw new Error('No optimized content received from Gemini');
    }

    // Try to parse JSON from response
    try {
      const jsonMatch = optimizedText.match(/\{.*\}/s);
      if (jsonMatch) {
        const optimizedContent = JSON.parse(jsonMatch[0]);
        return {
          content: optimizedContent.content || content.content,
          title: optimizedContent.title || content.title,
          excerpt: optimizedContent.excerpt || content.excerpt || content.content.substring(0, 150)
        };
      }
    } catch (e) {
      console.error('Failed to parse optimized content JSON', e);
    }

    // Fallback: return original content with platform-specific adjustments
    let optimizedContent = content.content;
    if (platform === 'twitter' && optimizedContent.length > 250) {
      optimizedContent = optimizedContent.substring(0, 247) + '...';
    }

    return {
      content: optimizedContent,
      title: content.title,
      excerpt: content.excerpt || content.content.substring(0, 150)
    };
  } catch (error) {
    console.error('Error optimizing content:', error);
    
    // Return original content as fallback
    return {
      content: content.content,
      title: content.title,
      excerpt: content.excerpt || content.content.substring(0, 150)
    };
  }
}
