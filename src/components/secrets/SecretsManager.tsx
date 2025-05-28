import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Key, Shield, Globe, Save } from 'lucide-react';

const SecretsManager = () => {
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [apiKeys, setApiKeys] = useState({
    // Platform API Keys
    hashnode: { token: '', publicationId: '' },
    devTo: { apiKey: '' },
    twitter: { bearerToken: '', apiKey: '', apiSecret: '' },
    linkedin: { accessToken: '', clientId: '', clientSecret: '' },
    instagram: { accessToken: '', businessAccountId: '' },
    youtube: { accessToken: '', channelId: '' },
    
    // AI Service Keys
    openai: { apiKey: '' },
    groq: { apiKey: '' },
    gemini: { apiKey: '' },
    
    // Analytics Keys
    googleAnalytics: { trackingId: '', apiKey: '' },
    facebookPixel: { pixelId: '' },
    twitterAnalytics: { apiKey: '', apiSecret: '' }
  });
  const { toast } = useToast();

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (category: string, platform: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const validateApiKeys = () => {
    const requiredKeys = {
      hashnode: ['token'],
      devTo: ['apiKey'],
      twitter: ['bearerToken'],
      linkedin: ['accessToken'],
      openai: ['apiKey'],
      groq: ['apiKey'],
      gemini: ['apiKey']
    };

    const missingKeys: string[] = [];

    Object.entries(requiredKeys).forEach(([platform, fields]) => {
      fields.forEach(field => {
        const value = apiKeys[platform as keyof typeof apiKeys]?.[field as keyof any];
        if (!value || value.trim() === '') {
          missingKeys.push(`${platform}.${field}`);
        }
      });
    });

    return missingKeys;
  };

  const handleSaveChanges = () => {
    const missingKeys = validateApiKeys();
    
    if (missingKeys.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Missing required keys: ${missingKeys.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('astrumverse_api_keys', JSON.stringify(apiKeys));
    
    toast({
      title: 'Settings Saved',
      description: 'All API keys and secrets have been saved successfully',
    });
  };

  const renderInputField = (
    category: string,
    platform: string,
    field: string,
    label: string,
    placeholder: string,
    required: boolean = false
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`${platform}-${field}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={`${platform}-${field}`}
          type={showPasswords[`${platform}-${field}`] ? "text" : "password"}
          placeholder={placeholder}
          value={apiKeys[platform as keyof typeof apiKeys]?.[field as keyof any] || ''}
          onChange={(e) => handleInputChange(category, platform, field, e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => togglePasswordVisibility(`${platform}-${field}`)}
        >
          {showPasswords[`${platform}-${field}`] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Secrets Management</h1>
          <p className="text-muted-foreground">Manage API keys and secrets for platform integrations</p>
        </div>
        <Button onClick={handleSaveChanges} className="bg-astrum-purple hover:bg-astrum-purple/80">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Platform APIs
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            AI Services
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hashnode */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Hashnode
                </CardTitle>
                <CardDescription>Configure Hashnode API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'hashnode', 'token', 'API Token', 'Your Hashnode API token', true)}
                {renderInputField('platforms', 'hashnode', 'publicationId', 'Publication ID', 'Your publication ID (optional)')}
              </CardContent>
            </Card>

            {/* Dev.to */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Dev.to
                </CardTitle>
                <CardDescription>Configure Dev.to API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'devTo', 'apiKey', 'API Key', 'Your Dev.to API key', true)}
              </CardContent>
            </Card>

            {/* Twitter */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Twitter/X
                </CardTitle>
                <CardDescription>Configure Twitter API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'twitter', 'bearerToken', 'Bearer Token', 'Your Twitter Bearer token', true)}
                {renderInputField('platforms', 'twitter', 'apiKey', 'API Key', 'Your Twitter API key')}
                {renderInputField('platforms', 'twitter', 'apiSecret', 'API Secret', 'Your Twitter API secret')}
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  LinkedIn
                </CardTitle>
                <CardDescription>Configure LinkedIn API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'linkedin', 'accessToken', 'Access Token', 'Your LinkedIn access token', true)}
                {renderInputField('platforms', 'linkedin', 'clientId', 'Client ID', 'Your LinkedIn client ID')}
                {renderInputField('platforms', 'linkedin', 'clientSecret', 'Client Secret', 'Your LinkedIn client secret')}
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Instagram
                </CardTitle>
                <CardDescription>Configure Instagram API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'instagram', 'accessToken', 'Access Token', 'Your Instagram access token')}
                {renderInputField('platforms', 'instagram', 'businessAccountId', 'Business Account ID', 'Your Instagram business account ID')}
              </CardContent>
            </Card>

            {/* YouTube */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  YouTube
                </CardTitle>
                <CardDescription>Configure YouTube API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('platforms', 'youtube', 'accessToken', 'Access Token', 'Your YouTube access token')}
                {renderInputField('platforms', 'youtube', 'channelId', 'Channel ID', 'Your YouTube channel ID')}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  OpenAI
                </CardTitle>
                <CardDescription>Configure OpenAI API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('ai', 'openai', 'apiKey', 'API Key', 'Your OpenAI API key', true)}
              </CardContent>
            </Card>

            {/* Groq */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Groq
                </CardTitle>
                <CardDescription>Configure Groq API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('ai', 'groq', 'apiKey', 'API Key', 'Your Groq API key', true)}
              </CardContent>
            </Card>

            {/* Gemini */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Gemini
                </CardTitle>
                <CardDescription>Configure Google Gemini API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('ai', 'gemini', 'apiKey', 'API Key', 'Your Gemini API key', true)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Analytics */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Google Analytics
                </CardTitle>
                <CardDescription>Configure Google Analytics credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('analytics', 'googleAnalytics', 'trackingId', 'Tracking ID', 'Your GA tracking ID')}
                {renderInputField('analytics', 'googleAnalytics', 'apiKey', 'API Key', 'Your GA API key')}
              </CardContent>
            </Card>

            {/* Facebook Pixel */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Facebook Pixel
                </CardTitle>
                <CardDescription>Configure Facebook Pixel credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('analytics', 'facebookPixel', 'pixelId', 'Pixel ID', 'Your Facebook Pixel ID')}
              </CardContent>
            </Card>

            {/* Twitter Analytics */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Twitter Analytics
                </CardTitle>
                <CardDescription>Configure Twitter Analytics credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInputField('analytics', 'twitterAnalytics', 'apiKey', 'API Key', 'Your Twitter Analytics API key')}
                {renderInputField('analytics', 'twitterAnalytics', 'apiSecret', 'API Secret', 'Your Twitter Analytics API secret')}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecretsManager;
