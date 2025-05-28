
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Plus, Edit, Trash2, Bot, User } from 'lucide-react';

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
  createdBy: 'ai' | 'user';
  aiReasoning?: string;
  createdAt: string;
}

interface PlatformSettings {
  platformId: string;
  postsPerDay: number;
  enabled: boolean;
}

interface WeeklySchedulesProps {
  platforms: PlatformConfig[];
  aiOptimizationEnabled: boolean;
}

const WeeklySchedules: React.FC<WeeklySchedulesProps> = ({ platforms, aiOptimizationEnabled }) => {
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
  };

  const generateAISchedules = async () => {
    if (!aiOptimizationEnabled) return;

    try {
      // Simulate AI schedule generation
      const aiSchedules: WeeklySchedule[] = [];
      
      platforms.filter(p => p.enabled && p.hasApiKeys).forEach(platform => {
        const platformSetting = platformSettings.find(s => s.platformId === platform.id);
        const postsPerDay = platformSetting?.postsPerDay || 1;
        
        // Generate optimal times based on platform type
        const optimalTimes = getOptimalTimesForPlatform(platform.id, postsPerDay);
        
        optimalTimes.forEach((timeSlot, index) => {
          const schedule: WeeklySchedule = {
            id: `ai-schedule-${Date.now()}-${platform.id}-${index}`,
            platformId: platform.id,
            dayOfWeek: timeSlot.day,
            time: timeSlot.time,
            enabled: true,
            createdBy: 'ai',
            aiReasoning: timeSlot.reasoning,
            createdAt: new Date().toISOString(),
          };
          aiSchedules.push(schedule);
        });
      });

      // Remove existing AI schedules and add new ones
      const userSchedules = schedules.filter(s => s.createdBy === 'user');
      const updatedSchedules = [...userSchedules, ...aiSchedules];
      saveSchedules(updatedSchedules);

      toast({
        title: 'AI schedules generated',
        description: `Created ${aiSchedules.length} optimized schedules`,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate AI schedules',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const getOptimalTimesForPlatform = (platformId: string, postsPerDay: number) => {
    // AI-powered optimal times based on platform analytics
    const timeSlots = [];
    
    switch (platformId) {
      case 'twitter':
        if (postsPerDay >= 1) timeSlots.push({ day: 'tuesday' as const, time: '09:00', reasoning: 'Peak engagement for professional content' });
        if (postsPerDay >= 2) timeSlots.push({ day: 'thursday' as const, time: '15:00', reasoning: 'High afternoon activity' });
        if (postsPerDay >= 3) timeSlots.push({ day: 'saturday' as const, time: '11:00', reasoning: 'Weekend engagement boost' });
        break;
      case 'linkedin':
        if (postsPerDay >= 1) timeSlots.push({ day: 'wednesday' as const, time: '08:00', reasoning: 'Business audience morning check' });
        if (postsPerDay >= 2) timeSlots.push({ day: 'friday' as const, time: '17:00', reasoning: 'End of week networking' });
        break;
      case 'instagram':
        if (postsPerDay >= 1) timeSlots.push({ day: 'sunday' as const, time: '19:00', reasoning: 'Peak visual content consumption' });
        if (postsPerDay >= 2) timeSlots.push({ day: 'wednesday' as const, time: '20:00', reasoning: 'Mid-week engagement spike' });
        break;
      case 'hashnode':
        if (postsPerDay >= 1) timeSlots.push({ day: 'monday' as const, time: '10:00', reasoning: 'Developer community active time' });
        break;
      case 'devTo':
        if (postsPerDay >= 1) timeSlots.push({ day: 'tuesday' as const, time: '14:00', reasoning: 'Tech community peak hours' });
        break;
      case 'youtube':
        if (postsPerDay >= 1) timeSlots.push({ day: 'friday' as const, time: '16:00', reasoning: 'Weekend viewing preparation' });
        break;
      default:
        if (postsPerDay >= 1) timeSlots.push({ day: 'monday' as const, time: '09:00', reasoning: 'General optimal posting time' });
    }
    
    return timeSlots.slice(0, postsPerDay);
  };

  const getPlatformSchedules = (platformId: string) => {
    return schedules.filter(schedule => schedule.platformId === platformId);
  };

  const getPlatformSetting = (platformId: string) => {
    return platformSettings.find(s => s.platformId === platformId) || { postsPerDay: 1, enabled: true };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-white">Weekly Schedules</h3>
          <p className="text-muted-foreground">Manage posting schedules for each platform</p>
        </div>
        
        {aiOptimizationEnabled && (
          <Button 
            onClick={generateAISchedules}
            className="bg-astrum-purple hover:bg-astrum-purple/80"
          >
            <Bot className="h-4 w-4 mr-2" />
            Generate AI Schedules
          </Button>
        )}
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
                  <Label>Posts per day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={platformSetting.postsPerDay}
                    onChange={(e) => handlePlatformSettingChange(platform.id, 'postsPerDay', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedules ({platformSchedules.length})
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddSchedule(platform.id)}
                      disabled={!platform.hasApiKeys}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {platformSchedules.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No schedules configured</p>
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
                                      {schedule.createdBy === 'ai' ? (
                                        <Bot className="h-3 w-3 text-blue-500" />
                                      ) : (
                                        <User className="h-3 w-3 text-green-500" />
                                      )}
                                      <Switch 
                                        checked={schedule.enabled} 
                                        onCheckedChange={(enabled) => handleUpdateSchedule(schedule.id, { enabled })}
                                      />
                                    </div>
                                  </div>
                                  {schedule.aiReasoning && (
                                    <div className="text-xs text-blue-600">
                                      {schedule.aiReasoning}
                                    </div>
                                  )}
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
    </div>
  );
};

export default WeeklySchedules;
