
import { loadApiKeys } from '@/config/apiKeys';

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

  // Test AI APIs with latest approaches (May 2025)
  static async testOpenAiApi(apiKey: string): Promise<TestResult> {
    try {
      // Using the latest OpenAI API v1 endpoint for model listing
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

      const data = await response.json();
      const gpt4Models = data.data?.filter((model: any) => model.id.includes('gpt-4'));
      
      return {
        success: true,
        message: `OpenAI API connection successful! Found ${gpt4Models?.length || 0} GPT-4 models available.`
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
      // Using Gemini 2.0 Flash API test endpoint (latest approach as of May 2025)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: Invalid API key or request failed`
        };
      }

      const data = await response.json();
      const flashModels = data.models?.filter((model: any) => model.name.includes('flash'));
      
      return {
        success: true,
        message: `Gemini API connection successful! Found ${flashModels?.length || 0} Flash models available.`
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
      // Using GroqCloud's latest API approach for model listing (May 2025)
      const response = await fetch('https://api.groq.com/openai/v1/models', {
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

      const data = await response.json();
      const llamaModels = data.data?.filter((model: any) => model.id.includes('llama'));
      
      return {
        success: true,
        message: `GroqCloud API connection successful! Found ${llamaModels?.length || 0} Llama models available.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Test Platform APIs with latest approaches (May 2025)
  static async testHashnodePlatformApi(token: string): Promise<TestResult> {
    try {
      // Using Hashnode's latest GraphQL API approach
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
      // Using Dev.to's latest API v1 approach
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
      // Using Twitter API v2 latest approach (May 2025)
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
        message: `Connected as @${data.data?.username || 'User'}`
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
      // Using LinkedIn's latest API v2 approach
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
      // Using Instagram Basic Display API latest approach
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
        message: `Connected as @${data.username || 'User'}`
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
      // Using YouTube Data API v3 latest approach
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
