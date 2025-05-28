
import { ContentItem } from '@/types';
import { ApiResponse } from '@/types';

interface CSVVideoData {
  videofilename: string;
  videotype: string;
  content: string;
}

class CSVVideoProcessor {
  private videoQueue: CSVVideoData[] = [];
  private processedVideos: string[] = [];

  loadCSVData(csvContent: string): void {
    // Parse CSV content
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have header and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['videofilename', 'videotype', 'content'];
    
    // Validate headers
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required column: ${required}`);
      }
    }

    // Parse data rows
    this.videoQueue = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3) {
        const videoData: CSVVideoData = {
          videofilename: values[headers.indexOf('videofilename')],
          videotype: values[headers.indexOf('videotype')],
          content: values[headers.indexOf('content')]
        };
        this.videoQueue.push(videoData);
      }
    }

    console.log(`Loaded ${this.videoQueue.length} videos from CSV`);
  }

  async getNextVideoForProcessing(platform: 'instagram' | 'youtube'): Promise<ApiResponse<ContentItem | null>> {
    if (this.videoQueue.length === 0) {
      return {
        success: true,
        data: null
      };
    }

    const videoData = this.videoQueue[0];
    
    try {
      // Create ContentItem from video data
      const contentItem: ContentItem = {
        id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${videoData.videotype} Video - ${videoData.videofilename}`,
        content: videoData.content,
        excerpt: videoData.content.substring(0, 200),
        author: 'Video Creator',
        tags: [videoData.videotype, platform],
        coverImage: '',
        sourceUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishStatus: 'draft' as const,
        contentType: 'reel' as const,
        category: 'reel' as const,
        mediaUrls: [videoData.videofilename] // Store filename for Dropbox fetching
      };

      return {
        success: true,
        data: contentItem
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process video'
      };
    }
  }

  markVideoAsProcessed(): void {
    if (this.videoQueue.length > 0) {
      const processed = this.videoQueue.shift();
      if (processed) {
        this.processedVideos.push(processed.videofilename);
        console.log(`Marked video as processed: ${processed.videofilename}`);
      }
    }
  }

  getRemainingCount(): number {
    return this.videoQueue.length;
  }

  getTotalCount(): number {
    return this.videoQueue.length + this.processedVideos.length;
  }

  getProcessedCount(): number {
    return this.processedVideos.length;
  }

  reset(): void {
    this.videoQueue = [];
    this.processedVideos = [];
  }
}

export const csvVideoProcessor = new CSVVideoProcessor();
