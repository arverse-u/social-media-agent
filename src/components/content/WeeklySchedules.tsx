
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  selectedDays: string[];
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
  const [newScheduleData, setNewScheduleData] = useState<{[key: string]: {selectedDays: string[], time: string}}>({});
  const { toast } = useToast();

  const dayOptions = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
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

  const handleCreateSchedule = (platformId: string) => {
    const scheduleData = newScheduleData[platformId];
    if (!scheduleData || scheduleData.selectedDays.length === 0 || !scheduleData.time) {
      toast({
        title: 'Invalid schedule',
        description: 'Please select at least one day and set a time',
        variant: 'destructive'
      });
      return;
    }

    const newSchedule: WeeklySchedule = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      platformId,
      selectedDays: scheduleData.selectedDays,
      time: scheduleData.time,
      enabled: true,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    saveSchedules(updatedSchedules);
    
    // Reset the form data
    setNewScheduleData(prev => ({
      ...prev,
      [platformId]: { selectedDays: [], time: '09:00' }
    }));
    
    toast({
      title: 'Schedule created',
      description: `New schedule created for ${scheduleData.selectedDays.join(', ')} at ${scheduleData.time}`,
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

  const handleDaySelection = (platformId: string, day: string, checked: boolean) => {
    setNewScheduleData(prev => {
      const currentData = prev[platformId] || { selectedDays: [], time: '09:00' };
      const updatedDays = checked 
        ? [...currentData.selectedDays, day]
        : currentData.selectedDays.filter(d => d !== day);
      
      return {
        ...prev,
        [platformId]: {
          ...currentData,
          selectedDays: updatedDays
        }
      };
    });
  };

  const handleTimeChange = (platformId: string, time: string) => {
    setNewScheduleData(prev => ({
      ...prev,
      [platformId]: {
        ...(prev[platformId] || { selectedDays: [] }),
        time
      }
    }));
  };

  const getPlatformSchedules = (platformId: string) => {
    return schedules.filter(schedule => schedule.platformId === platformId);
  };

  const getPlatformSetting = (platformId: string) => {
    return platformSettings.find(s => s.platformId === platformId) || { postsPerDay: 1, enabled: true };
  };

  const formatDays = (selectedDays: string[]) => {
    return selectedDays.map(day => dayOptions.find(d => d.value === day)?.label).join(', ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Weekly Schedules</h3>
        <p className="text-muted-foreground">Create posting schedules by selecting specific days and times for each platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.filter(p => p.enabled).map((platform) => {
          const platformSchedules = getPlatformSchedules(platform.id);
          const platformSetting = getPlatformSetting(platform.id);
          const currentScheduleData = newScheduleData[platform.id] || { selectedDays: [], time: '09:00' };
          
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
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Create New Schedule
                  </Label>
                  
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                    <div>
                      <Label className="text-sm">Select Days</Label>
                      <div className="grid grid-cols-7 gap-1 mt-2">
                        {dayOptions.map((day) => (
                          <div key={day.value} className="flex flex-col items-center">
                            <Checkbox
                              id={`${platform.id}-${day.value}`}
                              checked={currentScheduleData.selectedDays.includes(day.value)}
                              onCheckedChange={(checked) => handleDaySelection(platform.id, day.value, checked as boolean)}
                            />
                            <Label htmlFor={`${platform.id}-${day.value}`} className="text-xs mt-1">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-sm">Time</Label>
                        <Input
                          type="time"
                          value={currentScheduleData.time}
                          onChange={(e) => handleTimeChange(platform.id, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleCreateSchedule(platform.id)}
                        disabled={!platform.hasApiKeys || currentScheduleData.selectedDays.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Active Schedules ({platformSchedules.length})
                    </Label>
                  </div>
                  
                  {platformSchedules.length === 0 ? (
                    <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No schedules created</p>
                      <p className="text-xs text-muted-foreground">Create your first schedule above</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {platformSchedules.map((schedule) => (
                        <Card key={schedule.id} className="bg-muted/50">
                          <CardContent className="p-3">
                            {editingSchedule === schedule.id ? (
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm">Select Days</Label>
                                  <div className="grid grid-cols-7 gap-1 mt-2">
                                    {dayOptions.map((day) => (
                                      <div key={day.value} className="flex flex-col items-center">
                                        <Checkbox
                                          id={`edit-${schedule.id}-${day.value}`}
                                          checked={schedule.selectedDays.includes(day.value)}
                                          onCheckedChange={(checked) => {
                                            const updatedDays = checked 
                                              ? [...schedule.selectedDays, day.value]
                                              : schedule.selectedDays.filter(d => d !== day.value);
                                            handleUpdateSchedule(schedule.id, { selectedDays: updatedDays });
                                          }}
                                        />
                                        <Label htmlFor={`edit-${schedule.id}-${day.value}`} className="text-xs mt-1">
                                          {day.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="time"
                                    value={schedule.time}
                                    onChange={(e) => handleUpdateSchedule(schedule.id, { time: e.target.value })}
                                    className="text-sm"
                                  />
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
                                    {formatDays(schedule.selectedDays)} at {schedule.time}
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
