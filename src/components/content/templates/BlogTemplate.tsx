
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentItem } from '@/types';
import { ThumbsUp, MessageSquare, BookmarkPlus, Share2 } from 'lucide-react';

interface BlogTemplateProps {
  onSelect?: () => void;
  content?: ContentItem;
  platform?: 'hashnode' | 'devTo';
}

const BlogTemplate = ({ onSelect, content, platform = 'hashnode' }: BlogTemplateProps) => {
  // If we have content, display it, otherwise show template preview
  if (content) {
    return (
      <Card className="mt-4 shadow-sm overflow-auto max-h-[800px]">
        {platform === 'hashnode' ? (
          <div>
            {/* Hashnode style blog */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 relative">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden mr-3">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hashnode" 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{content.author}</div>
                    <div className="text-xs text-blue-100">Published on {new Date(content.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
                <p className="text-blue-50">{content.excerpt}</p>
                
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {content.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-white/20 text-white border-white/40 hover:bg-white/30">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {content.coverImage && (
              <div className="w-full">
                <img 
                  src={content.coverImage} 
                  alt={content.title}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}
            
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
              <article className="prose max-w-none">
                {content.content.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i} className="mb-4">{paragraph}</p> : null
                ))}
              </article>
              
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2" />
                    <span>124 likes</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    <span>24 comments</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Button variant="ghost" className="flex items-center">
                    <BookmarkPlus className="h-5 w-5 mr-2" />
                    <span>Bookmark</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Dev.to style blog */}
            <CardHeader className="bg-white dark:bg-gray-800 border-b">
              <div className="mb-4">
                {content.coverImage && (
                  <div className="w-full -mt-6 -mx-6 mb-6">
                    <img 
                      src={content.coverImage} 
                      alt={content.title}
                      className="w-full h-auto object-cover max-h-96"
                    />
                  </div>
                )}
                
                <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.tags && content.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=DevTo" 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{content.author}</div>
                    <div className="text-xs text-gray-500">Posted on {new Date(content.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {content.excerpt && (
                <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6 italic text-gray-600 dark:text-gray-300">
                  {content.excerpt}
                </div>
              )}
              
              <article className="prose max-w-none dark:prose-invert">
                {content.content.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i} className="mb-4">{paragraph}</p> : null
                ))}
              </article>
              
              <div className="mt-8 pt-6 border-t flex flex-wrap items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2 mr-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>65 reactions</span>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Add comment</span>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    );
  }
  
  // Platform-specific preview for template selection
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{platform === 'devTo' ? 'Dev.to' : 'Hashnode'} Blog Template</CardTitle>
            <CardDescription>Technical article optimized for {platform === 'devTo' ? 'Dev.to' : 'Hashnode'}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40">
            Blog
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Pre-structured technical blog template with sections for:
          </p>
          <ul className="text-sm list-disc list-inside text-muted-foreground pl-2">
            <li>Introduction with problem statement</li>
            <li>Prerequisites and setup guide</li>
            <li>Step-by-step implementation</li>
            <li>Code snippets with explanation</li>
            {platform === 'hashnode' && <li>Hashnode-specific formatting options</li>}
            {platform === 'devTo' && <li>Dev.to community engagement elements</li>}
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

export default BlogTemplate;
