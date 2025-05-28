
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Upload from '@/pages/Upload';
import Analytics from '@/pages/Analytics';
import ContentSync from '@/pages/ContentSync';
import Platforms from '@/pages/Platforms';
import Media from '@/pages/Media';
import Secrets from '@/pages/Secrets';
import Content from '@/pages/Content';
import { Toaster } from '@/components/ui/toaster';

function App() {
  useEffect(() => {
    // Initialize real backend services
    const initializeServices = async () => {
      // Start analytics collection scheduler
      const { scheduleAnalyticsCollection } = await import('@/services/realAnalyticsService');
      scheduleAnalyticsCollection();
      
      // Start autonomous AI optimizer
      const { autonomousOptimizer } = await import('@/services/aiOptimizationService');
      console.log('Autonomous AI optimizer started');
      
      // Start publish scheduler
      const { startPublishScheduler } = await import('@/services/publishManager');
      startPublishScheduler();
      
      console.log('All backend services initialized');
    };
    
    initializeServices();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/content" element={<Content />} />
        <Route path="/content/sync" element={<ContentSync />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/platforms" element={<Platforms />} />
        <Route path="/media" element={<Media />} />
        <Route path="/secrets" element={<Secrets />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
