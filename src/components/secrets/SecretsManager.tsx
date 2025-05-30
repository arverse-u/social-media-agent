
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { loadApiKeys, saveApiKeys } from '@/config/apiKeys';
import { ApiKeys } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { ApiTestService, TestResult } from '@/services/apiTestService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SecretsManager = () => {
  const [keys, setKeys] = React.useState<ApiKeys>({} as ApiKeys);
  const [originalKeys, setOriginalKeys] = React.useState<ApiKeys>({} as ApiKeys);
  const [showSecrets, setShowSecrets] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [testingConnections, setTestingConnections] = React.useState<Record<string, boolean>>({});
  const [connectionResults, setConnectionResults] = React.useState<Record<string, TestResult>>({});

  React.useEffect(() => {
    const loadedKeys = loadApiKeys();
    setKeys(loadedKeys);
    setOriginalKeys(JSON.parse(JSON.stringify(loadedKeys)));
  }, []);

  React.useEffect(() => {
    const hasChanges = JSON.stringify(keys) !== JSON.stringify(originalKeys);
    setHasUnsavedChanges(hasChanges);
  }, [keys, originalKeys]);

  const handleInputChange = (category: keyof ApiKeys, field: string, value: string, nestedField?: string) => {
    setKeys(prev => {
      const newKeys = { ...prev };
      
      if (!newKeys[category]) {
        // @ts-ignore
        newKeys[category] = {};
      }
      
      if (nestedField) {
        // @ts-ignore
        if (!newKeys[category][field]) {
          // @ts-ignore
          newKeys[category][field] = {};
        }
        // @ts-ignore
        newKeys[category][field][nestedField] = value;
      } else {
        // @ts-ignore
        newKeys[category][field] = value;
      }
      
      return newKeys;
    });
  };

  const testConnection = async (testKey: string, testFunction: () => Promise<TestResult>) => {
    setTestingConnections(prev => ({ ...prev, [testKey]: true }));
    
    try {
      const result = await testFunction();
      setConnectionResults(prev => ({ ...prev, [testKey]: result }));
      
      toast({
        title: result.success ? 'Connection Successful' : 'Connection Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      };
      setConnectionResults(prev => ({ ...prev, [testKey]: errorResult }));
      
      toast({
        title: 'Connection Failed',
        description: errorResult.message,
        variant: 'destructive',
      });
    } finally {
      setTestingConnections(prev => ({ ...prev, [testKey]: false }));
    }
  };

  const saveToSupabase = async (secretName: string, secretValue: string) => {
    try {
      const { error } = await supabase.functions.invoke('save-secret', {
        body: { name: secretName, value: secretValue }
      });
      
      if (error) {
        console.error('Error saving to Supabase:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      return false;
    }
  };

  const handleSave = async (category: string) => {
    setSaving(true);
    
    try {
      // Save to localStorage first
      saveApiKeys(keys);
      
      // Also save individual secrets to Supabase for backend functions
      const secretMappings: Record<string, string> = {
        // AI Keys
        'ai.gemini.apiKey': 'GEMINI_API_KEY',
        'ai.backupAi1.apiKey': 'GROQ_API_KEY',
        'ai.openai.apiKey': 'OPENAI_API_KEY',
        
        // Platform Keys
        'hashnode.token': 'HASHNODE_API_KEY',
        'devTo.apiKey': 'DEVTO_API_KEY',
        'twitter.bearerToken': 'TWITTER_BEARER_TOKEN',
        'twitter.apiKey': 'TWITTER_CONSUMER_KEY',
        'twitter.apiKeySecret': 'TWITTER_CONSUMER_SECRET',
        'twitter.accessToken': 'TWITTER_ACCESS_TOKEN',
        'twitter.accessTokenSecret': 'TWITTER_ACCESS_TOKEN_SECRET',
        'linkedin.accessToken': 'LINKEDIN_ACCESS_TOKEN',
        'instagram.accessToken': 'INSTAGRAM_ACCESS_TOKEN',
        'youtube.accessToken': 'YOUTUBE_API_KEY',
        'youtube.dropboxToken': 'DROPBOX_ACCESS_TOKEN',
        'instagram.dropboxToken': 'DROPBOX_ACCESS_TOKEN',
        
        // Source API Keys
        'sourceApi.hashnodeApi.apiKey': 'HASHNODE_SOURCE_API_KEY',
        'sourceApi.devToApi.apiKey': 'DEVTO_SOURCE_API_KEY',
        'sourceApi.linkedinApi.apiKey': 'LINKEDIN_SOURCE_API_KEY',
        'sourceApi.twitterApi.apiKey': 'TWITTER_SOURCE_API_KEY',
      };

      // Save each secret to Supabase
      for (const [keyPath, supabaseKey] of Object.entries(secretMappings)) {
        const pathParts = keyPath.split('.');
        let value = keys;
        
        for (const part of pathParts) {
          // @ts-ignore
          value = value?.[part];
        }
        
        if (value && typeof value === 'string') {
          await saveToSupabase(supabaseKey, value);
        }
      }
      
      // Update original keys to reflect saved state
      setOriginalKeys(JSON.parse(JSON.stringify(keys)));
      
      toast({
        title: 'Secrets saved successfully',
        description: `${category} secrets have been updated and synced to backend`,
      });
    } catch (error) {
      console.error('Error saving secrets:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving secrets',
        description: 'There was an error saving your secrets. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setKeys(JSON.parse(JSON.stringify(originalKeys)));
    toast({
      title: 'Changes discarded',
      description: 'All unsaved changes have been discarded',
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, platform: 'youtube' | 'instagram') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;
        
        try {
          const { error } = await supabase.functions.invoke('process-csv', {
            body: { csvData, platform }
          });
          
          if (error) {
            throw error;
          }
          
          toast({
            title: 'CSV uploaded successfully',
            description: `${file.name} has been processed for ${platform}`,
          });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error processing CSV',
            description: 'There was an error processing your CSV file.',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const renderConnectionStatus = (testKey: string) => {
    const isLoading = testingConnections[testKey];
    const result = connectionResults[testKey];
    
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (result) {
      return result.success ? 
        <CheckCircle className="h-4 w-4 text-green-500" /> : 
        <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Secrets Manager</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-secrets">Show Secrets</Label>
          <Switch 
            id="show-secrets" 
            checked={showSecrets} 
            onCheckedChange={setShowSecrets} 
          />
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            You have unsaved changes. Don't forget to save your changes before leaving this page.
          </p>
        </div>
      )}

      <Tabs defaultValue="source" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="source">Source APIs</TabsTrigger>
          <TabsTrigger value="ai">AI APIs</TabsTrigger>
          <TabsTrigger value="platforms">Platform APIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Source APIs</CardTitle>
              <CardDescription>
                Configure the APIs used to fetch content for each platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Hashnode API</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('hashnode-source')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('hashnode-source', () => 
                        ApiTestService.testHashnodeSourceApi(
                          keys.sourceApi?.hashnodeApi?.url || '',
                          keys.sourceApi?.hashnodeApi?.apiKey || ''
                        )
                      )}
                      disabled={!keys.sourceApi?.hashnodeApi?.url || !keys.sourceApi?.hashnodeApi?.apiKey || testingConnections['hashnode-source']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hashnode-source-url">API URL</Label>
                    <Input 
                      id="hashnode-source-url" 
                      value={keys.sourceApi?.hashnodeApi?.url || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'hashnodeApi', e.target.value, 'url')}
                      type={showSecrets ? "text" : "password"}
                      placeholder="https://api.hashnode.com/graphql"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hashnode-source-key">API Key</Label>
                    <Input 
                      id="hashnode-source-key" 
                      value={keys.sourceApi?.hashnodeApi?.apiKey || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'hashnodeApi', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter Hashnode API key" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Dev.to API</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('devto-source')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('devto-source', () => 
                        ApiTestService.testDevToSourceApi(
                          keys.sourceApi?.devToApi?.url || '',
                          keys.sourceApi?.devToApi?.apiKey || ''
                        )
                      )}
                      disabled={!keys.sourceApi?.devToApi?.url || !keys.sourceApi?.devToApi?.apiKey || testingConnections['devto-source']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="devto-source-url">API URL</Label>
                    <Input 
                      id="devto-source-url" 
                      value={keys.sourceApi?.devToApi?.url || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'devToApi', e.target.value, 'url')}
                      type={showSecrets ? "text" : "password"}
                      placeholder="https://dev.to/api/articles" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="devto-source-key">API Key</Label>
                    <Input 
                      id="devto-source-key" 
                      value={keys.sourceApi?.devToApi?.apiKey || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'devToApi', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter Dev.to API key" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">LinkedIn API</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('linkedin-source')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('linkedin-source', () => 
                        ApiTestService.testLinkedInSourceApi(
                          keys.sourceApi?.linkedinApi?.url || '',
                          keys.sourceApi?.linkedinApi?.apiKey || ''
                        )
                      )}
                      disabled={!keys.sourceApi?.linkedinApi?.url || !keys.sourceApi?.linkedinApi?.apiKey || testingConnections['linkedin-source']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-source-url">API URL</Label>
                    <Input 
                      id="linkedin-source-url" 
                      value={keys.sourceApi?.linkedinApi?.url || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'linkedinApi', e.target.value, 'url')}
                      type={showSecrets ? "text" : "password"}
                      placeholder="https://api.linkedin.com/v2/posts" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-source-key">API Key</Label>
                    <Input 
                      id="linkedin-source-key" 
                      value={keys.sourceApi?.linkedinApi?.apiKey || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'linkedinApi', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter LinkedIn API key" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">X (Twitter) API</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('twitter-source')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('twitter-source', () => 
                        ApiTestService.testTwitterSourceApi(
                          keys.sourceApi?.twitterApi?.url || '',
                          keys.sourceApi?.twitterApi?.apiKey || ''
                        )
                      )}
                      disabled={!keys.sourceApi?.twitterApi?.url || !keys.sourceApi?.twitterApi?.apiKey || testingConnections['twitter-source']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twitter-source-url">API URL</Label>
                    <Input 
                      id="twitter-source-url" 
                      value={keys.sourceApi?.twitterApi?.url || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'twitterApi', e.target.value, 'url')}
                      type={showSecrets ? "text" : "password"}
                      placeholder="https://api.twitter.com/2/tweets" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-source-key">API Key</Label>
                    <Input 
                      id="twitter-source-key" 
                      value={keys.sourceApi?.twitterApi?.apiKey || ''} 
                      onChange={(e) => handleInputChange('sourceApi', 'twitterApi', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter Twitter API key" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">YouTube Content Upload</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-csv">Upload CSV/Excel File</Label>
                    <Input 
                      id="youtube-csv" 
                      type="file" 
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'youtube')}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      CSV format: video_file_name, video_type, content
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="youtube-dropbox-token">Dropbox Access Token</Label>
                      <Input 
                        id="youtube-dropbox-token" 
                        value={keys.youtube?.dropboxToken || ''} 
                        onChange={(e) => handleInputChange('youtube', 'dropboxToken', e.target.value)}
                        type={showSecrets ? "text" : "password"} 
                        placeholder="Enter Dropbox access token" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube-dropbox-api">Dropbox API Key</Label>
                      <Input 
                        id="youtube-dropbox-api" 
                        value={keys.youtube?.dropboxApiKey || ''} 
                        onChange={(e) => handleInputChange('youtube', 'dropboxApiKey', e.target.value)}
                        type={showSecrets ? "text" : "password"} 
                        placeholder="Enter Dropbox API key" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Instagram Content Upload</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-csv">Upload CSV/Excel File</Label>
                    <Input 
                      id="instagram-csv" 
                      type="file" 
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'instagram')}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      CSV format: video_file_name, video_type, content
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="instagram-dropbox-token">Dropbox Access Token</Label>
                      <Input 
                        id="instagram-dropbox-token" 
                        value={keys.instagram?.dropboxToken || ''} 
                        onChange={(e) => handleInputChange('instagram', 'dropboxToken', e.target.value)}
                        type={showSecrets ? "text" : "password"} 
                        placeholder="Enter Dropbox access token" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram-dropbox-api">Dropbox API Key</Label>
                      <Input 
                        id="instagram-dropbox-api" 
                        value={keys.instagram?.dropboxApiKey || ''} 
                        onChange={(e) => handleInputChange('instagram', 'dropboxApiKey', e.target.value)}
                        type={showSecrets ? "text" : "password"} 
                        placeholder="Enter Dropbox API key" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={() => handleSave('Source APIs')} 
                className="bg-astrum-blue hover:bg-astrum-blue/80"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save Source API Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI API Configuration</CardTitle>
              <CardDescription>
                Configure AI services for content enhancement and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">OpenAI API (Primary)</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('openai')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('openai', () => 
                        ApiTestService.testOpenAiApi(keys.ai?.openai?.apiKey || '')
                      )}
                      disabled={!keys.ai?.openai?.apiKey || testingConnections['openai']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openai-api-key">API Key</Label>
                    <Input 
                      id="openai-api-key" 
                      value={keys.ai?.openai?.apiKey || ''} 
                      onChange={(e) => handleInputChange('ai', 'openai', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter OpenAI API key" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openai-daily-limit">Daily Usage Limit</Label>
                    <Input 
                      id="openai-daily-limit" 
                      value={keys.ai?.openai?.dailyLimit || 100} 
                      onChange={(e) => handleInputChange('ai', 'openai', e.target.value, 'dailyLimit')}
                      type="number" 
                      placeholder="100" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Gemini API (Secondary)</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('gemini')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('gemini', () => 
                        ApiTestService.testGeminiApi(keys.ai?.gemini?.apiKey || '')
                      )}
                      disabled={!keys.ai?.gemini?.apiKey || testingConnections['gemini']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-api-key">API Key</Label>
                    <Input 
                      id="gemini-api-key" 
                      value={keys.ai?.gemini?.apiKey || ''} 
                      onChange={(e) => handleInputChange('ai', 'gemini', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter Gemini API key" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gemini-daily-limit">Daily Usage Limit</Label>
                    <Input 
                      id="gemini-daily-limit" 
                      value={keys.ai?.gemini?.dailyLimit || 100} 
                      onChange={(e) => handleInputChange('ai', 'gemini', e.target.value, 'dailyLimit')}
                      type="number" 
                      placeholder="100" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">GroqCloud API (Llama3-8B-8192)</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('groq')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('groq', () => 
                        ApiTestService.testGroqApi(keys.ai?.backupAi1?.apiKey || '')
                      )}
                      disabled={!keys.ai?.backupAi1?.apiKey || testingConnections['groq']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="groq-api-key">API Key</Label>
                    <Input 
                      id="groq-api-key" 
                      value={keys.ai?.backupAi1?.apiKey || ''} 
                      onChange={(e) => handleInputChange('ai', 'backupAi1', e.target.value, 'apiKey')}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter GroqCloud API key" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groq-daily-limit">Daily Usage Limit</Label>
                    <Input 
                      id="groq-daily-limit" 
                      value={keys.ai?.backupAi1?.dailyLimit || 100} 
                      onChange={(e) => handleInputChange('ai', 'backupAi1', e.target.value, 'dailyLimit')}
                      type="number" 
                      placeholder="100" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={() => handleSave('AI APIs')} 
                className="bg-astrum-blue hover:bg-astrum-blue/80"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save AI API Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Platforms</CardTitle>
              <CardDescription>
                Configure API keys for blogs and article publishing platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Hashnode</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('hashnode-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('hashnode-platform', () => 
                        ApiTestService.testHashnodePlatformApi(keys.hashnode?.token || '')
                      )}
                      disabled={!keys.hashnode?.token || testingConnections['hashnode-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hashnode-token">API Token</Label>
                    <Input 
                      id="hashnode-token" 
                      value={keys.hashnode?.token || ''} 
                      onChange={(e) => handleInputChange('hashnode', 'token', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter Hashnode token" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hashnode-publication-id">Publication ID (optional)</Label>
                    <Input 
                      id="hashnode-publication-id" 
                      value={keys.hashnode?.publicationId || ''} 
                      onChange={(e) => handleInputChange('hashnode', 'publicationId', e.target.value)}
                      placeholder="Enter publication ID" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Dev.to</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('devto-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('devto-platform', () => 
                        ApiTestService.testDevToPlatformApi(keys.devTo?.apiKey || '')
                      )}
                      disabled={!keys.devTo?.apiKey || testingConnections['devto-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devto-api-key">API Key</Label>
                  <Input 
                    id="devto-api-key" 
                    value={keys.devTo?.apiKey || ''} 
                    onChange={(e) => handleInputChange('devTo', 'apiKey', e.target.value)}
                    type={showSecrets ? "text" : "password"} 
                    placeholder="Enter Dev.to API key" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={() => handleSave('Article Platforms')} 
                className="bg-astrum-blue hover:bg-astrum-blue/80"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save Article Platform Settings'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media Platforms</CardTitle>
              <CardDescription>
                Configure API keys for social media and feeds publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Twitter/X</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('twitter-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('twitter-platform', () => 
                        ApiTestService.testTwitterPlatformApi(keys.twitter?.bearerToken || '')
                      )}
                      disabled={!keys.twitter?.bearerToken || testingConnections['twitter-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twitter-api-key">API Key</Label>
                    <Input 
                      id="twitter-api-key" 
                      value={keys.twitter?.apiKey || ''} 
                      onChange={(e) => handleInputChange('twitter', 'apiKey', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter API key" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-api-secret">API Secret</Label>
                    <Input 
                      id="twitter-api-secret" 
                      value={keys.twitter?.apiKeySecret || ''} 
                      onChange={(e) => handleInputChange('twitter', 'apiKeySecret', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter API secret" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-access-token">Access Token</Label>
                    <Input 
                      id="twitter-access-token" 
                      value={keys.twitter?.accessToken || ''} 
                      onChange={(e) => handleInputChange('twitter', 'accessToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter access token" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-token-secret">Access Token Secret</Label>
                    <Input 
                      id="twitter-token-secret" 
                      value={keys.twitter?.accessTokenSecret || ''} 
                      onChange={(e) => handleInputChange('twitter', 'accessTokenSecret', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter token secret" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-bearer-token">Bearer Token</Label>
                    <Input 
                      id="twitter-bearer-token" 
                      value={keys.twitter?.bearerToken || ''} 
                      onChange={(e) => handleInputChange('twitter', 'bearerToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter bearer token" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">LinkedIn</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('linkedin-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('linkedin-platform', () => 
                        ApiTestService.testLinkedInPlatformApi(keys.linkedin?.accessToken || '')
                      )}
                      disabled={!keys.linkedin?.accessToken || testingConnections['linkedin-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-client-id">Client ID</Label>
                    <Input 
                      id="linkedin-client-id" 
                      value={keys.linkedin?.clientId || ''} 
                      onChange={(e) => handleInputChange('linkedin', 'clientId', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter client ID" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                    <Input 
                      id="linkedin-client-secret" 
                      value={keys.linkedin?.clientSecret || ''} 
                      onChange={(e) => handleInputChange('linkedin', 'clientSecret', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter client secret" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-access-token">Access Token</Label>
                    <Input 
                      id="linkedin-access-token" 
                      value={keys.linkedin?.accessToken || ''} 
                      onChange={(e) => handleInputChange('linkedin', 'accessToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter access token" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-refresh-token">Refresh Token</Label>
                    <Input 
                      id="linkedin-refresh-token" 
                      value={keys.linkedin?.refreshToken || ''} 
                      onChange={(e) => handleInputChange('linkedin', 'refreshToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter refresh token" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={() => handleSave('Social Media Platforms')} 
                className="bg-astrum-blue hover:bg-astrum-blue/80"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save Social Media Settings'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Media Platforms</CardTitle>
              <CardDescription>
                Configure API keys for video and image platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Instagram</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('instagram-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('instagram-platform', () => 
                        ApiTestService.testInstagramPlatformApi(keys.instagram?.accessToken || '')
                      )}
                      disabled={!keys.instagram?.accessToken || testingConnections['instagram-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-app-id">App ID</Label>
                    <Input 
                      id="instagram-app-id" 
                      value={keys.instagram?.appId || ''} 
                      onChange={(e) => handleInputChange('instagram', 'appId', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter app ID" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-app-secret">App Secret</Label>
                    <Input 
                      id="instagram-app-secret" 
                      value={keys.instagram?.appSecret || ''} 
                      onChange={(e) => handleInputChange('instagram', 'appSecret', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter app secret" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-access-token">Access Token</Label>
                    <Input 
                      id="instagram-access-token" 
                      value={keys.instagram?.accessToken || ''} 
                      onChange={(e) => handleInputChange('instagram', 'accessToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter access token" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram-user-id">User ID</Label>
                    <Input 
                      id="instagram-user-id" 
                      value={keys.instagram?.userId || ''} 
                      onChange={(e) => handleInputChange('instagram', 'userId', e.target.value)}
                      placeholder="Enter user ID" 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">YouTube</h3>
                  <div className="flex items-center space-x-2">
                    {renderConnectionStatus('youtube-platform')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('youtube-platform', () => 
                        ApiTestService.testYouTubePlatformApi(keys.youtube?.accessToken || '')
                      )}
                      disabled={!keys.youtube?.accessToken || testingConnections['youtube-platform']}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-client-id">Client ID</Label>
                    <Input 
                      id="youtube-client-id" 
                      value={keys.youtube?.clientId || ''} 
                      onChange={(e) => handleInputChange('youtube', 'clientId', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter client ID" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube-client-secret">Client Secret</Label>
                    <Input 
                      id="youtube-client-secret" 
                      value={keys.youtube?.clientSecret || ''} 
                      onChange={(e) => handleInputChange('youtube', 'clientSecret', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter client secret" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube-access-token">Access Token</Label>
                    <Input 
                      id="youtube-access-token" 
                      value={keys.youtube?.accessToken || ''} 
                      onChange={(e) => handleInputChange('youtube', 'accessToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter access token" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube-refresh-token">Refresh Token</Label>
                    <Input 
                      id="youtube-refresh-token" 
                      value={keys.youtube?.refreshToken || ''} 
                      onChange={(e) => handleInputChange('youtube', 'refreshToken', e.target.value)}
                      type={showSecrets ? "text" : "password"} 
                      placeholder="Enter refresh token" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={() => handleSave('Media Platforms')} 
                className="bg-astrum-blue hover:bg-astrum-blue/80"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save Media Platform Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecretsManager;
