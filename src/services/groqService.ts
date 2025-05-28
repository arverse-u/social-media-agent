
import { GeminiResponse } from '@/types';

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const generateContentWithGroq = async (
  prompt: string,
  apiKey: string,
  model = 'llama3-8b-8192'
): Promise<GeminiResponse> => {
  try {
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps content creators generate high-quality articles, social media posts, and video scripts. Provide detailed, well-structured content that is engaging and optimized for the target platform.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GroqResponse = await response.json();
    
    // Extract content from response
    const content = data.choices[0].message.content;
    
    // Parse the content to extract title, tags, and summary if possible
    let title = '';
    let tags: string[] = [];
    let summary = '';
    
    // Try to extract title (look for # or Title: pattern)
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^Title:\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // Try to extract tags (look for Tags: pattern)
    const tagsMatch = content.match(/Tags:\s+(.+)$/m);
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(tag => tag.trim());
    }
    
    // Try to extract summary (look for Summary: pattern)
    const summaryMatch = content.match(/Summary:\s+(.+?)(?=\n\n|\n#|\n\*\*|$)/s);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }
    
    return {
      content,
      title,
      tags,
      summary
    };
  } catch (error) {
    console.error('Error generating content with Groq:', error);
    throw error;
  }
};
