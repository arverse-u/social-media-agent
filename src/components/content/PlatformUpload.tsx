
import React, { useState } from 'react';
import { ContentItem, Platform } from '@/types';
import { addContentItem } from '@/services/databaseService';
import { useToast } from '@/components/ui/use-toast';
import PlatformCard from './PlatformCard';
import PlatformTemplateForm from './PlatformTemplateForm';

const platforms: Platform[] = [
  {
    id: 'hashnode',
    name: 'Hashnode',
    icon: '/icons/hashnode.svg',
    color: '#2962FF',
    enabled: true,
    isConfigured: true,
    category: 'blog'
  },
  {
    id: 'devTo',
    name: 'Dev.to',
    icon: '/icons/devto.svg',
    color: '#0A0A0A',
    enabled: true,
    isConfigured: true,
    category: 'blog'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '/icons/twitter.svg',
    color: '#1DA1F2',
    enabled: true,
    isConfigured: true, // Always enabled for content creation
    category: 'feed'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    color: '#0A66C2',
    enabled: true,
    isConfigured: true,
    category: 'feed'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '/icons/instagram.svg',
    color: '#E4405F',
    enabled: true,
    isConfigured: true, // Always enabled for content creation
    category: 'feed'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '/icons/youtube.svg',
    color: '#FF0000',
    enabled: true,
    isConfigured: true,
    category: 'reel'
  }
];

const PlatformUpload: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform['id'] | null>(null);
  const { toast } = useToast();
  
  const handleSelectPlatform = (platformId: Platform['id']) => {
    setSelectedPlatform(platformId);
  };
  
  const handleBack = () => {
    setSelectedPlatform(null);
  };
  
  const handleCreateContent = (data: any, publishAction: 'draft' | 'publish' | 'schedule') => {
    if (!selectedPlatform) return;
    
    // Map platform to content category
    const categoryMap: Record<string, 'blog' | 'feed' | 'reel'> = {
      hashnode: 'blog',
      devTo: 'blog',
      twitter: 'feed',
      linkedin: 'feed',
      instagram: 'feed',
      youtube: 'reel'
    };
    
    // Generate a new content ID
    const id = `content-${Date.now()}`;
    
    // Map publish action to content status
    let publishStatus: ContentItem['publishStatus'] = 'draft';
    if (publishAction === 'publish') {
      publishStatus = 'published';
    } else if (publishAction === 'schedule' && data.scheduledDate) {
      publishStatus = 'scheduled';
    }
    
    // Handle tags
    const tags = Array.isArray(data.tags) 
      ? data.tags 
      : typeof data.tags === 'string' 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) 
        : [];
    
    // Create a new content item
    const newContent: ContentItem = {
      id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: 'Default User',
      tags,
      coverImage: data.coverImage || '',
      sourceUrl: data.canonicalUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus,
      scheduledDate: data.scheduledDate ? `${data.scheduledDate}T${data.scheduledTime || '00:00'}` : undefined,
      contentType: categoryMap[selectedPlatform],
      category: categoryMap[selectedPlatform],
      mediaUrls: data.mediaUrls ? (Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls]) : [],
    };
    
    // Add the content to the database
    addContentItem(newContent);
    
    // Show success toast
    toast({
      title: publishStatus === 'draft' ? 'Draft saved' : publishStatus === 'scheduled' ? 'Content scheduled' : 'Content published',
      description: publishStatus === 'draft' ? 'Your content has been saved as a draft' : 
                  publishStatus === 'scheduled' ? `Your content has been scheduled for ${new Date(data.scheduledDate).toLocaleString()}` : 
                  'Your content has been published successfully',
    });
    
    // Reset platform selection
    setSelectedPlatform(null);
  };
  
  if (selectedPlatform) {
    const platform = platforms.find(p => p.id === selectedPlatform);
    
    if (!platform) {
      return <div>Platform not found</div>;
    }
    
    return (
      <PlatformTemplateForm 
        platform={platform} 
        onSubmit={handleCreateContent}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Select a Platform</h2>
        <p className="text-muted-foreground mb-6">
          Choose a platform to create content for. Each platform has its own specialized template.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <PlatformCard 
            key={platform.id}
            platform={platform}
            onClick={() => handleSelectPlatform(platform.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlatformUpload;
