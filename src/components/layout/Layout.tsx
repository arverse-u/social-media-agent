
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex cosmic-bg dark:bg-slate-950">
        <Sidebar />
        <SidebarInset className="bg-transparent">
          <Header />
          <main className="container py-6 px-4 md:px-6">
            {children}
          </main>
          <Toaster />
          <Sonner />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
