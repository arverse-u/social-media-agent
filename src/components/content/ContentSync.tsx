import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchContent, fetchFeedContent, fetchVideoContent } from '@/services/sourceApiService';
import { loadApiKeys } from '@/config/apiKeys';
import { useToast } from '@/hooks/use-toast';
import { addContentItem } from '@/services/databaseService';

const ContentSync = () => {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [countArticles, setCountArticles] = useState<number>(0);
  const [countFeeds, setCountFeeds] = useState<number>(0);
  const [countVideos, setCountVideos] = useState<number>(0);
  const { toast } = useToast();
  
  const checkApiConfig = (type: 'article' | 'feed' | 'video'): boolean => {
    const keys = loadApiKeys();
    
    switch (type) {
      case 'article':
        return !!keys.sourceApi?.hashnodeApi?.url && !!keys.sourceApi?.hashnodeApi?.apiKey;
      case 'feed':
        return !!keys.sourceApi?.linkedinApi?.url && !!keys.sourceApi?.linkedinApi?.apiKey;
      case 'video':
        return !!keys.youtube?.dropboxToken && !!keys.youtube?.dropboxApiKey;
      default:
        return false;
    }
  };

  const handleSync = async (type: 'article' | 'feed' | 'video') => {
    setSyncState('syncing');
    
    try {
      let response;
      
      switch (type) {
        case 'article':
          // Sync both Hashnode and Dev.to
          const { fetchHashnodeContent, fetchDevToContent } = await import('@/services/realApiService');
          const [hashnodeResult, devtoResult] = await Promise.all([
            fetchHashnodeContent(),
            fetchDevToContent()
          ]);
          
          let totalCount = 0;
          if (hashnodeResult.success && hashnodeResult.data) {
            hashnodeResult.data.forEach(item => addContentItem(item));
            totalCount += hashnodeResult.data.length;
          }
          if (devtoResult.success && devtoResult.data) {
            devtoResult.data.forEach(item => addContentItem(item));
            totalCount += devtoResult.data.length;
          }
          
          setCountArticles(totalCount);
          response = { success: true, data: [] };
          break;
          
        case 'feed':
          // Sync both LinkedIn and Twitter
          const { fetchLinkedInContent, fetchTwitterContent } = await import('@/services/realApiService');
          const [linkedinResult, twitterResult] = await Promise.all([
            fetchLinkedInContent(),
            fetchTwitterContent()
          ]);
          
          let feedCount = 0;
          if (linkedinResult.success && linkedinResult.data) {
            linkedinResult.data.forEach(item => addContentItem(item));
            feedCount += linkedinResult.data.length;
          }
          if (twitterResult.success && twitterResult.data) {
            twitterResult.data.forEach(item => addContentItem(item));
            feedCount += twitterResult.data.length;
          }
          
          setCountFeeds(feedCount);
          response = { success: true, data: [] };
          break;
          
        case 'video':
          // Process next videos from CSV queue
          const { csvVideoProcessor } = await import('@/services/csvVideoProcessor');
          const remainingCount = csvVideoProcessor.getRemainingCount();
          setCountVideos(remainingCount);
          response = { success: true, data: [] };
          break;
      }
      
      if (response && response.success) {
        setSyncState('success');
        setLastSyncedTime(new Date());
        
        toast({
          title: 'Content synced successfully',
          description: `Synced ${type} content from real APIs`,
        });
      } else {
        setSyncState('error');
        
        toast({
          variant: 'destructive',
          title: 'Failed to sync content',
          description: 'An error occurred while syncing',
        });
      }
    } catch (error) {
      setSyncState('error');
      toast({
        variant: 'destructive',
        title: 'Sync error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Content Synchronization</h2>
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="feeds">Feeds</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>Article Synchronization</CardTitle>
              <CardDescription>
                Fetch and synchronize articles from the source API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Last Synced</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lastSyncedTime ? lastSyncedTime.toLocaleString() : 'Never'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Article Count</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {countArticles} Articles
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSync('article')}
                disabled={syncState === 'syncing' || !checkApiConfig('article')}
                className={`w-full ${syncState === 'syncing' ? 'cursor-not-allowed' : 'bg-astrum-purple hover:bg-astrum-purple/80'}`}
              >
                {syncState === 'syncing' ? 'Syncing...' : 'Sync Articles'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="feeds">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>Feed Synchronization</CardTitle>
              <CardDescription>
                Fetch and synchronize feed posts from the source API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Last Synced</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lastSyncedTime ? lastSyncedTime.toLocaleString() : 'Never'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Feed Count</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {countFeeds} Feeds
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSync('feed')}
                disabled={syncState === 'syncing' || !checkApiConfig('feed')}
                className={`w-full ${syncState === 'syncing' ? 'cursor-not-allowed' : 'bg-astrum-purple hover:bg-astrum-purple/80'}`}
              >
                {syncState === 'syncing' ? 'Syncing...' : 'Sync Feeds'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>Video Synchronization</CardTitle>
              <CardDescription>
                Fetch and synchronize videos from the source API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Last Synced</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lastSyncedTime ? lastSyncedTime.toLocaleString() : 'Never'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Video Count</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {countVideos} Videos
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSync('video')}
                disabled={syncState === 'syncing' || !checkApiConfig('video')}
                className={`w-full ${syncState === 'syncing' ? 'cursor-not-allowed' : 'bg-astrum-purple hover:bg-astrum-purple/80'}`}
              >
                {syncState === 'syncing' ? 'Syncing...' : 'Sync Videos'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentSync;
