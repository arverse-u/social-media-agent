
import { initializeDatabase } from '@/services/databaseService';

/**
 * Initialize the application on first load
 * - Set up database defaults
 * - Check for API keys
 * - Apply any needed migrations
 */
export const initializeApp = () => {
  // Initialize database with defaults if needed
  initializeDatabase();
  
  // Check for any needed data migrations
  migrateDataIfNeeded();
  
  // Future initialization steps can be added here
  console.log('Application initialized');
};

/**
 * Perform any needed data migrations for version updates
 */
const migrateDataIfNeeded = () => {
  const STORAGE_PREFIX = 'astrumverse_';
  const CURRENT_VERSION = '1.0.0';
  const storedVersion = localStorage.getItem(`${STORAGE_PREFIX}version`);
  
  if (storedVersion !== CURRENT_VERSION) {
    // Perform migrations here
    
    // Migration: Update content category names (article → blog, video → reel)
    try {
      const contentItems = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}content_items`) || '[]');
      const updatedItems = contentItems.map((item: any) => {
        if (item.category === 'article') {
          item.category = 'blog';
        }
        if (item.contentType === 'article') {
          item.contentType = 'blog';
        }
        if (item.category === 'video') {
          item.category = 'reel';
        }
        if (item.contentType === 'video') {
          item.contentType = 'reel';
        }
        return item;
      });
      localStorage.setItem(`${STORAGE_PREFIX}content_items`, JSON.stringify(updatedItems));
    } catch (e) {
      console.error('Error migrating content items:', e);
    }
    
    // Store current version after migration
    localStorage.setItem(`${STORAGE_PREFIX}version`, CURRENT_VERSION);
  }
};

// Call initialization on import
initializeApp();
