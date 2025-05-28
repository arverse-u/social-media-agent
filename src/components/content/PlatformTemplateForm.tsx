
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Send, Save, Sparkles, CheckCircle } from 'lucide-react';
import { Platform } from '@/types';
import { checkPlatformApiKeys } from '@/services/platformApiCheck';
import { checkGrammar } from '@/services/aiGrammarService';
import { generateTags } from '@/services/aiTagService';
import { useToast } from '@/components/ui/use-toast';

interface PlatformTemplateFormProps {
  platform: Platform;
  onSubmit: (data: any, action: 'draft' | 'publish' | 'schedule') => void;
  onBack: () => void;
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  scheduledDate: string;
  scheduledTime: string;
  // Blog specific (Hashnode, Dev.to)
  canonicalUrl?: string;
  series?: string;
  coverImageUrl?: string;
  // Social Media specific
  mediaFiles?: FileList | null;
  videoFile?: File | null;
  // LinkedIn specific
  postType?: 'text' | 'image' | 'video' | 'article';
  // YouTube specific
  visibility?: 'public' | 'unlisted' | 'private';
  category?: string;
  // Instagram specific
  altText?: string;
  location?: string;
  // Twitter specific
  threadCount?: number;
}

const PlatformTemplateForm: React.FC<PlatformTemplateFormProps> = ({
  platform,
  onSubmit,
  onBack
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    canonicalUrl: '',
    series: '',
    coverImageUrl: '',
    mediaFiles: null,
    videoFile: null,
    postType: 'text',
    visibility: 'public',
    category: '22',
    altText: '',
    location: '',
    threadCount: 1,
  });
  
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasApiKeys(checkPlatformApiKeys(platform.id as any));
  }, [platform.id]);

  const handleInputChange = (field: keyof FormData, value: string | FileList | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGrammarCheck = async (field: 'title' | 'content' | 'excerpt') => {
    const text = formData[field];
    if (!text.trim()) {
      toast({
        title: 'No text to check',
        description: `Please enter some ${field} first`,
        variant: 'destructive'
      });
      return;
    }

    setIsCheckingGrammar(true);
    try {
      const result = await checkGrammar(text);
      if (result.success && result.correctedText) {
        setFormData(prev => ({
          ...prev,
          [field]: result.correctedText!
        }));
        toast({
          title: 'Grammar checked',
          description: 'Text has been improved and corrected',
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
        title: 'Error',
        description: 'Failed to check grammar',
        variant: 'destructive'
      });
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handleGenerateTags = async () => {
    const content = formData.content + ' ' + formData.title;
    if (!content.trim()) {
      toast({
        title: 'No content available',
        description: 'Please enter title and content first',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingTags(true);
    try {
      const result = await generateTags(content, platform.name);
      if (result.success && result.tags) {
        const tagsString = result.tags.join(', ');
        setFormData(prev => ({
          ...prev,
          tags: tagsString
        }));
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
        title: 'Error',
        description: 'Failed to generate tags',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Content is required',
        variant: 'destructive'
      });
      return false;
    }

    // Platform-specific validations
    switch (platform.id) {
      case 'twitter':
        if (formData.content.length > 280) {
          toast({
            title: 'Validation Error',
            description: 'Twitter content cannot exceed 280 characters',
            variant: 'destructive'
          });
          return false;
        }
        break;
      
      case 'linkedin':
        if (formData.content.length > 3000) {
          toast({
            title: 'Validation Error',
            description: 'LinkedIn content cannot exceed 3000 characters',
            variant: 'destructive'
          });
          return false;
        }
        break;
      
      case 'instagram':
        if (formData.content.length > 2200) {
          toast({
            title: 'Validation Error',
            description: 'Instagram caption cannot exceed 2200 characters',
            variant: 'destructive'
          });
          return false;
        }
        break;
      
      case 'youtube':
        if (formData.content.length > 5000) {
          toast({
            title: 'Validation Error',
            description: 'YouTube description cannot exceed 5000 characters',
            variant: 'destructive'
          });
          return false;
        }
        if (!formData.videoFile) {
          toast({
            title: 'Validation Error',
            description: 'Video file is required for YouTube',
            variant: 'destructive'
          });
          return false;
        }
        break;
    }

    return true;
  };

  const canPublish = () => {
    return hasApiKeys && validateForm();
  };

  const canSchedule = () => {
    return hasApiKeys && validateForm() && formData.scheduledDate !== '';
  };

  const handleSubmit = (action: 'draft' | 'publish' | 'schedule') => {
    if (action !== 'draft' && !validateForm()) {
      return;
    }
    onSubmit(formData, action);
  };

  const renderPlatformSpecificFields = () => {
    switch (platform.id) {
      case 'hashnode':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL (Optional)</Label>
              <Input
                id="canonicalUrl"
                value={formData.canonicalUrl || ''}
                onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                placeholder="https://example.com/original-post"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Series (Optional)</Label>
              <Input
                id="series"
                value={formData.series || ''}
                onChange={(e) => handleInputChange('series', e.target.value)}
                placeholder="Series name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl || ''}
                onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                placeholder="https://example.com/cover-image.jpg"
                type="url"
              />
            </div>
          </>
        );

      case 'devTo':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL (Optional)</Label>
              <Input
                id="canonicalUrl"
                value={formData.canonicalUrl || ''}
                onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                placeholder="https://example.com/original-post"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Series (Optional)</Label>
              <Input
                id="series"
                value={formData.series || ''}
                onChange={(e) => handleInputChange('series', e.target.value)}
                placeholder="Series name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl || ''}
                onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                placeholder="https://example.com/cover-image.jpg"
                type="url"
              />
            </div>
          </>
        );

      case 'twitter':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="mediaFiles">Media Files (Optional)</Label>
              <Input
                id="mediaFiles"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleInputChange('mediaFiles', e.target.files)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-astrum-purple file:text-white"
              />
              <p className="text-xs text-muted-foreground">
                Max 4 images or 1 video. Images: JPG, PNG, GIF, WEBP. Video: MP4, MOV
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threadCount">Thread Count</Label>
              <Select value={formData.threadCount?.toString()} onValueChange={(value) => handleInputChange('threadCount', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select thread count" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} {count === 1 ? 'Tweet' : 'Tweets'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'linkedin':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="postType">Post Type *</Label>
              <Select value={formData.postType} onValueChange={(value) => handleInputChange('postType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Post</SelectItem>
                  <SelectItem value="image">Image Post</SelectItem>
                  <SelectItem value="video">Video Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.postType === 'image' || formData.postType === 'video') && (
              <div className="space-y-2">
                <Label htmlFor="mediaFiles">
                  {formData.postType === 'image' ? 'Image Files' : 'Video File'} *
                </Label>
                <Input
                  id="mediaFiles"
                  type="file"
                  multiple={formData.postType === 'image'}
                  accept={formData.postType === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => handleInputChange('mediaFiles', e.target.files)}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-astrum-purple file:text-white"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.postType === 'image' 
                    ? 'Max 20 images. Formats: JPG, PNG, GIF' 
                    : 'Max 1 video. Formats: MP4, MOV, AVI (max 10GB)'
                  }
                </p>
              </div>
            )}
          </>
        );

      case 'instagram':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="mediaFiles">Media Files *</Label>
              <Input
                id="mediaFiles"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleInputChange('mediaFiles', e.target.files)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-astrum-purple file:text-white"
              />
              <p className="text-xs text-muted-foreground">
                Max 10 images or 1 video. Images: JPG, PNG. Video: MP4, MOV (max 100MB)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text (Optional)</Label>
              <Textarea
                id="altText"
                value={formData.altText || ''}
                onChange={(e) => handleInputChange('altText', e.target.value)}
                placeholder="Describe your image for accessibility"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Add location"
              />
            </div>
          </>
        );

      case 'youtube':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="videoFile">Video File *</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={(e) => handleInputChange('videoFile', e.target.files?.[0] || null)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-astrum-purple file:text-white"
              />
              <p className="text-xs text-muted-foreground">
                Formats: MP4, MOV, AVI, WMV, FLV, WEBM (max 256GB or 12 hours)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility *</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Film & Animation</SelectItem>
                  <SelectItem value="2">Autos & Vehicles</SelectItem>
                  <SelectItem value="10">Music</SelectItem>
                  <SelectItem value="15">Pets & Animals</SelectItem>
                  <SelectItem value="17">Sports</SelectItem>
                  <SelectItem value="19">Travel & Events</SelectItem>
                  <SelectItem value="20">Gaming</SelectItem>
                  <SelectItem value="22">People & Blogs</SelectItem>
                  <SelectItem value="23">Comedy</SelectItem>
                  <SelectItem value="24">Entertainment</SelectItem>
                  <SelectItem value="25">News & Politics</SelectItem>
                  <SelectItem value="26">Howto & Style</SelectItem>
                  <SelectItem value="27">Education</SelectItem>
                  <SelectItem value="28">Science & Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getContentPlaceholder = () => {
    switch (platform.id) {
      case 'twitter':
        return 'What\'s happening? (Max 280 characters)';
      case 'linkedin':
        return 'Share your professional thoughts... (Max 3000 characters)';
      case 'instagram':
        return 'Write a caption for your post... (Max 2200 characters)';
      case 'youtube':
        return 'Describe your video... (Max 5000 characters)';
      case 'hashnode':
      case 'devTo':
        return 'Write your article content in Markdown...';
      default:
        return 'Enter your content here...';
    }
  };

  const getContentLabel = () => {
    switch (platform.id) {
      case 'twitter':
        return 'Tweet Content *';
      case 'linkedin':
        return 'Post Content *';
      case 'instagram':
        return 'Caption *';
      case 'youtube':
        return 'Video Description *';
      case 'hashnode':
      case 'devTo':
        return 'Article Content *';
      default:
        return 'Content *';
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Platforms
      </Button>

      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Create Content for {platform.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="title">Title *</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGrammarCheck('title')}
                disabled={isCheckingGrammar}
                className="h-6 px-2 text-xs"
              >
                {isCheckingGrammar ? <Sparkles className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Grammar
              </Button>
            </div>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGrammarCheck('excerpt')}
                disabled={isCheckingGrammar}
                className="h-6 px-2 text-xs"
              >
                {isCheckingGrammar ? <Sparkles className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Grammar
              </Button>
            </div>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description or summary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="content">{getContentLabel()}</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGrammarCheck('content')}
                disabled={isCheckingGrammar}
                className="h-6 px-2 text-xs"
              >
                {isCheckingGrammar ? <Sparkles className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Grammar
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={getContentPlaceholder()}
              rows={platform.id === 'twitter' ? 4 : 10}
            />
            {platform.id === 'twitter' && (
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/280 characters
              </p>
            )}
          </div>

          {/* Platform-specific fields */}
          {renderPlatformSpecificFields()}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                className="h-6 px-2 text-xs"
              >
                {isGeneratingTags ? <Sparkles className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Generate
              </Button>
            </div>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Schedule Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Schedule Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
              />
            </div>
          </div>

          {!hasApiKeys && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                API keys not configured for {platform.name}. You can save drafts, but publishing requires API configuration.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={!canPublish()}
            className="flex-1 bg-astrum-purple hover:bg-astrum-purple/80"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish Now
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleSubmit('schedule')}
            disabled={!canSchedule()}
            className="flex-1"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PlatformTemplateForm;
