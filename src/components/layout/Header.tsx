
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/ui/theme-toggle';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-border/40 bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <SidebarTrigger />
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
