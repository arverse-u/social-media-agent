
import { checkPlatformApiKeys } from './platformApiCheck';

export interface PlatformToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  autoPublish: boolean;
  hasApiKeys: boolean;
}

export interface WeeklySchedule {
  id: string;
  platformId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string;
  contentType: 'blog' | 'feed' | 'reel';
  aiReasoning: string;
  createdAt: string;
  enabled: boolean;
}

const PLATFORM_TOGGLES_KEY = 'astrumverse_platform_toggles';
const SCHEDULES_KEY = 'astrumverse_schedules';

// Default platform configurations
const defaultPlatforms: PlatformToggle[] = [
  {
    id: 'hashnode',
    name: 'Hashnode',
    description: 'Technical blog publishing platform',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
  {
    id: 'devTo',
    name: 'Dev.to',
    description: 'Developer community platform',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Social media microblogging',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking platform',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Visual content sharing platform',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Video content platform',
    enabled: false,
    autoPublish: false,
    hasApiKeys: false,
  },
];

class PlatformToggleService {
  getAll(): PlatformToggle[] {
    const stored = localStorage.getItem(PLATFORM_TOGGLES_KEY);
    let platforms = stored ? JSON.parse(stored) : defaultPlatforms;
    
    // Update API key status for each platform
    platforms = platforms.map((platform: PlatformToggle) => ({
      ...platform,
      hasApiKeys: checkPlatformApiKeys(platform.id as any),
    }));
    
    return platforms;
  }

  update(platform: PlatformToggle): void {
    const platforms = this.getAll();
    const index = platforms.findIndex(p => p.id === platform.id);
    if (index !== -1) {
      platforms[index] = { ...platform, hasApiKeys: checkPlatformApiKeys(platform.id as any) };
      localStorage.setItem(PLATFORM_TOGGLES_KEY, JSON.stringify(platforms));
    }
  }

  reset(): void {
    localStorage.removeItem(PLATFORM_TOGGLES_KEY);
  }
}

class ScheduleService {
  getAll(): WeeklySchedule[] {
    const stored = localStorage.getItem(SCHEDULES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  add(schedule: WeeklySchedule): void {
    const schedules = this.getAll();
    schedules.push(schedule);
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  }

  update(updatedSchedule: WeeklySchedule): void {
    const schedules = this.getAll();
    const index = schedules.findIndex(s => s.id === updatedSchedule.id);
    if (index !== -1) {
      schedules[index] = updatedSchedule;
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
    }
  }

  delete(scheduleId: string): void {
    const schedules = this.getAll();
    const filtered = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(filtered));
  }

  getByPlatform(platformId: string): WeeklySchedule[] {
    return this.getAll().filter(schedule => schedule.platformId === platformId);
  }

  reset(): void {
    localStorage.removeItem(SCHEDULES_KEY);
  }
}

// Export service instances
export const getPlatformToggleService = () => new PlatformToggleService();
export const getScheduleService = () => new ScheduleService();
