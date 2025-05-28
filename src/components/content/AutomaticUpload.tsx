
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { checkPlatformApiKeys } from '@/services/platformApiCheck';
import { Bot, Clock, Globe, Calendar } from 'lucide-react';
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
  const [aiOptimizationEnabled, setAiOptimizationEnabled] = useState(true);
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

    // Load AI optimization setting
    const aiSetting = localStorage.getItem('astrumverse_ai_optimization');
    if (aiSetting) {
      setAiOptimizationEnabled(JSON.parse(aiSetting));
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

  const handleAiOptimizationToggle = () => {
    const newValue = !aiOptimizationEnabled;
    setAiOptimizationEnabled(newValue);
    localStorage.setItem('astrumverse_ai_optimization', JSON.stringify(newValue));
    
    toast({
      title: `AI optimization ${newValue ? 'enabled' : 'disabled'}`,
      description: newValue ? 'AI will automatically create and optimize content schedules' : 'You will manually set schedules',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Automatic Upload</h2>
        <p className="text-muted-foreground">Configure autonomous content publishing with AI optimization</p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platforms">Platform Settings</TabsTrigger>
          <TabsTrigger value="schedules">Weekly Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-astrum-teal" />
                Global AI Optimization
              </CardTitle>
              <CardDescription>
                Control how content schedules are managed across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Auto-Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    {aiOptimizationEnabled 
                      ? 'AI will automatically create and optimize content schedules daily'
                      : 'You will manually create and manage content schedules'
                    }
                  </p>
                </div>
                <Switch 
                  checked={aiOptimizationEnabled} 
                  onCheckedChange={handleAiOptimizationToggle}
                />
              </div>
            </CardContent>
          </Card>

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
          <WeeklySchedules 
            platforms={platforms} 
            aiOptimizationEnabled={aiOptimizationEnabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomaticUpload;
