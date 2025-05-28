
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2 } from 'lucide-react';
import { getContent, deleteContentItem } from '@/services/databaseService';
import { ContentItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContentManagement = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("all");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load content from database
    const loadedContent = getContent();
    setContent(loadedContent);
    setFilteredContent(loadedContent);
  }, []);

  useEffect(() => {
    // Filter content based on search, status, and platform
    let result = content;
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(item => item.publishStatus === statusFilter);
    }
    
    // Filter by platform (if needed)
    if (platform !== "all") {
      const categoryMap: Record<string, string> = {
        'hashnode': 'blog',
        'devTo': 'blog',
        'twitter': 'feed',
        'linkedin': 'feed',
        'instagram': 'feed',
        'youtube': 'reel'
      };
      
      result = result.filter(item => item.category === categoryMap[platform]);
    }
    
    // Filter by search
    if (searchQuery) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredContent(result);
  }, [content, statusFilter, searchQuery, platform]);

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

  const handleDeleteContent = (id: string) => {
    deleteContentItem(id);
    setContent(prev => prev.filter(item => item.id !== id));
    setDeleteConfirmId(null);
    
    toast({
      title: 'Content deleted',
      description: 'The content has been permanently removed',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 gap-4">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="mb-4 grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="hashnode">Hashnode</SelectItem>
              <SelectItem value="devTo">Dev.to</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative w-full md:w-[250px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search content..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div>
        {filteredContent.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border p-8 text-center">
            <CardContent className="space-y-4 pt-4">
              <h3 className="text-xl font-medium">No content found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 
                  'No results match your search query.' : 
                  'No content available with the selected filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="bg-card/80 backdrop-blur-sm border-border flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center px-6 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                    <Badge className={getStatusBadgeColor(item.publishStatus)}>
                      {item.publishStatus}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setDeleteConfirmId(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => navigate(`/content/${item.id}`)}
                    >
                      <Edit className="h-4 w-4 text-astrum-teal" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-bold line-clamp-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="bg-astrum-purple/10 text-astrum-teal/80 border-astrum-purple/40 text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-border/30 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    By {item.author}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Confirmation dialog for deleting content */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-semibold">Confirm Deletion</h3>
            <p>Are you sure you want to delete this content? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDeleteContent(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;
