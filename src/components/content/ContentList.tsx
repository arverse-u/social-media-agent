
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContent } from '@/services/databaseService';
import { ContentItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import NewContentDialog from './NewContentDialog';

const ContentList = () => {
  const [content, setContent] = React.useState<ContentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load content from database
    const loadedContent = getContent();
    setContent(loadedContent);
  }, []);

  const getStatusBadgeColor = (status: ContentItem['publishStatus']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500 hover:bg-green-600';
      case 'scheduled':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredContent = selectedTab === 'all' 
    ? content 
    : content.filter(item => item.category === selectedTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Content Library</h2>
        <Button 
          className="bg-astrum-purple hover:bg-astrum-purple/80" 
          onClick={() => setIsDialogOpen(true)}
        >
          Create New Content
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="feed">Social Posts</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab}>
          {filteredContent.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm border-border p-8 text-center">
              <CardContent className="space-y-4 pt-4">
                <h3 className="text-xl font-medium">No content found</h3>
                <p className="text-muted-foreground">
                  {selectedTab === 'all' 
                    ? 'Start by creating new content or importing from your sources'
                    : `No ${selectedTab} content found. Create your first ${selectedTab} now.`}
                </p>
                <Button 
                  className="mt-4 bg-astrum-purple hover:bg-astrum-purple/80" 
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create New Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="bg-card/80 backdrop-blur-sm border-border flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      <Badge className={getStatusBadgeColor(item.publishStatus)}>
                        {item.publishStatus}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-1">By {item.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.excerpt}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="bg-astrum-purple/10 text-astrum-teal/80 border-astrum-purple/40">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.updatedAt)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20" 
                      onClick={() => navigate(`/content/${item.id}`)}
                    >
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <NewContentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default ContentList;
