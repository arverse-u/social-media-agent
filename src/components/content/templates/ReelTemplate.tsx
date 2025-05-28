
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentItem } from '@/types';
import { Upload, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

interface ReelTemplateProps {
  onSelect?: () => void;
  content?: ContentItem;
  platform?: 'youtube';
}

const ReelTemplate = ({ onSelect, content, platform = 'youtube' }: ReelTemplateProps) => {
  // If we have content, display it, otherwise show template preview
  if (content) {
    return (
      <Card className="mt-4 shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          {/* YouTube-like interface */}
          <div className="w-full">
            {/* Video container */}
            <div className="aspect-video bg-black w-full flex items-center justify-center">
              {content.mediaUrls && content.mediaUrls.length > 0 && content.mediaUrls[0] ? (
                <video 
                  src={content.mediaUrls[0]}
                  controls
                  className="w-full h-full"
                  poster={content.coverImage}
                />
              ) : content.coverImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={content.coverImage} 
                    alt={content.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full">
                      Video preview
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white p-4">
                  <Upload className="w-12 h-12 mb-2" />
                  <div className="text-sm">Upload video or thumbnail</div>
                </div>
              )}
            </div>
            
            {/* Video details */}
            <div className="p-4">
              <h2 className="font-bold text-lg">{content.title}</h2>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden mr-3">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=YouTuber" 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{content.author}</div>
                    <div className="text-xs text-gray-500">24.5K subscribers</div>
                  </div>
                </div>
                
                <Button className="bg-red-600 hover:bg-red-700 rounded-full">Subscribe</Button>
              </div>
              
              {/* Engagement buttons */}
              <div className="flex gap-3 mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">26K</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 transform rotate-180" />
                  <span className="text-sm">Dislike</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>12.5K views</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mb-2">{content.excerpt}</p>
                  <p className="text-sm mb-2 whitespace-pre-line">{content.content}</p>
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {content.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs bg-gray-200 dark:bg-gray-700">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Comments section preview */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">532 Comments</span>
                </div>
                
                <div className="flex items-start mt-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Commenter" 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                      <div className="flex items-center">
                        <span className="font-semibold text-xs mr-2">Viewer</span>
                        <span className="text-xs text-gray-500">3 days ago</span>
                      </div>
                      <p className="text-xs mt-1">Great content! I learned a lot from this video.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>YouTube Video Template</CardTitle>
            <CardDescription>Educational video content</CardDescription>
          </div>
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/40">
            YouTube
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Structure for creating engaging educational videos:
          </p>
          <ul className="text-sm list-disc list-inside text-muted-foreground pl-2">
            <li>Attention-grabbing intro</li>
            <li>Clear topic outline</li>
            <li>Step-by-step demonstration</li>
            <li>SEO-optimized title and description</li>
            <li>Category and tag recommendations</li>
            <li>Thumbnail design template</li>
            <li>Audience retention strategies</li>
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

export default ReelTemplate;
