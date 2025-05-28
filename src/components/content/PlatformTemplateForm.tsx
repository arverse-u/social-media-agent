
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Send, Save } from 'lucide-react';
import { Platform } from '@/types';
import { checkPlatformApiKeys } from '@/services/platformApiCheck';

interface PlatformTemplateFormProps {
  platform: Platform;
  onSubmit: (data: any, action: 'draft' | 'publish' | 'schedule') => void;
  onBack: () => void;
}

const PlatformTemplateForm: React.FC<PlatformTemplateFormProps> = ({
  platform,
  onSubmit,
  onBack
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    scheduledDate: '',
    scheduledTime: '09:00',
  });
  
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    setHasApiKeys(checkPlatformApiKeys(platform.id as any));
  }, [platform.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.title.trim() !== '' && formData.content.trim() !== '';
  };

  const canPublish = () => {
    return hasApiKeys && isFormValid();
  };

  const canSchedule = () => {
    return hasApiKeys && isFormValid() && formData.scheduledDate !== '';
  };

  const handleSubmit = (action: 'draft' | 'publish' | 'schedule') => {
    onSubmit(formData, action);
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
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description or summary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Main content body"
              rows={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
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
