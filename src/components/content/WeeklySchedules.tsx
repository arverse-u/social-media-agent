
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Plus, Edit, Trash2, User } from 'lucide-react';

interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'csv';
  enabled: boolean;
  hasApiKeys: boolean;
}

interface WeeklySchedule {
  id: string;
  platformId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string;
  enabled: boolean;
  createdBy: 'user';
  createdAt: string;
}

interface PlatformSettings {
  platformId: string;
  postsPerDay: number;
  enabled: boolean;
}

interface WeeklySchedulesProps {
  platforms: PlatformConfig[];
}

const WeeklySchedules: React.FC<WeeklySchedulesProps> = ({ platforms }) => {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const { toast } = useToast();

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    // Load schedules from localStorage
    const storedSchedules = localStorage.getItem('astrumverse_weekly_schedules');
    if (storedSchedules) {
      setSchedules(JSON.parse(storedSchedules));
    }

    // Load platform settings from localStorage
    const storedSettings = localStorage.getItem('astrumverse_platform_settings');
    if (storedSettings) {
      setPlatformSettings(JSON.parse(storedSettings));
    } else {
      // Initialize platform settings
      const initialSettings = platforms.map(platform => ({
        platformId: platform.id,
        postsPerDay: 1,
        enabled: platform.enabled,
      }));
      setPlatformSettings(initialSettings);
      localStorage.setItem('astrumverse_platform_settings', JSON.stringify(initialSettings));
    }
  }, [platforms]);

  const saveSchedules = (updatedSchedules: WeeklySchedule[]) => {
    localStorage.setItem('astrumverse_weekly_schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
  };

  const savePlatformSettings = (updatedSettings: PlatformSettings[]) => {
    localStorage.setItem('astrumverse_platform_settings', JSON.stringify(updatedSettings));
    setPlatformSettings(updatedSettings);
  };

  const handleAddSchedule = (platformId: string) => {
    const newSchedule: WeeklySchedule = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      platformId,
      dayOfWeek: 'monday',
      time: '09:00',
      enabled: true,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    saveSchedules(updatedSchedules);
    
    toast({
      title: 'Schedule added',
      description: 'New weekly schedule has been created',
    });
  };

  const handleUpdateSchedule = (scheduleId: string, updates: Partial<WeeklySchedule>) => {
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, ...updates }
        : schedule
    );
    
    saveSchedules(updatedSchedules);
    
    toast({
      title: 'Schedule updated',
      description: 'Weekly schedule has been modified',
    });
    
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    saveSchedules(updatedSchedules);
    
    toast({
      title: 'Schedule deleted',
      description: 'Weekly schedule has been removed',
    });
  };

  const handlePlatformSettingChange = (platformId: string, field: 'postsPerDay' | 'enabled', value: number | boolean) => {
    const updatedSettings = platformSettings.map(setting =>
      setting.platformId === platformId
        ? { ...setting, [field]: value }
        : setting
    );
    
    savePlatformSettings(updatedSettings);
    
    toast({
      title: 'Platform settings updated',
      description: `${field === 'postsPerDay' ? 'Posts per day' : 'Status'} updated for platform`,
    });
  };

  const getPlatformSchedules = (platformId: string) => {
    return schedules.filter(schedule => schedule.platformId === platformId);
  };

  const getPlatformSetting = (platformId: string) => {
    return platformSettings.find(s => s.platformId === platformId) || { postsPerDay: 1, enabled: true };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Weekly Schedules</h3>
        <p className="text-muted-foreground">Create and manage posting schedules for each platform. Set posts per day and specific timing for each platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.filter(p => p.enabled).map((platform) => {
          const platformSchedules = getPlatformSchedules(platform.id);
          const platformSetting = getPlatformSetting(platform.id);
          
          return (
            <Card key={platform.id} className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {platform.name}
                      <Badge variant="outline" className={`${platform.hasApiKeys ? 'bg-green-500/20 text-green-500 border-green-500/40' : 'bg-red-500/20 text-red-500 border-red-500/40'}`}>
                        {platform.hasApiKeys ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`posts-${platform.id}`}>Posts per day</Label>
                  <Input
                    id={`posts-${platform.id}`}
                    type="number"
                    min="1"
                    max="10"
                    value={platformSetting.postsPerDay}
                    onChange={(e) => handlePlatformSettingChange(platform.id, 'postsPerDay', parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of posts to publish per day on this platform
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Weekly Schedules ({platformSchedules.length})
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddSchedule(platform.id)}
                      disabled={!platform.hasApiKeys}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Schedule
                    </Button>
                  </div>
                  
                  {platformSchedules.length === 0 ? (
                    <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No schedules configured</p>
                      <p className="text-xs text-muted-foreground">Click "Add Schedule" to create your first posting schedule</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {platformSchedules.map((schedule) => (
                        <Card key={schedule.id} className="bg-muted/50">
                          <CardContent className="p-3">
                            {editingSchedule === schedule.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <select 
                                    value={schedule.dayOfWeek}
                                    onChange={(e) => handleUpdateSchedule(schedule.id, { dayOfWeek: e.target.value as any })}
                                    className="p-2 border rounded text-sm bg-background"
                                  >
                                    {dayOptions.map(day => (
                                      <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                  </select>
                                  <Input
                                    type="time"
                                    value={schedule.time}
                                    onChange={(e) => handleUpdateSchedule(schedule.id, { time: e.target.value })}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => setEditingSchedule(null)}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingSchedule(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="h-3 w-3" />
                                    {dayOptions.find(d => d.value === schedule.dayOfWeek)?.label} at {schedule.time}
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3 text-blue-500" />
                                      <Switch 
                                        checked={schedule.enabled} 
                                        onCheckedChange={(enabled) => handleUpdateSchedule(schedule.id, { enabled })}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Created by user on {new Date(schedule.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => setEditingSchedule(schedule.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {platforms.filter(p => p.enabled).length === 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Platforms Enabled</h3>
            <p className="text-muted-foreground">
              Enable platforms in the Platform Settings tab to create schedules
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklySchedules;
