
import { loadApiKeys } from '@/config/apiKeys';
import { generateContentWithGroq } from './groqService';
import { generateTags } from './geminiService';

export interface TestResult {
  success: boolean;
  message: string;
}

export class ApiTestService {
  // Test Source APIs
  static async testHashnodeSourceApi(url: string, apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 'unknown'} items.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testDevToSourceApi(url: string, apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 'unknown'} articles.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testLinkedInSourceApi(url: string, apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 'unknown'} posts.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testTwitterSourceApi(url: string, apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 'unknown'} tweets.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Test AI APIs
  static async testOpenAiApi(apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid API key or request failed`
        };
      }

      return {
        success: true,
        message: 'OpenAI API connection successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testGeminiApi(apiKey: string): Promise<TestResult> {
    try {
      const testResult = await generateTags('test content');
      return {
        success: testResult.success,
        message: testResult.success ? 'Gemini API connection successful!' : (testResult.error || 'Gemini API test failed')
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testGroqApi(apiKey: string): Promise<TestResult> {
    try {
      const testResult = await generateContentWithGroq('test', apiKey);
      return {
        success: testResult.success,
        message: testResult.success ? 'Groq API connection successful!' : (testResult.error || 'Groq API test failed')
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Test Platform APIs
  static async testHashnodePlatformApi(token: string): Promise<TestResult> {
    try {
      const response = await fetch('https://gql.hashnode.com/', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query { me { id username } }`
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid token`
        };
      }

      const data = await response.json();
      if (data.errors) {
        return {
          success: false,
          message: 'Invalid Hashnode token'
        };
      }

      return {
        success: true,
        message: `Connected as ${data.data?.me?.username || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testDevToPlatformApi(apiKey: string): Promise<TestResult> {
    try {
      const response = await fetch('https://dev.to/api/users/me', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid API key`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected as ${data.username || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testTwitterPlatformApi(bearerToken: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid bearer token`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected as ${data.data?.username || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testLinkedInPlatformApi(accessToken: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid access token`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected as ${data.localizedFirstName || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testInstagramPlatformApi(accessToken: string): Promise<TestResult> {
    try {
      const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`, {
        method: 'GET',
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid access token`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected as ${data.username || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  static async testYouTubePlatformApi(accessToken: string): Promise<TestResult> {
    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid access token`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected as ${data.items?.[0]?.snippet?.title || 'User'}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}
