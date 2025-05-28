
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoTemplateProps {
  onSelect: () => void;
}

const VideoTemplate = ({ onSelect }: VideoTemplateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutorial Video</CardTitle>
        <CardDescription>Educational content</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Start with a template for educational video content with pre-structured metadata
          optimized for learning platforms.
        </p>
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

export default VideoTemplate;
