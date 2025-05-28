
import { loadApiKeys } from '@/config/apiKeys';

interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video';
  url: string;
  uploadedAt: string;
  platform: string;
  status: 'uploaded' | 'processed' | 'published';
}

export class MediaBufferService {
  private mediaItems: MediaItem[] = [];

  constructor() {
    this.loadMediaFromStorage();
  }

  private loadMediaFromStorage(): void {
    const stored = localStorage.getItem('media_buffer');
    if (stored) {
      this.mediaItems = JSON.parse(stored);
    }
  }

  private saveMediaToStorage(): void {
    localStorage.setItem('media_buffer', JSON.stringify(this.mediaItems));
  }

  async uploadToDropbox(file: File, platform: string): Promise<MediaItem | null> {
    const keys = loadApiKeys();
    
    if (!keys.youtube?.dropboxToken) {
      throw new Error('Dropbox token not configured');
    }

    try {
      // Upload file to Dropbox
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.youtube.dropboxToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `/${file.name}`,
            mode: 'add',
            autorename: true
          }),
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Dropbox upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Create shared link
      const linkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.youtube.dropboxToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: data.path_display,
          settings: {
            requested_visibility: 'public'
          }
        }),
      });

      let publicUrl = '';
      if (linkResponse.ok) {
        const linkData = await linkResponse.json();
        publicUrl = linkData.url.replace('?dl=0', '?raw=1'); // Direct download link
      }

      const mediaItem: MediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: data.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
        platform: platform,
        status: 'uploaded'
      };

      this.mediaItems.push(mediaItem);
      this.saveMediaToStorage();

      return mediaItem;
    } catch (error) {
      console.error('Error uploading to Dropbox:', error);
      return null;
    }
  }

  getMediaItems(platform?: string): MediaItem[] {
    if (platform) {
      return this.mediaItems.filter(item => item.platform === platform);
    }
    return this.mediaItems;
  }

  getMediaById(id: string): MediaItem | undefined {
    return this.mediaItems.find(item => item.id === id);
  }

  updateMediaStatus(id: string, status: MediaItem['status']): void {
    const item = this.mediaItems.find(media => media.id === id);
    if (item) {
      item.status = status;
      this.saveMediaToStorage();
    }
  }

  deleteMedia(id: string): void {
    this.mediaItems = this.mediaItems.filter(item => item.id !== id);
    this.saveMediaToStorage();
  }

  async deleteFromDropbox(filename: string): Promise<boolean> {
    const keys = loadApiKeys();
    
    if (!keys.youtube?.dropboxToken) {
      return false;
    }

    try {
      const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.youtube.dropboxToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/${filename}`
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting from Dropbox:', error);
      return false;
    }
  }

  getBufferStats(): { total: number; byPlatform: Record<string, number>; byType: Record<string, number> } {
    const byPlatform: Record<string, number> = {};
    const byType: Record<string, number> = {};

    this.mediaItems.forEach(item => {
      byPlatform[item.platform] = (byPlatform[item.platform] || 0) + 1;
      byType[item.type] = (byType[item.type] || 0) + 1;
    });

    return {
      total: this.mediaItems.length,
      byPlatform,
      byType
    };
  }

  // New functions that were missing
  getAvailableMedia(type?: 'image' | 'video'): MediaItem[] {
    return this.mediaItems.filter(item => 
      item.status === 'uploaded' && (!type || item.type === type)
    );
  }

  markMediaAsUsed(id: string): void {
    this.updateMediaStatus(id, 'processed');
  }
}

export const mediaBufferService = new MediaBufferService();

// Export the missing functions
export const getAvailableMedia = (type?: 'image' | 'video') => mediaBufferService.getAvailableMedia(type);
export const markMediaAsUsed = (id: string) => mediaBufferService.markMediaAsUsed(id);
