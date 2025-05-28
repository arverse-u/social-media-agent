
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Platform } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

interface PlatformCardProps {
  platform: Platform;
  onClick: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, onClick }) => {
  const platformIcons: Record<string, JSX.Element> = {
    hashnode: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 0L1.815 6v12L12 24l10.185-6V6L12 0zm6 16.5l-6 3.5-6-3.5v-9l6-3.5 6 3.5v9z" />
      </svg>
    ),
    devTo: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };

  const getBadgeColors = (category: string) => {
    switch (category) {
      case 'blog':
        return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/40';
      case 'feed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/40';
      case 'reel':
        return 'bg-red-500/20 text-red-500 border-red-500/40';
      default:
        return 'bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40';
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
            >
              {platformIcons[platform.id] || null}
            </div>
            <div>
              <h3 className="text-lg font-medium">{platform.name}</h3>
              <Badge variant="outline" className={getBadgeColors(platform.category)}>
                {platform.category === 'blog' ? 'Article' : platform.category === 'feed' ? 'Social Post' : 'Video'}
              </Badge>
            </div>
          </div>
          {platform.isConfigured ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              <Check className="h-3 w-3 mr-1" /> Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              <AlertCircle className="h-3 w-3 mr-1" /> Setup Required
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-4">
          {platform.id === 'hashnode' && 'Create technical blogs optimized for the Hashnode platform.'}
          {platform.id === 'devTo' && 'Publish articles for the Dev.to community with proper formatting.'}
          {platform.id === 'twitter' && 'Compose tweets/posts for Twitter/X with options for threads.'}
          {platform.id === 'linkedin' && 'Create professional content for your LinkedIn audience.'}
          {platform.id === 'instagram' && 'Design visual posts with optimized captions for Instagram.'}
          {platform.id === 'youtube' && 'Create video content with descriptions and metadata for YouTube.'}
        </p>
      </CardContent>
      <CardFooter className="pt-2 border-t border-border/30 p-6">
        <Button
          onClick={onClick}
          className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
          disabled={!platform.isConfigured}
        >
          Create Content
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlatformCard;
