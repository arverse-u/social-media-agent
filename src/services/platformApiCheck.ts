
import { loadApiKeys } from '@/config/apiKeys';
import { Platform } from '@/types';

export function checkPlatformApiKeys(platformId: Platform['id']): boolean {
  const keys = loadApiKeys();
  
  switch (platformId) {
    case 'hashnode':
      return !!(keys.hashnode?.token);
    
    case 'devTo':
      return !!(keys.devTo?.apiKey);
    
    case 'twitter':
      return !!(keys.twitter?.bearerToken && keys.twitter?.apiKey && keys.twitter?.apiKeySecret);
    
    case 'linkedin':
      return !!(keys.linkedin?.accessToken && keys.linkedin?.clientId);
    
    case 'instagram':
      return !!(keys.instagram?.accessToken && keys.instagram?.appId);
    
    case 'youtube':
      return !!(keys.youtube?.accessToken && keys.youtube?.clientId);
    
    default:
      return false;
  }
}

export function getPlatformApiStatus(): Record<string, boolean> {
  return {
    hashnode: checkPlatformApiKeys('hashnode'),
    devTo: checkPlatformApiKeys('devTo'),
    twitter: checkPlatformApiKeys('twitter'),
    linkedin: checkPlatformApiKeys('linkedin'),
    instagram: checkPlatformApiKeys('instagram'),
    youtube: checkPlatformApiKeys('youtube'),
  };
}
