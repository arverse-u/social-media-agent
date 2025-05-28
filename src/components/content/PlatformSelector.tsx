
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatforms } from '@/services/databaseService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Platform } from '@/types';

interface PlatformSelectorProps {
  onSelect: (platform: Platform['id']) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onSelect }) => {
  const platforms = getPlatforms();
  
  const blogPlatforms = platforms.filter(p => p.category === 'blog' && p.enabled);
  const feedPlatforms = platforms.filter(p => p.category === 'feed' && p.enabled);
  const reelPlatforms = platforms.filter(p => p.category === 'reel' && p.enabled);

  // Helper function to get platform badge color
  const getPlatformBadgeStyle = (platform: Platform) => {
    switch (platform.id) {
      case 'hashnode':
        return 'bg-blue-600/20 text-blue-600 border-blue-600/40';
      case 'devTo':
        return 'bg-black/20 text-gray-800 border-black/40';
      case 'twitter':
        return 'bg-blue-400/20 text-blue-500 border-blue-400/40';
      case 'linkedin':
        return 'bg-blue-700/20 text-blue-700 border-blue-700/40';
      case 'instagram':
        return 'bg-pink-500/20 text-pink-500 border-pink-500/40';
      case 'youtube':
        return 'bg-red-500/20 text-red-500 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/40';
    }
  };
  
  // Check if a platform is configured
  const isPlatformConfigured = (platform: Platform) => {
    return platform.isConfigured;
  };

  return (
    <div className="space-y-8">
      {/* Blog Platforms */}
      {blogPlatforms.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Blog Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPlatforms.map((platform) => (
              <Card key={platform.id} className={`transition-shadow hover:shadow-md ${!isPlatformConfigured(platform) ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{platform.name}</CardTitle>
                    <Badge variant="outline" className={getPlatformBadgeStyle(platform)}>
                      Blog
                    </Badge>
                  </div>
                  <CardDescription>
                    {isPlatformConfigured(platform) 
                      ? 'Ready to publish' 
                      : 'Platform not configured'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground">
                    {platform.id === 'hashnode' ? 
                      'Technical blog platform focused on developer content.' : 
                      'Community-driven platform for developers to share articles.'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
                    onClick={() => onSelect(platform.id)}
                    disabled={!isPlatformConfigured(platform)}
                  >
                    {isPlatformConfigured(platform) ? 'Select Platform' : 'Configure in Settings First'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Social Media Platforms */}
      {feedPlatforms.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Social Media Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedPlatforms.map((platform) => (
              <Card key={platform.id} className={`transition-shadow hover:shadow-md ${!isPlatformConfigured(platform) ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{platform.name}</CardTitle>
                    <Badge variant="outline" className={getPlatformBadgeStyle(platform)}>
                      Feed
                    </Badge>
                  </div>
                  <CardDescription>
                    {isPlatformConfigured(platform) 
                      ? 'Ready to publish' 
                      : 'Platform not configured'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground">
                    {platform.id === 'twitter' && 'Short-form text and media sharing platform.'}
                    {platform.id === 'linkedin' && 'Professional networking and content platform.'}
                    {platform.id === 'instagram' && 'Visual-focused social media platform.'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
                    onClick={() => onSelect(platform.id)}
                    disabled={!isPlatformConfigured(platform)}
                  >
                    {isPlatformConfigured(platform) ? 'Select Platform' : 'Configure in Settings First'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Video Platforms */}
      {reelPlatforms.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Video Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reelPlatforms.map((platform) => (
              <Card key={platform.id} className={`transition-shadow hover:shadow-md ${!isPlatformConfigured(platform) ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{platform.name}</CardTitle>
                    <Badge variant="outline" className={getPlatformBadgeStyle(platform)}>
                      Video
                    </Badge>
                  </div>
                  <CardDescription>
                    {isPlatformConfigured(platform) 
                      ? 'Ready to publish' 
                      : 'Platform not configured'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground">
                    Video hosting and sharing platform for creators.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
                    onClick={() => onSelect(platform.id)}
                    disabled={!isPlatformConfigured(platform)}
                  >
                    {isPlatformConfigured(platform) ? 'Select Platform' : 'Configure in Settings First'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
