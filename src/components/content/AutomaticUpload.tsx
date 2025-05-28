
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { checkPlatformApiKeys } from '@/services/platformApiCheck';
import { Globe, Clock, Calendar, Lightbulb } from 'lucide-react';
import WeeklySchedules from './WeeklySchedules';

interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'csv';
  enabled: boolean;
  hasApiKeys: boolean;
}

const AutomaticUpload = () => {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const defaultPlatforms: PlatformConfig[] = [
    {
      id: 'hashnode',
      name: 'Hashnode',
      description: 'Fetch from configured source API',
      category: 'api',
      enabled: false,
      hasApiKeys: false,
    },
    {
      id: 'devTo',
      name: 'Dev.to',
      description: 'Fetch from configured source API',
      category: 'api',
      enabled: false,
      hasApiKeys: false,
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Fetch from configured source API',
      category: 'api',
      enabled: false,
      hasApiKeys: false,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Fetch from configured source API',
      category: 'api',
      enabled: false,
      hasApiKeys: false,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Process from CSV/Dropbox',
      category: 'csv',
      enabled: false,
      hasApiKeys: false,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Process from CSV/Dropbox',
      category: 'csv',
      enabled: false,
      hasApiKeys: false,
    },
  ];

  useEffect(() => {
    // Load platform configurations from localStorage
    const stored = localStorage.getItem('astrumverse_automatic_platforms');
    let platformConfigs = stored ? JSON.parse(stored) : defaultPlatforms;
    
    // Update API key status for each platform
    platformConfigs = platformConfigs.map((platform: PlatformConfig) => ({
      ...platform,
      hasApiKeys: checkPlatformApiKeys(platform.id as any),
    }));
    
    setPlatforms(platformConfigs);

    // Load AI suggestions if available
    const suggestions = localStorage.getItem('astrumverse_ai_timing_suggestions');
    if (suggestions) {
      setAiSuggestions(JSON.parse(suggestions));
    }
  }, []);

  const savePlatforms = (updatedPlatforms: PlatformConfig[]) => {
    localStorage.setItem('astrumverse_automatic_platforms', JSON.stringify(updatedPlatforms));
    setPlatforms(updatedPlatforms);
  };

  const handlePlatformToggle = (platformId: string) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    );
    
    savePlatforms(updatedPlatforms);
    
    const platform = updatedPlatforms.find(p => p.id === platformId);
    toast({
      title: `${platform?.name} ${platform?.enabled ? 'enabled' : 'disabled'}`,
      description: `${platform?.name} will ${platform?.enabled ? 'participate in' : 'be excluded from'} automatic uploads`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Automatic Upload</h2>
        <p className="text-muted-foreground">Configure autonomous content publishing and manage weekly schedules</p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platform Settings</TabsTrigger>
          <TabsTrigger value="schedules">Weekly Schedules</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id} className="bg-card/80 backdrop-blur-sm border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${platform.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {platform.name}
                          {platform.category === 'api' && <Globe className="h-4 w-4" />}
                          {platform.category === 'csv' && <Clock className="h-4 w-4" />}
                        </CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={platform.enabled} 
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>API Keys:</span>
                      <span className={platform.hasApiKeys ? 'text-green-500' : 'text-red-500'}>
                        {platform.hasApiKeys ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <span className={platform.enabled ? 'text-green-500' : 'text-gray-500'}>
                        {platform.enabled ? 'Will Process' : 'Excluded'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules">
          <WeeklySchedules platforms={platforms} />
        </TabsContent>

        <TabsContent value="suggestions">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Timing Suggestions
              </CardTitle>
              <CardDescription>
                AI analyzes your platform analytics nightly and suggests optimal posting times
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiSuggestions ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Last generated: {new Date(aiSuggestions.generatedAt).toLocaleString()}
                  </p>
                  <div className="grid gap-4">
                    {aiSuggestions.suggestions?.map((suggestion: any) => (
                      <div key={suggestion.platformId} className="border rounded-lg p-4">
                        <h4 className="font-medium capitalize">{suggestion.platformId}</h4>
                        <div className="mt-2 space-y-2">
                          {suggestion.optimalTimes?.map((time: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {time.day} at {time.time}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Score: {time.engagementScore}/10
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs mt-1">
                                {time.reasoning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No AI suggestions available yet. Suggestions will be generated nightly based on your platform analytics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomaticUpload;
