
import { ApiKeys } from '@/types';

// This file will store API keys that should be set via the UI
// Default values are empty as they must be provided via the admin panel
const defaultApiKeys: ApiKeys = {
  // Source APIs - Updated structure
  sourceApi: {
    hashnodeApi: {
      url: "",
      apiKey: "",
    },
    devToApi: {
      url: "",
      apiKey: "",
    },
    linkedinApi: {
      url: "",
      apiKey: "",
    },
    twitterApi: {
      url: "",
      apiKey: "",
    },
  },
  
  // AI APIs - Now includes OpenAI as primary
  ai: {
    openai: {
      apiKey: "",
      usageCount: 0,
      dailyLimit: 100, // Default limit for free tier
    },
    gemini: {
      apiKey: "",
      usageCount: 0,
      dailyLimit: 100, // Default limit for free tier
    },
    backupAi1: {
      provider: "groq", // GroqCloud
      apiKey: "",
      usageCount: 0,
      dailyLimit: 100, // Default limit
      model: "llama3-8b-8192" // Default model for Groq
    }
  },
  
  // Platform APIs
  hashnode: {
    token: "",
    publicationId: "",
  },
  devTo: {
    apiKey: "",
  },
  twitter: {
    apiKey: "",
    apiKeySecret: "",
    accessToken: "",
    accessTokenSecret: "",
    bearerToken: "",
  },
  linkedin: {
    clientId: "",
    clientSecret: "",
    accessToken: "",
    refreshToken: "",
    personId: "", // Added missing personId
  },
  instagram: {
    accessToken: "",
    userId: "",
    pageId: "", // Added missing pageId
    appId: "",
    appSecret: "",
    dropboxToken: "",
    dropboxApiKey: "",
  },
  youtube: {
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    accessToken: "",
    dropboxToken: "",
    dropboxApiKey: "",
  }
};

// Local storage key for API keys
export const API_KEYS_STORAGE_KEY = "astrumverse_api_keys";

// Load API keys from local storage with full fallbacks to defaults
export const loadApiKeys = (): ApiKeys => {
  if (typeof window !== "undefined") {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (storedKeys) {
      try {
        const parsedKeys = JSON.parse(storedKeys);
        // Make sure we have all required structures by merging with defaults
        return mergeDeep(defaultApiKeys, parsedKeys);
      } catch (error) {
        console.error("Failed to parse stored API keys", error);
      }
    }
  }
  return defaultApiKeys;
};

// Save API keys to local storage
export const saveApiKeys = (keys: ApiKeys): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
  }
};

// Get the next available AI API based on usage
export const getAvailableAiApi = (): { provider: string; apiKey: string } => {
  const keys = loadApiKeys();
  
  // Check if primary AI (OpenAI) is available
  if (keys.ai?.openai?.apiKey && keys.ai.openai.usageCount < keys.ai.openai.dailyLimit) {
    // Increment usage count and save
    if (keys.ai.openai) {
      keys.ai.openai.usageCount += 1;
      saveApiKeys(keys);
    }
    return { provider: 'openai', apiKey: keys.ai.openai.apiKey };
  }
  
  // Check if secondary AI (Gemini) is available
  if (keys.ai?.gemini?.apiKey && keys.ai.gemini.usageCount < keys.ai.gemini.dailyLimit) {
    // Increment usage count and save
    if (keys.ai.gemini) {
      keys.ai.gemini.usageCount += 1;
      saveApiKeys(keys);
    }
    return { provider: 'gemini', apiKey: keys.ai.gemini.apiKey };
  }
  
  // Try first backup
  if (keys.ai?.backupAi1?.apiKey && keys.ai.backupAi1.usageCount < keys.ai.backupAi1.dailyLimit) {
    if (keys.ai.backupAi1) {
      keys.ai.backupAi1.usageCount += 1;
      saveApiKeys(keys);
    }
    return { provider: keys.ai.backupAi1.provider, apiKey: keys.ai.backupAi1.apiKey };
  }
  
  // If all APIs have reached their limits, use OpenAI as fallback
  return { provider: 'openai', apiKey: keys.ai?.openai?.apiKey || '' };
};

// Reset daily usage counts (should be called once per day)
export const resetDailyUsageCounts = (): void => {
  const keys = loadApiKeys();
  if (keys.ai) {
    if (keys.ai.openai) keys.ai.openai.usageCount = 0;
    if (keys.ai.gemini) keys.ai.gemini.usageCount = 0;
    if (keys.ai.backupAi1) keys.ai.backupAi1.usageCount = 0;
    saveApiKeys(keys);
  }
};

// Helper function to deep merge objects
function mergeDeep<T extends Record<string, any>>(target: T, source: any): T {
  if (!source) return target;
  const output = { ...target } as Record<string, any>;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(output[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output as T;
}

function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
