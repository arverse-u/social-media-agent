
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AIAssistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIAssistDialog = ({ open, onOpenChange }: AIAssistDialogProps) => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<'blog' | 'feed' | 'reel'>('blog');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Missing information",
        description: "Please enter a prompt for the AI to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call to AI service
    try {
      // In a real implementation, this would be an actual API call to Gemini or other AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let title = '';
      let content = '';
      
      // Generate mock content based on content type
      if (contentType === 'blog') {
        title = `Blog Post: ${prompt.split(' ').slice(0, 3).join(' ')}...`;
        content = `# ${title}\n\n## Introduction\nThis is a blog post about ${prompt}.\n\n## Main Content\nHere's where the main content would go, exploring ${prompt} in depth.\n\n## Conclusion\nIn conclusion, ${prompt} is an important topic worth exploring.`;
      } else if (contentType === 'feed') {
        title = `Social Post: ${prompt.split(' ').slice(0, 3).join(' ')}...`;
        content = `Check out this new post about ${prompt}! #content #socialmedia #trending\n\nI've been thinking a lot about ${prompt} lately and wanted to share some thoughts.`;
      } else {
        title = `Reel Script: ${prompt.split(' ').slice(0, 3).join(' ')}...`;
        content = `[OPENING SHOT]\nIntro sequence showing ${prompt}\n\n[MIDDLE SECTION]\nExplain the key points about ${prompt} with visual examples\n\n[CLOSING]\nCall to action related to ${prompt}`;
      }
      
      setGeneratedTitle(title);
      setGeneratedContent(content);
      
      toast({
        title: "Content generated",
        description: "AI has successfully created your content"
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    // In a real implementation, this would create a new content item with the generated content
    toast({
      title: "Content saved",
      description: "The AI-generated content has been saved as a draft"
    });
    onOpenChange(false);
    
    // Reset state for next time
    setPrompt('');
    setGeneratedContent('');
    setGeneratedTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Content Assistant</DialogTitle>
          <DialogDescription>
            Let our AI help you generate content ideas and drafts
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select 
              value={contentType} 
              onValueChange={(value: 'blog' | 'feed' | 'reel') => setContentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="feed">Social Media Feed</SelectItem>
                <SelectItem value="reel">Video Reel Script</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="prompt">What would you like to create?</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
          
          {!generatedContent ? (
            <Button 
              onClick={handleGenerate} 
              className="bg-astrum-purple hover:bg-astrum-purple/80"
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="generatedTitle">Generated Title</Label>
                <Input
                  id="generatedTitle"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="generatedContent">Generated Content</Label>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <Textarea
                      id="generatedContent"
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={10}
                      className="bg-transparent border-none focus-visible:ring-0 resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                >
                  Regenerate
                </Button>
                <Button 
                  onClick={handleUseContent}
                  className="bg-astrum-purple hover:bg-astrum-purple/80"
                >
                  Use This Content
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistDialog;
