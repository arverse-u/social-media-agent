
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, FilePlus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { addContentItem, getContent, deleteContentItem } from '@/services/databaseService';
import { ContentItem, Platform } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import PlatformSelector from './PlatformSelector';
import PlatformContentForm from './PlatformContentForm';

const ManualContentUpload = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform['id'] | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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

  const handleDeleteContent = (id: string) => {
    deleteContentItem(id);
    setContent(prev => prev.filter(item => item.id !== id));
    setDeleteConfirmId(null);
    
    toast({
      title: 'Content deleted',
      description: 'The content has been permanently removed',
    });
  };
  
  const handleCreateContent = (data: any, publishAction: 'draft' | 'publish' | 'schedule') => {
    if (!selectedPlatform) return;
    
    // Map platform to content category
    const categoryMap: Record<string, 'blog' | 'feed' | 'reel'> = {
      hashnode: 'blog',
      devTo: 'blog',
      twitter: 'feed',
      linkedin: 'feed',
      instagram: 'feed',
      youtube: 'reel'
    };
    
    // Generate a new content ID
    const id = `content-${Date.now()}`;
    
    // Determine publish status
    let publishStatus: ContentItem['publishStatus'] = 'draft';
    if (publishAction === 'publish') {
      publishStatus = 'published';
    } else if (publishAction === 'schedule' && data.scheduledDate) {
      publishStatus = 'scheduled';
    }
    
    // Create a new content item
    const newContent: ContentItem = {
      id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: data.coverImage,
      sourceUrl: data.canonicalUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishStatus,
      scheduledDate: data.scheduledDate,
      contentType: categoryMap[selectedPlatform],
      category: categoryMap[selectedPlatform],
      mediaUrls: data.mediaUrls ? (Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls]) : undefined,
    };
    
    // Add the content to the database
    addContentItem(newContent);
    
    // Update the content state
    setContent(prev => [...prev, newContent]);
    
    // Show success toast
    toast({
      title: publishStatus === 'draft' ? 'Draft saved' : publishStatus === 'scheduled' ? 'Content scheduled' : 'Content published',
      description: publishStatus === 'draft' ? 'Your content has been saved as a draft' : 
                  publishStatus === 'scheduled' ? `Your content has been scheduled for ${new Date(data.scheduledDate).toLocaleString()}` : 
                  'Your content has been published successfully',
    });
    
    // Reset and close dialog
    setSelectedPlatform(null);
    setIsCreateDialogOpen(false);
  };

  // Filter content by search query, tab and status
  const filteredContent = content
    .filter(item => 
      selectedTab === 'all' ? true : item.category === selectedTab
    )
    .filter(item => 
      statusFilter === 'all' ? true : item.publishStatus === statusFilter
    )
    .filter(item => 
      searchQuery === '' ? true : (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white">Manual Upload</h2>
          <p className="text-muted-foreground">Create, manage and publish content to specific platforms</p>
        </div>
        <div>
          <Button 
            className="bg-astrum-purple hover:bg-astrum-purple/80" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 gap-4">
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
          <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="blog">Blogs</TabsTrigger>
            <TabsTrigger value="feed">Feeds</TabsTrigger>
            <TabsTrigger value="reel">Reels</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="mb-4 grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full md:w-1/3">
          <div className="relative">
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
                  selectedTab === 'all' 
                    ? 'Start by creating new content for specific platforms'
                    : `No ${selectedTab} content found. Create your first ${selectedTab} now.`}
              </p>
              <Button 
                className="mt-4 bg-astrum-purple hover:bg-astrum-purple/80" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create New Content
              </Button>
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
      
      {/* Dialog for platform selection and content creation */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[90%] lg:max-w-[80%] max-h-[90vh] overflow-y-auto p-6">
          {!selectedPlatform ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select Platform</h2>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <PlatformSelector onSelect={(platformId) => setSelectedPlatform(platformId)} />
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => setSelectedPlatform(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h2 className="text-2xl font-bold capitalize">
                    {selectedPlatform === 'devTo' ? 'Dev.to' : selectedPlatform} Content
                  </h2>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <PlatformContentForm 
                platform={selectedPlatform as any} 
                onSubmit={handleCreateContent}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

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

export default ManualContentUpload;
