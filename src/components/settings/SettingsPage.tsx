
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    language: 'en',
    timezone: 'UTC',
    contentBackup: true,
    analyticsTracking: true,
    betaFeatures: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully',
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export started',
      description: 'Your data export will be ready shortly',
    });
  };

  const handleClearCache = () => {
    toast({
      title: 'Cache cleared',
      description: 'Application cache has been cleared successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and account settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Preferences</CardTitle>
            <CardDescription>Configure your general application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for content updates</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(value) => handleSettingChange('notifications', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save content drafts</p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(value) => handleSettingChange('autoSave', value)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="CET">Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>Control your privacy and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="content-backup">Content Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup your content</p>
              </div>
              <Switch
                id="content-backup"
                checked={settings.contentBackup}
                onCheckedChange={(value) => handleSettingChange('contentBackup', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics-tracking">Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground">Allow usage analytics to improve the platform</p>
              </div>
              <Switch
                id="analytics-tracking"
                checked={settings.analyticsTracking}
                onCheckedChange={(value) => handleSettingChange('analyticsTracking', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Advanced configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="beta-features">Beta Features</Label>
                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Enable experimental features (may be unstable)</p>
              </div>
              <Switch
                id="beta-features"
                checked={settings.betaFeatures}
                onCheckedChange={(value) => handleSettingChange('betaFeatures', value)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
              <Button variant="outline" onClick={handleClearCache}>
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Info</CardTitle>
            <CardDescription>Information about your Astrumverse installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Version</Label>
                <p className="font-medium">v1.0.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Storage Used</Label>
                <p className="font-medium">245 MB / 1 GB</p>
              </div>
              <div>
                <Label className="text-muted-foreground">API Calls This Month</Label>
                <p className="font-medium">1,247 / 10,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-astrum-blue hover:bg-astrum-blue/80">
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
