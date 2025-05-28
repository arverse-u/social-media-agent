
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentItem } from '@/types';

interface FeedTemplateProps {
  onSelect?: () => void;
  content?: ContentItem;
  platform?: 'twitter' | 'linkedin' | 'instagram';
}

const FeedTemplate = ({ onSelect, content, platform = 'twitter' }: FeedTemplateProps) => {
  // Platform-specific styling
  const getPlatformStyle = () => {
    switch (platform) {
      case 'twitter':
        return {
          bgColor: 'bg-blue-400/20',
          textColor: 'text-blue-500',
          borderColor: 'border-blue-400/40',
          name: 'Twitter/X',
          icon: '/icons/twitter.svg',
          roundedImage: 'rounded-2xl',
          layout: 'twitter-layout'
        };
      case 'linkedin':
        return {
          bgColor: 'bg-blue-700/20',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-700/40',
          name: 'LinkedIn',
          icon: '/icons/linkedin.svg',
          roundedImage: 'rounded-none',
          layout: 'linkedin-layout'
        };
      case 'instagram':
        return {
          bgColor: 'bg-pink-500/20',
          textColor: 'text-pink-500',
          borderColor: 'border-pink-500/40',
          name: 'Instagram',
          icon: '/icons/instagram.svg',
          roundedImage: 'rounded-lg',
          layout: 'instagram-layout'
        };
      default:
        return {
          bgColor: 'bg-astrum-blue/20',
          textColor: 'text-astrum-blue',
          borderColor: 'border-astrum-blue/40',
          name: 'Feed',
          icon: '',
          roundedImage: 'rounded-lg',
          layout: ''
        };
    }
  };
  
  const style = getPlatformStyle();
  
  // If we have content, display it, otherwise show template preview
  if (content) {
    return (
      <Card className="mt-4 shadow-sm overflow-hidden">
        {platform === 'twitter' && (
          <div className="p-4 border-b">
            <div className="flex items-start">
              <div className="mr-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-bold mr-1">{content.author}</div>
                  <div className="text-gray-500 text-sm">@{content.author.toLowerCase().replace(/\s/g, '_')}</div>
                  <div className="text-gray-500 text-sm mx-1">·</div>
                  <div className="text-gray-500 text-sm">{new Date(content.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">{content.content}</p>
                  {content.mediaUrls && content.mediaUrls.length > 0 && content.mediaUrls[0] && (
                    <div className="mt-3 rounded-2xl overflow-hidden border">
                      {content.mediaUrls[0].match(/\.(mp4|mov|avi|wmv)$/i) ? (
                        <video 
                          src={content.mediaUrls[0]} 
                          controls
                          className="w-full max-h-80 object-cover"
                        />
                      ) : (
                        <img 
                          src={content.mediaUrls[0]} 
                          alt={content.title}
                          className="w-full max-h-80 object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex mt-3 text-gray-500">
                    <div className="mr-5 flex items-center">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                      <span className="text-xs">24</span>
                    </div>
                    <div className="mr-5 flex items-center">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                      <span className="text-xs">17</span>
                    </div>
                    <div className="mr-5 flex items-center">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                      <span className="text-xs">98</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {platform === 'linkedin' && (
          <div className="border-b">
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" 
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{content.author}</div>
                  <div className="text-xs text-gray-500">Product Manager at Tech Company</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <svg className="h-3 w-3" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 15a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-5.5-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm mb-3">{content.content}</p>
              </div>
            </div>
            {(content.coverImage || (content.mediaUrls && content.mediaUrls.length > 0)) && (
              <div className="border-t overflow-hidden">
                <img 
                  src={content.coverImage || content.mediaUrls?.[0]} 
                  alt={content.title}
                  className="w-full object-cover max-h-80"
                />
              </div>
            )}
            <div className="p-3 flex text-gray-500 border-t">
              <div className="mr-5 flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24"><path d="M19.46 10l-1-1.73L18 10h1.46zm1.42 5.29L17 10.69 20.29 15zm-15.09.43L6.5 11l-.59 4.72zM15.38 10H8.62l-.54 4.32h7.84zM3.12 10.53L6.5 15l.58-4.67-3.96.2zm8.38 9.47l-1.84-1.84.84-.84 1 1 3.16-3.17.84.85-4 4z"></path><path d="M14.5 5.5h-5a1 1 0 00-.78.38l-2.09 2.77A1.15 1.15 0 007 9.5h10a1.15 1.15 0 00.36-.85L15.28 5.88a1 1 0 00-.78-.38z"></path></svg>
                <span className="text-xs">Like</span>
              </div>
              <div className="mr-5 flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24"><path d="M7 9h10v1H7zm0 4h7v-1H7z"></path><path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zm-1 14H4V6h16z"></path></svg>
                <span className="text-xs">Comment</span>
              </div>
              <div className="mr-5 flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24"><path d="M21 3L0 10l7.66 4.26L16 8l-6.26 8.34L14 24l7-21z"></path></svg>
                <span className="text-xs">Share</span>
              </div>
            </div>
          </div>
        )}
        
        {platform === 'instagram' && (
          <div>
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-pink-100 border-2 border-pink-500 flex items-center justify-center overflow-hidden mr-2">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" 
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="font-semibold text-sm">{content.author}</div>
              </div>
              <div>
                <svg className="h-5 w-5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="1.5"></circle><circle cx="12.5" cy="8" r="1.5"></circle><circle cx="3.5" cy="8" r="1.5"></circle></svg>
              </div>
            </div>
            
            {content.mediaUrls && content.mediaUrls.length > 0 && content.mediaUrls[0] ? (
              <div className="aspect-square w-full overflow-hidden bg-black">
                {content.mediaUrls[0].match(/\.(mp4|mov|avi|wmv)$/i) ? (
                  <video 
                    src={content.mediaUrls[0]} 
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={content.mediaUrls[0]} 
                    alt={content.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-square w-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400">No media available</div>
              </div>
            )}
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path></svg>
                  <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z"></path></svg>
                  <svg className="h-6 w-6" viewBox="0 0 24 24"><polygon points="22 3 9.218 10.083 11.698 12.556 14.989 9.331 12.916 13.465 12.916 13.465 12.916 13.465 16.5 18 22 3"></polygon><polygon points="2.968 8.833 0 3 9 10"></polygon></svg>
                </div>
                <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M20 22a.999.999 0 01-.687-.273L12 14.815l-7.313 6.912A1 1 0 013 21V3a1 1 0 011-1h16a1 1 0 011 1v18a1 1 0 01-1 1z"></path></svg>
              </div>
              <div className="font-semibold text-sm mb-1">203 likes</div>
              <div className="text-sm">
                <span className="font-semibold mr-1">{content.author}</span>
                {content.content}
              </div>
              {content.tags && content.tags.length > 0 && (
                <div className="text-blue-500 text-sm mt-1">
                  {content.tags.map(tag => `#${tag}`).join(' ')}
                </div>
              )}
              <div className="text-gray-400 text-xs mt-2">
                View all 24 comments
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }
  
  // Platform-specific template display
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{style.name} Post Template</CardTitle>
            <CardDescription>Optimized for {style.name}</CardDescription>
          </div>
          <Badge variant="outline" className={`${style.bgColor} ${style.textColor} ${style.borderColor}`}>
            {platform}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            A template designed to maximize engagement on {style.name} with:
          </p>
          <ul className="text-sm list-disc list-inside text-muted-foreground pl-2">
            {platform === 'twitter' && (
              <>
                <li>Attention-grabbing short format</li>
                <li>Optimized hashtag placement</li>
                <li>Thread structure options</li>
                <li>Image attachment options</li>
              </>
            )}
            {platform === 'linkedin' && (
              <>
                <li>Professional tone templates</li>
                <li>Career-focused content structures</li>
                <li>Industry-specific formats</li>
                <li>Document and article attachments</li>
              </>
            )}
            {platform === 'instagram' && (
              <>
                <li>Visual-first post structure</li>
                <li>Caption optimization</li>
                <li>Carousel post options</li>
                <li>Story and reel integration</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
          onClick={onSelect}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedTemplate;
