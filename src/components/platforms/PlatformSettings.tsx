
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { getPlatforms, updatePlatform, getPlatformConfig, updatePlatformConfig } from '@/services/databaseService';
import { Platform, PlatformConfig } from '@/types';
import { Icons } from '@/components/ui/icons';

const PlatformSettings = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [configs, setConfigs] = React.useState<Record<Platform['id'], PlatformConfig>>({} as any);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('blog');

  React.useEffect(() => {
    // Load platforms and configs
    const loadedPlatforms = getPlatforms();
    setPlatforms(loadedPlatforms);
    
    // Load platform configs
    const platformConfigs: Record<Platform['id'], PlatformConfig> = {} as any;
    loadedPlatforms.forEach(platform => {
      const config = getPlatformConfig(platform.id);
      if (config) {
        platformConfigs[platform.id] = config;
      }
    });
    setConfigs(platformConfigs);
  }, []);

  const handlePlatformToggle = (platform: Platform) => {
    const updated = { ...platform, enabled: !platform.enabled };
    updatePlatform(updated);
    
    // Update local state
    setPlatforms(prev => prev.map(p => (p.id === platform.id ? updated : p)));
  };

  const handleConfigChange = (platform: Platform['id'], field: keyof PlatformConfig, value: any) => {
    const config = configs[platform];
    if (!config) return;
    
    const updated = { ...config, [field]: value };
    setConfigs(prev => ({ ...prev, [platform]: updated }));
  };

  const handleSaveConfig = (platform: Platform['id']) => {
    const config = configs[platform];
    if (!config) return;
    
    updatePlatformConfig(config);
    
    toast({
      title: 'Settings saved',
      description: `${platform} platform settings have been updated`,
    });
  };

  // Get platform icon based on ID
  const getPlatformIcon = (platformId: Platform['id']) => {
    switch (platformId) {
      case 'twitter':
        return <Icons.twitter className="h-5 w-5" />;
      case 'linkedin':
        return <Icons.linkedin className="h-5 w-5" />;
      case 'instagram':
        return <Icons.instagram className="h-5 w-5" />;
      case 'youtube':
        return <Icons.youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Group platforms by category
  const platformsByCategory = React.useMemo(() => {
    const grouped: Record<string, Platform[]> = { 'blog': [], 'feed': [], 'reel': [] };
    
    platforms.forEach(platform => {
      if (grouped[platform.category]) {
        grouped[platform.category].push(platform);
      }
    });
    
    return grouped;
  }, [platforms]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Platform Settings</h2>
      
      <div className="mb-6">
        <Label htmlFor="category-select" className="text-lg font-medium mb-2 block">Select Platform Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blog">Blog Platforms</SelectItem>
            <SelectItem value="feed">Social Media Platforms</SelectItem>
            <SelectItem value="reel">Video Platforms</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {platformsByCategory[selectedCategory]?.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm border-border p-8 text-center">
          <CardContent className="space-y-4 pt-4">
            <h3 className="text-xl font-medium">No platforms found</h3>
            <p className="text-muted-foreground">
              No platforms are configured for this category
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {platformsByCategory[selectedCategory]?.map((platform) => (
            <Card key={platform.id} className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform.id)}
                    <CardTitle>{platform.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${platform.enabled ? 'text-green-500' : 'text-gray-500'}`}>
                      {platform.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      id={`${platform.id}-enabled`}
                      checked={platform.enabled}
                      onCheckedChange={() => handlePlatformToggle(platform)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Configure your {platform.name} publishing settings
                </CardDescription>
                <div className="mt-2">
                  <Badge key={platform.category} variant="outline" className="capitalize bg-astrum-purple/20 text-astrum-teal border-astrum-purple/40">
                    {platform.category}
                  </Badge>
                  {!platform.isConfigured && (
                    <Badge variant="outline" className="ml-2 bg-yellow-500/20 text-yellow-600 border-yellow-500/40">
                      Not Configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Blog Platform Settings */}
                {platform.category === 'blog' && platform.id === 'hashnode' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Publishing Settings</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-auto-publish`}
                          checked={configs[platform.id]?.autoPublish || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'autoPublish', checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-auto-publish`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Auto-publish to default publication
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Canonical Links</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-canonical`}
                          checked={configs[platform.id]?.canonicalLink || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'canonicalLink', checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-canonical`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Use original source as canonical
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Publication ID</Label>
                      <Input 
                        placeholder="Enter your Hashnode publication ID" 
                        value={configs[platform.id]?.authorName || ''}
                        onChange={(e) => handleConfigChange(platform.id, 'authorName', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {platform.category === 'blog' && platform.id === 'devTo' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Publishing Mode</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${platform.id}-draft-mode`}
                            checked={!configs[platform.id]?.autoPublish}
                            onCheckedChange={(checked) => handleConfigChange(platform.id, 'autoPublish', !checked)}
                          />
                          <label
                            htmlFor={`${platform.id}-draft-mode`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Save as draft
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${platform.id}-auto-publish`}
                            checked={configs[platform.id]?.autoPublish || false}
                            onCheckedChange={(checked) => handleConfigChange(platform.id, 'autoPublish', checked)}
                          />
                          <label
                            htmlFor={`${platform.id}-auto-publish`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Publish immediately
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Canonical Links</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-canonical`}
                          checked={configs[platform.id]?.canonicalLink || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'canonicalLink', checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-canonical`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Use original source as canonical
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Article Series</Label>
                      <Input 
                        placeholder="Optional: Add to a series (leave blank for none)"
                        value={configs[platform.id]?.authorName || ''}
                        onChange={(e) => handleConfigChange(platform.id, 'authorName', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Social Media Platform Settings */}
                {platform.category === 'feed' && platform.id === 'twitter' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tweet Format</Label>
                      <Select 
                        value={configs[platform.id]?.tweetFormat || "title-link"}
                        onValueChange={(val) => handleConfigChange(platform.id, 'tweetFormat' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title-link">Title + Link</SelectItem>
                          <SelectItem value="title-excerpt-link">Title + Excerpt + Link</SelectItem>
                          <SelectItem value="custom">Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Add Hashtags</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-hashtags`}
                          checked={configs[platform.id]?.addHashtags || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'addHashtags' as keyof PlatformConfig, checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-hashtags`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Convert tags to hashtags
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Include Media</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-include-media`}
                          checked={configs[platform.id]?.includeImage || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'includeImage', checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-include-media`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Attach media to tweets
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Maximum Characters</Label>
                      <Input 
                        type="number"
                        placeholder="280"
                        value={configs[platform.id]?.maxRetries || 280}
                        onChange={(e) => handleConfigChange(platform.id, 'maxRetries', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Twitter's character limit is 280</p>
                    </div>
                  </div>
                )}
                
                {platform.category === 'feed' && platform.id === 'linkedin' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Post Type</Label>
                      <Select 
                        value={configs[platform.id]?.postType || "article"}
                        onValueChange={(val) => handleConfigChange(platform.id, 'postType' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="image">Image Post</SelectItem>
                          <SelectItem value="text">Text Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Post Visibility</Label>
                      <Select 
                        defaultValue="public"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="connections">Connections only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Include Post Image</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-include-image`}
                          checked={configs[platform.id]?.includeImage || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'includeImage' as keyof PlatformConfig, checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-include-image`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Use cover image in post
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Text Format</Label>
                      <Select 
                        defaultValue="excerpt-link"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title-link">Title + Link</SelectItem>
                          <SelectItem value="excerpt-link">Excerpt + Link</SelectItem>
                          <SelectItem value="custom">Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {platform.category === 'feed' && platform.id === 'instagram' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Post Type</Label>
                      <Select 
                        value={configs[platform.id]?.postType || "image"}
                        onValueChange={(val) => handleConfigChange(platform.id, 'postType' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image Post</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Caption Format</Label>
                      <Select 
                        value={configs[platform.id]?.captionFormat || "title-excerpt"}
                        onValueChange={(val) => handleConfigChange(platform.id, 'captionFormat' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title-only">Title Only</SelectItem>
                          <SelectItem value="title-excerpt">Title + Excerpt</SelectItem>
                          <SelectItem value="custom">Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Image Filter</Label>
                      <Select 
                        defaultValue="none"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Filter</SelectItem>
                          <SelectItem value="clarendon">Clarendon</SelectItem>
                          <SelectItem value="gingham">Gingham</SelectItem>
                          <SelectItem value="moon">Moon</SelectItem>
                          <SelectItem value="lark">Lark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Add Hashtags</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`${platform.id}-hashtags`}
                          checked={configs[platform.id]?.addHashtags || false}
                          onCheckedChange={(checked) => handleConfigChange(platform.id, 'addHashtags' as keyof PlatformConfig, checked)}
                        />
                        <label
                          htmlFor={`${platform.id}-hashtags`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Convert tags to hashtags
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Maximum Hashtags</Label>
                      <Input 
                        type="number"
                        placeholder="30"
                        value={configs[platform.id]?.maxRetries || 30}
                        onChange={(e) => handleConfigChange(platform.id, 'maxRetries', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Instagram allows a maximum of 30 hashtags</p>
                    </div>
                  </div>
                )}
                
                {/* Video Platform Settings */}
                {platform.category === 'reel' && platform.id === 'youtube' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Video Privacy</Label>
                      <Select 
                        value={configs[platform.id]?.videoPrivacy || "public"}
                        onValueChange={(val) => handleConfigChange(platform.id, 'videoPrivacy' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select privacy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description Format</Label>
                      <Select 
                        value={configs[platform.id]?.descriptionFormat || "full-content"} 
                        onValueChange={(val) => handleConfigChange(platform.id, 'descriptionFormat' as keyof PlatformConfig, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title-only">Title Only</SelectItem>
                          <SelectItem value="excerpt">Excerpt</SelectItem>
                          <SelectItem value="full-content">Full Content</SelectItem>
                          <SelectItem value="custom">Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Video Category</Label>
                      <Select defaultValue="24">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">Entertainment</SelectItem>
                          <SelectItem value="27">Education</SelectItem>
                          <SelectItem value="28">Science & Technology</SelectItem>
                          <SelectItem value="22">People & Blogs</SelectItem>
                          <SelectItem value="20">Gaming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Made for Kids</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`${platform.id}-not-kids`} defaultChecked />
                          <label
                            htmlFor={`${platform.id}-not-kids`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Not made for kids
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`${platform.id}-kids`} />
                          <label
                            htmlFor={`${platform.id}-kids`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Made for kids
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Allow Comments</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox id={`${platform.id}-comments`} defaultChecked />
                        <label
                          htmlFor={`${platform.id}-comments`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Enable comments
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Common settings for all platforms */}
                <div className="space-y-2">
                  <Label>Default Tags</Label>
                  <Input
                    placeholder="Enter tags separated by commas"
                    value={configs[platform.id]?.defaultTags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      handleConfigChange(platform.id, 'defaultTags', tags);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Auto-retry on Failure</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id={`${platform.id}-retry`}
                      checked={configs[platform.id]?.retryOnFail || false}
                      onCheckedChange={(checked) => handleConfigChange(platform.id, 'retryOnFail', checked)}
                    />
                    <label
                      htmlFor={`${platform.id}-retry`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Automatically retry failed uploads
                    </label>
                  </div>
                </div>
                
                {configs[platform.id]?.retryOnFail && (
                  <div className="space-y-2">
                    <Label>Maximum Retry Attempts</Label>
                    <Select
                      value={String(configs[platform.id]?.maxRetries || 3)}
                      onValueChange={(value) => handleConfigChange(platform.id, 'maxRetries', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select max retries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Publishing Delay (minutes)</Label>
                  <Select
                    value={String(configs[platform.id]?.publishDelay || 0)}
                    onValueChange={(value) => handleConfigChange(platform.id, 'publishDelay', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No delay</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex gap-2">
                  <Button
                    onClick={() => handleSaveConfig(platform.id)}
                    className="w-full bg-astrum-blue hover:bg-astrum-blue/80"
                  >
                    Save Settings
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
                    onClick={() => navigate('/secrets')}
                  >
                    Configure API Keys
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformSettings;
