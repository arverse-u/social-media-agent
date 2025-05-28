
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContentItem } from '@/types';
import { addContentItem } from '@/services/databaseService';
import { toast } from '@/components/ui/use-toast';
import BlogTemplate from './templates/BlogTemplate';
import FeedTemplate from './templates/FeedTemplate';
import ReelTemplate from './templates/ReelTemplate';

interface NewContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewContentDialog = ({ open, onOpenChange }: NewContentDialogProps) => {
  const [contentType, setContentType] = useState<'blog' | 'feed' | 'reel'>('blog');
  const navigate = useNavigate();

  // Define helper for creating content
  const createContent = (type: 'blog' | 'feed' | 'reel', template?: string) => {
    // Generate a new content ID
    const id = `content-${Date.now()}`;
    
    // Create title based on content type
    let title = `New ${type}`;
    let content = '';
    let excerpt = '';
    let tags: string[] = [];
    
    // Add template-specific content if template is provided
    if (template) {
      if (type === 'blog' && template === 'technical') {
        title = 'New Technical Blog Post';
        content = '# Introduction\n\n## Prerequisites\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Testing\n\n## Conclusion';
        excerpt = 'A technical tutorial covering step-by-step implementation';
        tags = ['tutorial', 'technical', 'guide'];
      } else if (type === 'feed' && template === 'engagement') {
        title = 'New Engagement Post';
        content = '🔥 Exciting news!\n\n[Your main point here]\n\nWhy this matters:\n- Point 1\n- Point 2\n- Point 3\n\nWhat do you think? Let me know in the comments!\n\n#tech #news #trending';
        excerpt = 'Social media post designed for maximum engagement';
        tags = ['social', 'engagement', 'trending'];
      } else if (type === 'reel' && template === 'tutorial') {
        title = 'New Tutorial Reel';
        content = '[HOOK - 3 SECONDS]\nDid you know you can do X in just 30 seconds?\n\n[PROBLEM]\nMany people struggle with...\n\n[SOLUTION]\nHere\'s how to do it step by step:\n\n[STEPS]\n1.\n2.\n3.\n\n[CONCLUSION]\nNow you can easily do X without wasting time!\n\n[CTA]\nFollow for more tips like this!';
        excerpt = 'Educational short-form video tutorial';
        tags = ['tutorial', 'howto', 'quicktip'];
      }
    }
    
    // Create a new content item with default values for the selected type
    const newContent: ContentItem = {
      id,
      title,
      content,
      excerpt,
      author: 'Your Name',
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus: 'draft',
      contentType: type,
      category: type,
    };
    
    // Add the content to the database
    addContentItem(newContent);
    
    // Navigate to the content detail page
    navigate(`/content/${id}`);
    
    // Show success toast
    toast({
      title: 'Content created',
      description: `New ${type} content has been created.`,
    });
    
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Choose a content type and template to get started
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="blog" value={contentType} onValueChange={(value) => setContentType(value as 'blog' | 'feed' | 'reel')}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="blog">Blog Post</TabsTrigger>
            <TabsTrigger value="feed">Social Post</TabsTrigger>
            <TabsTrigger value="reel">Video Reel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Create long-form blog content for platforms like Hashnode and Dev.to.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Blank Blog Post</CardTitle>
                        <CardDescription>Start from scratch</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40">
                        Blog
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create a completely blank blog post and add your content manually.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
                      onClick={() => createContent('blog')}
                    >
                      Start Blank
                    </Button>
                  </CardFooter>
                </Card>
                
                <BlogTemplate onSelect={() => createContent('blog', 'technical')} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="feed">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Create short-form content for social media platforms like Twitter and LinkedIn.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Blank Social Post</CardTitle>
                        <CardDescription>Start from scratch</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-astrum-blue/20 text-astrum-blue border-astrum-blue/40">
                        Feed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create a completely blank social post and add your content manually.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
                      onClick={() => createContent('feed')}
                    >
                      Start Blank
                    </Button>
                  </CardFooter>
                </Card>
                
                <FeedTemplate onSelect={() => createContent('feed', 'engagement')} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reel">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Create video reel content for platforms like YouTube and Instagram.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Blank Video Reel</CardTitle>
                        <CardDescription>Start from scratch</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-astrum-teal/20 text-astrum-teal border-astrum-teal/40">
                        Reel
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create a blank video reel entry and add your content manually.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
                      onClick={() => createContent('reel')}
                    >
                      Start Blank
                    </Button>
                  </CardFooter>
                </Card>
                
                <ReelTemplate onSelect={() => createContent('reel', 'tutorial')} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewContentDialog;
