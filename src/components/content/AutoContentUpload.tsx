
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Clock, Plus, Trash2, Edit, Bot, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getPlatformToggleService, 
  getScheduleService, 
  PlatformToggle, 
  WeeklySchedule 
} from '@/services/platformToggleService';

const AutoContentUpload = () => {
  const [platforms, setPlatforms] = useState<PlatformToggle[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const { toast } = useToast();
  
  const platformToggleService = getPlatformToggleService();
  const scheduleService = getScheduleService();

  useEffect(() => {
    // Load platforms and schedules
    setPlatforms(platformToggleService.getAll());
    setSchedules(scheduleService.getAll());
  }, []);

  const handlePlatformToggle = (platformId: string) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    );
    
    setPlatforms(updatedPlatforms);
    
    const platform = updatedPlatforms.find(p => p.id === platformId);
    if (platform) {
      platformToggleService.update(platform);
      
      toast({
        title: `${platform.name} ${platform.enabled ? 'enabled' : 'disabled'}`,
        description: `Auto-publishing for ${platform.name} has been ${platform.enabled ? 'enabled' : 'disabled'}`,
      });
    }
  };

  const handleAutoPublishToggle = (platformId: string) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, autoPublish: !platform.autoPublish }
        : platform
    );
    
    setPlatforms(updatedPlatforms);
    
    const platform = updatedPlatforms.find(p => p.id === platformId);
    if (platform) {
      platformToggleService.update(platform);
      
      toast({
        title: `Auto-publish ${platform.autoPublish ? 'enabled' : 'disabled'}`,
        description: `Automatic publishing for ${platform.name} has been ${platform.autoPublish ? 'enabled' : 'disabled'}`,
      });
    }
  };

  const handleAddSchedule = (platformId: string) => {
    const newSchedule: WeeklySchedule = {
      id: `schedule-${Date.now()}`,
      platformId,
      dayOfWeek: 'monday',
      time: '09:00',
      contentType: 'blog',
      aiReasoning: 'Optimal time for professional content engagement',
      createdAt: new Date().toISOString(),
      enabled: true
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    scheduleService.add(newSchedule);
    
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
    
    setSchedules(updatedSchedules);
    
    const schedule = updatedSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      scheduleService.update(schedule);
      
      toast({
        title: 'Schedule updated',
        description: 'Weekly schedule has been modified',
      });
    }
    
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    setSchedules(updatedSchedules);
    scheduleService.delete(scheduleId);
    
    toast({
      title: 'Schedule deleted',
      description: 'Weekly schedule has been removed',
    });
  };

  const getPlatformSchedules = (platformId: string) => {
    return schedules.filter(schedule => schedule.platformId === platformId);
  };

  const getDayOptions = () => [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const getContentTypeOptions = () => [
    { value: 'blog', label: 'Blog Posts' },
    { value: 'feed', label: 'Social Posts' },
    { value: 'reel', label: 'Video Content' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white">Automatic Upload</h2>
          <p className="text-muted-foreground">Configure autonomous content publishing with AI optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const platformSchedules = getPlatformSchedules(platform.id);
          
          return (
            <Card key={platform.id} className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${platform.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {platform.name}
                        {platform.enabled && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/40">
                            Active
                          </Badge>
                        )}
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
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Publish</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically publish content without manual approval
                    </p>
                  </div>
                  <Switch 
                    checked={platform.autoPublish} 
                    onCheckedChange={() => handleAutoPublishToggle(platform.id)}
                    disabled={!platform.enabled}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Weekly Schedules
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddSchedule(platform.id)}
                      disabled={!platform.enabled}
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
                                    className="p-2 border rounded text-sm"
                                  >
                                    {getDayOptions().map(day => (
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
                                <select 
                                  value={schedule.contentType}
                                  onChange={(e) => handleUpdateSchedule(schedule.id, { contentType: e.target.value as any })}
                                  className="w-full p-2 border rounded text-sm"
                                >
                                  {getContentTypeOptions().map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
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
                                    {getDayOptions().find(d => d.value === schedule.dayOfWeek)?.label} at {schedule.time}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getContentTypeOptions().find(t => t.value === schedule.contentType)?.label}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <Bot className="h-3 w-3" />
                                    {schedule.aiReasoning}
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
    </div>
  );
};

export default AutoContentUpload;
