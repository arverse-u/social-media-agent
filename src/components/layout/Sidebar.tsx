
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar as SidebarContainer, 
  SidebarHeader, 
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Icons.dashboard, label: 'Dashboard', tooltip: 'Dashboard' },
    { path: '/content', icon: Icons.content, label: 'Manual Upload', tooltip: 'Manual Upload' },
    { path: '/content/sync', icon: Icons.upload, label: 'Automatic Upload', tooltip: 'Automatic Upload' },
    { path: '/platforms', icon: Icons.platforms, label: 'Platforms', tooltip: 'Platforms' },
    { path: '/analytics', icon: Icons.analytics, label: 'Analytics', tooltip: 'Analytics' },
    { path: '/media', icon: Icons.media, label: 'Media', tooltip: 'Media' },
    { path: '/secrets', icon: Icons.secrets, label: 'Secrets', tooltip: 'Secrets' },
    { path: '/settings', icon: Icons.settings, label: 'Settings', tooltip: 'Settings' },
  ];

  return (
    <SidebarContainer className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-astrum-purple to-astrum-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="font-bold text-xl bg-gradient-to-r from-astrum-purple to-astrum-teal bg-clip-text text-transparent">
            ASTRUMVERSE
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild tooltip={item.tooltip} className="w-full">
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isActive 
                        ? "bg-gradient-to-r from-astrum-purple/10 to-astrum-teal/10 text-astrum-purple border border-astrum-purple/20 shadow-sm" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-astrum-purple" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isActive ? "text-astrum-purple font-semibold" : ""
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-astrum-purple rounded-full animate-pulse" />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
