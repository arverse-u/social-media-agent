
export interface ContentItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  coverImage?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishStatus: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledDate?: string;
  contentType: 'blog' | 'feed' | 'reel'; // Updated category names
  category: 'blog' | 'feed' | 'reel';    // Updated category names
  mediaUrls?: string[]; // For multiple images or video URLs
}

export interface Platform {
  id: 'hashnode' | 'devTo' | 'twitter' | 'linkedin' | 'instagram' | 'youtube';
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  isConfigured: boolean;
  category: 'blog' | 'feed' | 'reel'; // Updated category names
}

export interface PlatformConfig {
  platform: Platform['id'];
  autoPublish: boolean;
  defaultTags: string[];
  useAuthorName: boolean;
  authorName?: string;
  canonicalLink: boolean;
  publishDelay: number; // in minutes
  retryOnFail: boolean;
  maxRetries: number;
  // Platform-specific configurations
  tweetFormat?: 'title-link' | 'title-excerpt-link' | 'custom';
  addHashtags?: boolean;
  postType?: 'article' | 'image' | 'text' | 'carousel' | 'story' | 'reel';
  includeImage?: boolean;
  captionFormat?: 'title-only' | 'title-excerpt' | 'custom';
  videoPrivacy?: 'public' | 'unlisted' | 'private';
  descriptionFormat?: 'title-only' | 'excerpt' | 'full-content' | 'custom';
}

export interface PublishRecord {
  id: string;
  contentId: string;
  platform: Platform['id'];
  publishedUrl?: string;
  publishDate?: string;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  errorMessage?: string;
  retryCount: number;
  analyticsData?: AnalyticsData;
}

export interface AnalyticsData {
  views?: number;
  reads?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SourceApiResponse {
  articles: ContentItem[];
  nextPage?: string;
}

export interface GeminiResponse {
  content: string;
  tags?: string[];
  title?: string;
  summary?: string;
}

export interface MediaBuffer {
  id: string;
  url: string;
  type: 'image' | 'video';
  filename: string; // Changed from 'name' to 'filename'
  uploadDate: string;
  size: number; // in bytes
  duration?: number; // for videos, in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  used: boolean; // track if this media has been used in content
}

// Platform-specific interfaces
export interface HashnodePost {
  title: string;
  contentMarkdown: string;
  tags: { slug: string }[];
  coverImage?: string;
  isRepublished?: {
    originalArticleURL: string;
  };
  publicationId?: string;
}

export interface DevToPost {
  article: {
    title: string;
    body_markdown: string;
    published: boolean;
    tags: string[];
    canonical_url?: string;
    main_image?: string;
    series?: string;
  };
}

export interface TwitterPost {
  text: string;
  media?: {
    media_ids: string[];
  };
  reply?: {
    in_reply_to_tweet_id: string;
  };
  poll?: {
    options: string[];
    duration_minutes: number;
  };
  quote_tweet_id?: string;
}

export interface LinkedInPost {
  author: string;
  lifecycleState: string;
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: string;
      media?: Array<{
        status: string;
        description: {
          text: string;
        };
        media: string;
        title: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

export interface InstagramPost {
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  children?: {
    data: Array<{
      media_type: 'IMAGE' | 'VIDEO';
      media_url: string;
    }>;
  };
}

export interface YouTubeVideo {
  snippet: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
  };
  status: {
    privacyStatus: 'private' | 'public' | 'unlisted';
    selfDeclaredMadeForKids: boolean;
  };
}

// API Keys and Secrets
export interface ApiKeys {
  // Source APIs - Updated structure
  sourceApi: {
    hashnodeApi: {
      url: string;
      apiKey: string;
    };
    devToApi: {
      url: string;
      apiKey: string;
    };
    linkedinApi: {
      url: string;
      apiKey: string;
    };
    twitterApi: {
      url: string;
      apiKey: string;
    };
  };
  
  // AI APIs - Now includes OpenAI as primary
  ai: {
    openai: {
      apiKey: string;
      usageCount: number;
      dailyLimit: number;
    };
    gemini: {
      apiKey: string;
      usageCount: number;
      dailyLimit: number;
    };
    backupAi1: {
      provider: string; // GroqCloud
      apiKey: string;
      usageCount: number;
      dailyLimit: number;
      model: string; // llama3-8b-8192
    };
  };
  
  // Platform APIs
  hashnode: {
    token: string;
    publicationId?: string;
  };
  devTo: {
    apiKey: string;
  };
  twitter: {
    apiKey: string;
    apiKeySecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken: string;
  };
  linkedin: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    personId: string; // Added missing personId
  };
  instagram: {
    accessToken: string;
    userId: string;
    pageId: string; // Added missing pageId
    appId: string;
    appSecret: string;
    dropboxToken: string; // Added dropbox support
    dropboxApiKey: string;
  };
  youtube: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
    dropboxToken: string; // Added dropbox support
    dropboxApiKey: string;
  };
}
