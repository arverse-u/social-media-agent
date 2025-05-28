
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentItem } from '@/types';
import { getContentItemById, updateContentItem } from '@/services/databaseService';
import BlogTemplate from './templates/BlogTemplate';
import FeedTemplate from './templates/FeedTemplate';
import ReelTemplate from './templates/ReelTemplate';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ContentDetailProps {
  contentId: string | undefined;
}

const ContentDetail: React.FC<ContentDetailProps> = ({ contentId }) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (contentId) {
      const contentItem = getContentItemById(contentId);
      setContent(contentItem);
    }
  }, [contentId]);

  // Define the schema with proper types
  const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
    excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters long" }),
    content: z.string().min(20, { message: "Content must be at least 20 characters long" }),
    // Define tags as a string that will be transformed to a string array
    tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(Boolean)),
  });

  // Define the form values type explicitly for react-hook-form
  type FormValues = {
    title: string;
    excerpt: string;
    content: string;
    tags: string; // Keep as string in the form
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: content?.title || '',
      excerpt: content?.excerpt || '',
      content: content?.content || '',
      // Convert string array to comma-separated string for form input
      tags: content?.tags ? content.tags.join(', ') : '',
    },
  });

  useEffect(() => {
    if (content) {
      form.reset({
        title: content.title,
        excerpt: content.excerpt,
        content: content.content,
        // Convert string array to comma-separated string for form input
        tags: content.tags ? content.tags.join(', ') : '',
      });
    }
  }, [content, form]);

  // Fix the type mismatch by explicitly handling the Zod transformation
  const onSubmit = (data: FormValues) => {
    if (content) {
      // Convert the comma-separated string to array manually
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const updatedContent = {
        ...content,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags: tagsArray,
        updatedAt: new Date().toISOString(),
      };

      updateContentItem(updatedContent);
      setContent(updatedContent);

      toast({
        title: "Content updated",
        description: "Your content has been successfully updated.",
      });
    }
  };

  if (!content) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate('/content')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Content
        </Button>
        <Card>
          <CardContent className="p-6">
            <p>Content not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/content')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Content
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea rows={12} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-astrum-purple hover:bg-astrum-purple/80">
                      Update Content
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Content Preview</h3>
          {content.category === 'blog' && <BlogTemplate content={content} />}
          {content.category === 'feed' && <FeedTemplate content={content} />}
          {content.category === 'reel' && <ReelTemplate content={content} />}
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
