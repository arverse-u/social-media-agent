
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, Save, X, Clock, Bot } from 'lucide-react';

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  hasApiKeys: boolean;
}

interface WeeklySchedule {
  id: string;
  platformId: string;
  dayOfWeek: string;
  time: string;
  postsPerDay: number;
  enabled: boolean;
  createdByAI: boolean;
  aiReasoning?: string;
}

interface WeeklySchedulesProps {
  platforms: PlatformConfig[];
  aiOptimizationEnabled: boolean;
}

const WeeklySchedules: React.FC<WeeklySchedulesProps> = ({ platforms, aiOptimizationEnabled }) => {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [isGeneratingAISchedules, setIsGeneratingAISchedules] = useState(false);
  const { toast } = useToast();

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    loadSchedules();
    
    // If AI optimization is enabled, generate schedules
    if (aiOptimizationEnabled && platforms.length > 0) {
      generateAISchedules();
    }

    // Set up hourly statistics checking
    const interval = setInterval(() => {
      if (aiOptimizationEnabled) {
        checkAndOptimizeSchedules();
      }
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [platforms, aiOptimizationEnabled]);

  const loadSchedules = () => {
    const stored = localStorage.getItem('astrumverse_weekly_schedules');
    if (stored) {
      setSchedules(JSON.parse(stored));
    }
  };

  const saveSchedules = (newSchedules: WeeklySchedule[]) => {
    localStorage.setItem('astrumverse_weekly_schedules', JSON.stringify(newSchedules));
    setSchedules(newSchedules);
  };

  const generateAISchedules = async () => {
    setIsGeneratingAISchedules(true);
    
    try {
      // Call AI service to generate optimal schedules
      const { generateOptimalSchedules } = await import('@/services/aiScheduleOptimizer');
      const aiSchedules = await generateOptimalSchedules(platforms);
      
      // Merge with existing manual schedules
      const existingManualSchedules = schedules.filter(s => !s.createdByAI);
      const newSchedules = [...existingManualSchedules, ...aiSchedules];
      
      saveSchedules(newSchedules);
      
      toast({
        title: 'AI schedules generated',
        description: `Generated ${aiSchedules.length} optimal schedules based on platform analytics`,
      });
    } catch (error) {
      console.error('Error generating AI schedules:', error);
      toast({
        title: 'Failed to generate AI schedules',
        description: 'Unable to generate optimal schedules at this time',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAISchedules(false);
    }
  };

  const checkAndOptimizeSchedules = async () => {
    try {
      const { optimizeExistingSchedules } = await import('@/services/aiScheduleOptimizer');
      const optimizedSchedules = await optimizeExistingSchedules(schedules, platforms);
      
      if (optimizedSchedules.length > 0) {
        saveSchedules(optimizedSchedules);
        console.log('Schedules optimized based on latest analytics');
      }
    } catch (error) {
      console.error('Error optimizing schedules:', error);
    }
  };

  const addManualSchedule = (platformId: string) => {
    const newSchedule: WeeklySchedule = {
      id: `schedule-${Date.now()}`,
      platformId,
      dayOfWeek: 'monday',
      time: '09:00',
      postsPerDay: 1,
      enabled: true,
      createdByAI: false,
    };
    
    const newSchedules = [...schedules, newSchedule];
    saveSchedules(newSchedules);
    
    toast({
      title: 'Schedule added',
      description: 'New manual schedule created',
    });
  };

  const updateSchedule = (scheduleId: string, updates: Partial<WeeklySchedule>) => {
    const newSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, ...updates }
        : schedule
    );
    
    saveSchedules(newSchedules);
    setEditingSchedule(null);
    
    toast({
      title: 'Schedule updated',
      description: 'Schedule has been modified',
    });
  };

  const deleteSchedule = (scheduleId: string) => {
    const newSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    saveSchedules(newSchedules);
    
    toast({
      title: 'Schedule deleted',
      description: 'Schedule has been removed',
    });
  };

  const toggleSchedule = (scheduleId: string) => {
    const newSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    );
    
    saveSchedules(newSchedules);
  };

  const getPlatformSchedules = (platformId: string) => {
    return schedules.filter(schedule => schedule.platformId === platformId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white">Weekly Schedules</h3>
          <p className="text-muted-foreground">Manage posting schedules for each platform</p>
        </div>
        {aiOptimizationEnabled && (
          <Button 
            onClick={generateAISchedules}
            disabled={isGeneratingAISchedules}
            className="bg-astrum-purple hover:bg-astrum-purple/80"
          >
            <Bot className="h-4 w-4 mr-2" />
            {isGeneratingAISchedules ? 'Generating...' : 'Regenerate AI Schedules'}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => {
          const platformSchedules = getPlatformSchedules(platform.id);
          
          return (
            <Card key={platform.id} className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{platform.name}</CardTitle>
                    <CardDescription>
                      {platformSchedules.length} schedule(s) configured
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addManualSchedule(platform.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Schedule
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {platformSchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No schedules configured</p>
                ) : (
                  <div className="space-y-3">
                    {platformSchedules.map((schedule) => (
                      <Card key={schedule.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          {editingSchedule === schedule.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Day of Week</Label>
                                  <Select 
                                    value={schedule.dayOfWeek}
                                    onValueChange={(value) => updateSchedule(schedule.id, { dayOfWeek: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {daysOfWeek.map(day => (
                                        <SelectItem key={day.value} value={day.value}>
                                          {day.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Time</Label>
                                  <Input
                                    type="time"
                                    value={schedule.time}
                                    onChange={(e) => updateSchedule(schedule.id, { time: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Posts per Day</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={schedule.postsPerDay}
                                  onChange={(e) => updateSchedule(schedule.id, { postsPerDay: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => setEditingSchedule(null)}>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingSchedule(null)}>
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {daysOfWeek.find(d => d.value === schedule.dayOfWeek)?.label} at {schedule.time}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({schedule.postsPerDay} post{schedule.postsPerDay !== 1 ? 's' : ''}/day)
                                  </span>
                                  {schedule.createdByAI && (
                                    <Bot className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                {schedule.aiReasoning && (
                                  <p className="text-xs text-blue-600">{schedule.aiReasoning}</p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={schedule.enabled}
                                    onCheckedChange={() => toggleSchedule(schedule.id)}
                                    size="sm"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {schedule.enabled ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingSchedule(schedule.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklySchedules;
