
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Platform } from '@/types';
import { checkGrammar } from '@/services/aiGrammarService';
import { generateTags } from '@/services/aiTagService';
import { checkPlatformApiKeys } from '@/services/platformApiCheck';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  scheduledDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PlatformContentFormProps {
  platform: Platform['id'];
  onSubmit: (data: FormData, action: 'draft' | 'publish' | 'schedule') => void;
}

const PlatformContentForm: React.FC<PlatformContentFormProps> = ({ platform, onSubmit }) => {
  const [isGrammarChecking, setIsGrammarChecking] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    publishNow: false,
    schedulePost: false,
  });
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      author: 'Your Name',
      tags: [],
      coverImage: '',
      canonicalUrl: '',
      mediaUrls: [],
    },
  });

  // Check API keys on mount and platform change
  useEffect(() => {
    setApiKeysConfigured(checkPlatformApiKeys(platform));
  }, [platform]);

  const handleGrammarCheck = async () => {
    const content = form.getValues('content');
    if (!content.trim()) {
      toast({
        title: 'No content to check',
        description: 'Please enter some content first',
        variant: 'destructive'
      });
      return;
    }

    setIsGrammarChecking(true);
    try {
      const result = await checkGrammar(content);
      
      if (result.success && result.correctedText) {
        form.setValue('content', result.correctedText);
        toast({
          title: 'Grammar checked',
          description: 'Content has been improved',
        });
      } else {
        toast({
          title: 'Grammar check failed',
          description: result.error || 'Unable to check grammar',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Grammar check error',
        description: 'An error occurred while checking grammar',
        variant: 'destructive'
      });
    } finally {
      setIsGrammarChecking(false);
    }
  };

  const handleGenerateTags = async () => {
    const content = form.getValues('content');
    const title = form.getValues('title');
    const textToAnalyze = `${title} ${content}`.trim();
    
    if (!textToAnalyze) {
      toast({
        title: 'No content to analyze',
        description: 'Please enter a title and content first',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingTags(true);
    try {
      const result = await generateTags(textToAnalyze, platform);
      
      if (result.success && result.tags) {
        form.setValue('tags', result.tags);
        toast({
          title: 'Tags generated',
          description: `Generated ${result.tags.length} relevant tags`,
        });
      } else {
        toast({
          title: 'Tag generation failed',
          description: result.error || 'Unable to generate tags',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Tag generation error',
        description: 'An error occurred while generating tags',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    if (publishSettings.schedulePost && !data.scheduledDate) {
      toast({
        title: 'Schedule date required',
        description: 'Please select a date and time for scheduling',
        variant: 'destructive'
      });
      return;
    }

    let action: 'draft' | 'publish' | 'schedule' = 'draft';
    
    if (publishSettings.publishNow) {
      action = 'publish';
    } else if (publishSettings.schedulePost) {
      action = 'schedule';
    }

    onSubmit(data, action);
  };

  const getPlatformSpecificFields = () => {
    switch (platform) {
      case 'hashnode':
      case 'devTo':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                {...form.register('coverImage')}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
              <Input
                id="canonicalUrl"
                {...form.register('canonicalUrl')}
                placeholder="https://example.com/original-post"
              />
            </div>
          </>
        );
      
      case 'youtube':
      case 'instagram':
        return (
          <div className="space-y-2">
            <Label htmlFor="mediaUrls">Video/Media URLs</Label>
            <Input
              id="mediaUrls"
              placeholder="https://example.com/video.mp4"
              onChange={(e) => {
                const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
                form.setValue('mediaUrls', urls);
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...form.register('title')}
            placeholder="Enter your title"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGrammarCheck}
              disabled={isGrammarChecking}
              className="ml-auto"
            >
              {isGrammarChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Check Grammar
            </Button>
          </div>
          <Textarea
            id="content"
            {...form.register('content')}
            placeholder="Write your content here..."
            rows={8}
          />
          {form.formState.errors.content && (
            <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt (optional)</Label>
          <Textarea
            id="excerpt"
            {...form.register('excerpt')}
            placeholder="Brief description or summary"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tags">Tags</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateTags}
              disabled={isGeneratingTags}
            >
              {isGeneratingTags ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Tags
            </Button>
          </div>
          <Input
            id="tags"
            value={form.watch('tags').join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
              form.setValue('tags', tags);
            }}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            {...form.register('author')}
            placeholder="Author name"
          />
        </div>

        {getPlatformSpecificFields()}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Publishing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Publish Immediately</Label>
              <p className="text-sm text-muted-foreground">
                Publish to {platform} right away
              </p>
            </div>
            <Switch
              checked={publishSettings.publishNow}
              onCheckedChange={(checked) => {
                setPublishSettings(prev => ({
                  ...prev,
                  publishNow: checked,
                  schedulePost: checked ? false : prev.schedulePost
                }));
              }}
              disabled={!apiKeysConfigured}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Schedule for Later</Label>
              <p className="text-sm text-muted-foreground">
                Schedule post for a specific date and time
              </p>
            </div>
            <Switch
              checked={publishSettings.schedulePost}
              onCheckedChange={(checked) => {
                setPublishSettings(prev => ({
                  ...prev,
                  schedulePost: checked,
                  publishNow: checked ? false : prev.publishNow
                }));
              }}
              disabled={!apiKeysConfigured}
            />
          </div>

          {publishSettings.schedulePost && (
            <div className="space-y-2">
              <Label>Schedule Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('scheduledDate') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('scheduledDate') ? (
                      format(form.watch('scheduledDate'), "PPP 'at' p")
                    ) : (
                      <span>Pick a date and time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('scheduledDate')}
                    onSelect={(date) => form.setValue('scheduledDate', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {!apiKeysConfigured && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              API keys for {platform} are not configured. Publishing features are disabled.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="submit" variant="outline">
          Save as Draft
        </Button>
        <Button
          type="submit"
          className="bg-astrum-purple hover:bg-astrum-purple/80"
          disabled={!apiKeysConfigured && (publishSettings.publishNow || publishSettings.schedulePost)}
        >
          {publishSettings.publishNow ? 'Publish Now' : 
           publishSettings.schedulePost ? 'Schedule Post' : 
           'Create Content'}
        </Button>
      </div>
    </form>
  );
};

export default PlatformContentForm;
