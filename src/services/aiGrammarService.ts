
import { getAvailableAiApi } from '@/config/apiKeys';

interface GrammarCheckResult {
  success: boolean;
  correctedText?: string;
  suggestions?: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
  error?: string;
}

export async function checkGrammar(text: string): Promise<GrammarCheckResult> {
  try {
    const { provider, apiKey } = getAvailableAiApi();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'No AI API key configured'
      };
    }

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
              content: 'You are a grammar and writing assistant. Check the provided text for grammar, spelling, and clarity issues. Return a JSON object with "correctedText" (the improved version) and "suggestions" (array of objects with "original", "suggestion", and "reason" fields).'
            },
            {
              role: 'user',
              content: `Please check and improve this text: "${text}"`
            }
          ],
          temperature: 0.3,
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
              text: `Check grammar and improve this text, return JSON with correctedText and suggestions: "${text}"`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
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
              content: 'Check grammar and return JSON with correctedText and suggestions fields.'
            },
            {
              role: 'user',
              content: `Check grammar: "${text}"`
            }
          ],
          temperature: 0.3,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let content = '';

    if (provider === 'openai' || provider === 'groq') {
      content = data.choices[0].message.content;
    } else if (provider === 'gemini') {
      content = data.candidates[0].content.parts[0].text;
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        correctedText: parsed.correctedText || text,
        suggestions: parsed.suggestions || []
      };
    } catch {
      // If not JSON, treat as corrected text
      return {
        success: true,
        correctedText: content,
        suggestions: []
      };
    }

  } catch (error) {
    console.error('Grammar check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Grammar check failed'
    };
  }
}
