import { Platform, PlatformConfig, ContentItem, PublishRecord } from '@/types';

// Mock database using localStorage
const STORAGE_PREFIX = 'astrumverse_';

// Initial platform data
const initialPlatforms: Platform[] = [
  {
    id: 'hashnode',
    name: 'Hashnode',
    icon: 'globe',
    color: '#2962FF',
    enabled: true,
    isConfigured: false,
    category: 'blog'
  },
  {
    id: 'devTo',
    name: 'Dev.to',
    icon: 'code',
    color: '#000000',
    enabled: true,
    isConfigured: false,
    category: 'blog'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'twitter',
    color: '#1DA1F2',
    enabled: true,
    isConfigured: false,
    category: 'feed'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    enabled: true,
    isConfigured: false,
    category: 'feed'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    enabled: true,
    isConfigured: false,
    category: 'feed'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    enabled: true,
    isConfigured: false,
    category: 'reel'
  }
];

// Initial platform configs
const initialPlatformConfigs: PlatformConfig[] = initialPlatforms.map(platform => ({
  platform: platform.id,
  autoPublish: false,
  defaultTags: [],
  useAuthorName: true,
  canonicalLink: true,
  publishDelay: 0,
  retryOnFail: true,
  maxRetries: 3
}));

// Mock data functions
export const getPlatforms = (): Platform[] => {
  const storedPlatforms = localStorage.getItem(STORAGE_PREFIX + 'platforms');
  return storedPlatforms ? JSON.parse(storedPlatforms) : initialPlatforms;
};

export const updatePlatform = (platform: Platform): void => {
  const platforms = getPlatforms();
  const updatedPlatforms = platforms.map(p => p.id === platform.id ? platform : p);
  localStorage.setItem(STORAGE_PREFIX + 'platforms', JSON.stringify(updatedPlatforms));
};

export const getPlatformConfig = (platformId: Platform['id']): PlatformConfig | null => {
  const storedConfigs = localStorage.getItem(STORAGE_PREFIX + 'platform_configs');
  const configs = storedConfigs ? JSON.parse(storedConfigs) : initialPlatformConfigs;
  return configs.find((config: PlatformConfig) => config.platform === platformId) || null;
};

export const updatePlatformConfig = (config: PlatformConfig): void => {
  const storedConfigs = localStorage.getItem(STORAGE_PREFIX + 'platform_configs');
  const configs = storedConfigs ? JSON.parse(storedConfigs) : initialPlatformConfigs;
  
  const updatedConfigs = configs.map((c: PlatformConfig) => 
    c.platform === config.platform ? config : c
  );
  
  localStorage.setItem(STORAGE_PREFIX + 'platform_configs', JSON.stringify(updatedConfigs));
};

// Content storage functions
export const getContentItems = (): ContentItem[] => {
  const storedItems = localStorage.getItem(STORAGE_PREFIX + 'content_items');
  const items = storedItems ? JSON.parse(storedItems) : [];
  
  // Ensure all items have a category field and updated category names
  return items.map((item: any) => {
    let updatedItem = { ...item };
    
    // Default category to contentType if not present
    if (!updatedItem.category) {
      updatedItem.category = updatedItem.contentType;
    }
    
    // Update old category names to new ones
    if (updatedItem.category === 'article') {
      updatedItem.category = 'blog';
    }
    if (updatedItem.contentType === 'article') {
      updatedItem.contentType = 'blog';
    }
    if (updatedItem.category === 'video') {
      updatedItem.category = 'reel';
    }
    if (updatedItem.contentType === 'video') {
      updatedItem.contentType = 'reel';
    }
    
    return updatedItem as ContentItem;
  });
};

// Export getContent as an alias for getContentItems for backward compatibility
export const getContent = getContentItems;

export const getContentItemById = (id: string): ContentItem | null => {
  const items = getContentItems();
  return items.find(item => item.id === id) || null;
};

export const addContentItem = (item: ContentItem): void => {
  const items = getContentItems();
  items.push(item);
  localStorage.setItem(STORAGE_PREFIX + 'content_items', JSON.stringify(items));
};

export const updateContentItem = (item: ContentItem): void => {
  const items = getContentItems();
  const updatedItems = items.map(i => i.id === item.id ? item : i);
  localStorage.setItem(STORAGE_PREFIX + 'content_items', JSON.stringify(updatedItems));
};

export const deleteContentItem = (id: string): void => {
  const items = getContentItems();
  const updatedItems = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_PREFIX + 'content_items', JSON.stringify(updatedItems));
};

// Publish records
export const getPublishRecords = (contentId?: string): PublishRecord[] => {
  const storedRecords = localStorage.getItem(STORAGE_PREFIX + 'publish_records');
  const records = storedRecords ? JSON.parse(storedRecords) : [];
  
  if (contentId) {
    return records.filter((record: PublishRecord) => record.contentId === contentId);
  }
  
  return records;
};

export const addPublishRecord = (record: PublishRecord): void => {
  const records = getPublishRecords();
  records.push(record);
  localStorage.setItem(STORAGE_PREFIX + 'publish_records', JSON.stringify(records));
};

export const updatePublishRecord = (record: PublishRecord): void => {
  const records = getPublishRecords();
  const updatedRecords = records.map((r: PublishRecord) => r.id === record.id ? record : r);
  localStorage.setItem(STORAGE_PREFIX + 'publish_records', JSON.stringify(updatedRecords));
};

export const deletePublishRecords = (contentId: string): void => {
  const records = getPublishRecords();
  const updatedRecords = records.filter((r: PublishRecord) => r.contentId !== contentId);
  localStorage.setItem(STORAGE_PREFIX + 'publish_records', JSON.stringify(updatedRecords));
};

// Initialize platform data if not already present
export const initializeDatabase = (): void => {
  const storedPlatforms = localStorage.getItem(STORAGE_PREFIX + 'platforms');
  if (!storedPlatforms) {
    localStorage.setItem(STORAGE_PREFIX + 'platforms', JSON.stringify(initialPlatforms));
  }
  
  const storedConfigs = localStorage.getItem(STORAGE_PREFIX + 'platform_configs');
  if (!storedConfigs) {
    localStorage.setItem(STORAGE_PREFIX + 'platform_configs', JSON.stringify(initialPlatformConfigs));
  }
};

// Call initialization on import
initializeDatabase();
