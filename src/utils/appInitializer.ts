
import { scheduleNightlyAnalysisAndSuggestions } from '@/services/aiScheduleOptimizer';
import { automaticUploadService } from '@/services/automaticUploadService';

export function initializeApp() {
  console.log('Initializing Astrumverse app...');
  
  // Start nightly AI analysis and suggestions
  scheduleNightlyAnalysisAndSuggestions();
  
  // Check if automatic upload service should be running
  const shouldRun = localStorage.getItem('astrumverse_auto_service_running');
  if (shouldRun === 'true') {
    automaticUploadService.start();
    console.log('Automatic upload service started');
  }
  
  console.log('App initialization complete');
}
