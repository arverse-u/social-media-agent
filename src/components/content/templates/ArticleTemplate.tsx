
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ArticleTemplateProps {
  onSelect: () => void;
}

const ArticleTemplate = ({ onSelect }: ArticleTemplateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutorial Template</CardTitle>
        <CardDescription>Pre-structured tutorial</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Start with a pre-structured tutorial template with sections for introduction, 
          prerequisites, steps, and conclusion.
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

export default ArticleTemplate;
