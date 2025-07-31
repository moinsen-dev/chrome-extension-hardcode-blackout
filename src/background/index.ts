/// <reference types="chrome"/>
import { ContentRating, Post, StorageData } from '../utils/types';
import { databaseService } from './database-service';
import { ollamaService } from './ollama-service';

// Check if we're in development mode
const isDevelopmentMode = () => {
  // Check for development flag in storage or use manifest version check
  return true; // For now, always enable development mode for testing
};

// Clean expired entries from cache
async function cleanupCache() {
  try {
    const { cachedRatings } = await chrome.storage.local.get('cachedRatings');
    if (!cachedRatings) return;
    
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [postId, rating] of Object.entries(cachedRatings)) {
      if (now - (rating as any).timestamp > CACHE_EXPIRY) {
        delete cachedRatings[postId];
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      await chrome.storage.local.set({ cachedRatings });
      console.log(`Startup cache cleanup: removed ${cleanedCount} expired entries`);
    }
  } catch (error) {
    console.error('Failed to cleanup cache:', error);
  }
}

// Initialize default settings
async function initializeStorage() {
  const defaultSettings: StorageData = {
    settings: {
      autoHideThreshold: 20,
      dimThreshold: 40,
      highlightThreshold: 80,
      weights: {
        contentQuality: 0.4,
        emotionalImpact: 0.3,
        userPreferences: 0.3
      }
    },
    modelSettings: {
      modelPath: 'models/default.gguf',
      modelType: 'default',
      inferenceSettings: {
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.9,
        contextLength: 2048  // Default context length
      },
      backend: 'ollama',  // Default to Ollama
      ollamaModel: 'llama3.2'  // Default Ollama model
    },
    cachedRatings: {},
    userFeedback: {},
    isInitialized: false,  // Track if extension has been set up
    analytics: {
      enableFeedAnalytics: true,  // Default enabled
      linkedinOnly: true,
      maxStoredPosts: 10000
    }
  };

  try {
    // Get existing storage data
    const storage = await chrome.storage.local.get('settings') as { settings?: StorageData };

    // In development mode, always initialize the service
    if (isDevelopmentMode()) {
      console.log('Development mode: Bypassing setup requirement');
      
      // Use existing settings or defaults
      const settings = storage.settings || defaultSettings;
      
      // Mark as initialized for development
      settings.isInitialized = true;
      
      // Save settings
      await chrome.storage.local.set({ settings });
      
      // Clean cache on startup
      await cleanupCache();
      
      // Initialize database service for analytics
      await initializeDatabaseService();
      
      // Check Ollama availability on startup
      await ollamaService.checkAvailability();
      
      console.log('Development mode: Service initialized successfully');
      return;
    }

    // Production mode: check if setup is needed
    if (!storage.settings || !storage.settings.isInitialized) {
      await chrome.storage.local.set({ settings: defaultSettings });
      // Open setup page
      await showSetupPage();
      return;
    }

    // If already initialized, proceed with normal startup
    await cleanupCache();
    await initializeDatabaseService();
    await ollamaService.checkAvailability();
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    
    // In development mode, try to continue with defaults
    if (isDevelopmentMode()) {
      console.log('Development mode: Using default settings after error');
      defaultSettings.isInitialized = true;
      await chrome.storage.local.set({ settings: defaultSettings });
    } else {
      await showSetupPage();
    }
  }
}

// Show the setup page
async function showSetupPage() {
  // Create setup tab
  const setupUrl = chrome.runtime.getURL('options.html?setup=true');
  await chrome.tabs.create({ url: setupUrl });
}


// Initialize database service for feed analytics
async function initializeDatabaseService() {
  try {
    console.log('Initializing database service for feed analytics...');
    await databaseService.initialize();
    console.log('Database service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database service:', error);
    // Analytics are optional, so we don't block extension startup
  }
}

// Create a fallback rating when Llama service fails
function createFallbackRating(): ContentRating {
  // Generate more realistic varied ratings for development/fallback mode
  const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Generate individual scores with some correlation
  const baseQuality = randomRange(3, 8);
  const contentQuality = {
    writingQuality: Math.max(1, Math.min(10, baseQuality + randomRange(-2, 2))),
    informationDensity: Math.max(1, Math.min(10, baseQuality + randomRange(-2, 2))),
    sourceCredibility: Math.max(1, Math.min(10, baseQuality + randomRange(-1, 2))),
    originality: Math.max(1, Math.min(10, baseQuality + randomRange(-3, 1)))
  };
  
  const emotionalBase = randomRange(4, 7);
  const emotionalImpact = {
    toxicityLevel: Math.max(1, Math.min(10, emotionalBase + randomRange(-2, 2))),
    emotionalManipulation: Math.max(1, Math.min(10, emotionalBase + randomRange(-1, 2))),
    socialHarmony: Math.max(1, Math.min(10, emotionalBase + randomRange(-1, 3)))
  };
  
  const preferenceBase = randomRange(3, 8);
  const userPreferences = {
    topicAlignment: Math.max(1, Math.min(10, preferenceBase + randomRange(-2, 2))),
    sourcePreference: Math.max(1, Math.min(10, preferenceBase + randomRange(-1, 2))),
    historicalInteraction: Math.max(1, Math.min(10, preferenceBase + randomRange(-2, 1)))
  };
  
  // Calculate weighted overall score
  const weights = { contentQuality: 0.4, emotionalImpact: 0.3, userPreferences: 0.3 };
  const contentScore = Object.values(contentQuality).reduce((a, b) => a + b, 0) / 4;
  const emotionalScore = Object.values(emotionalImpact).reduce((a, b) => a + b, 0) / 3;
  const preferenceScore = Object.values(userPreferences).reduce((a, b) => a + b, 0) / 3;
  
  const overallScore = Math.round(
    (contentScore * weights.contentQuality +
     emotionalScore * weights.emotionalImpact +
     preferenceScore * weights.userPreferences) * 10
  );
  
  // Generate random content classification
  const categories = ['personal', 'business', 'tech', 'finance', 'news', 'entertainment', 'education', 'advertisement', 'promotion', 'politics', 'other'] as const;
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    overallScore: Math.max(20, Math.min(90, overallScore)), // Clamp between 20-90
    contentQuality,
    emotionalImpact,
    userPreferences,
    contentType: {
      category,
      confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0 confidence
    },
    timestamp: Date.now()
  };
}


// Message handling
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; modelType?: string; post?: Post; data?: any },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (message.type === 'REQUEST_RATING') {
      console.log('REQUEST_RATING received:', { 
        postId: message.post?.id,
        platform: message.post?.platform,
        contentLength: message.post?.content?.length
      });
      
      if (!message.post) {
        console.error('No post data provided');
        return true;
      }
      const post: Post = message.post;

      // Handle the rating request asynchronously
      (async () => {
        try {
          // Get storage data
          const result = await chrome.storage.local.get(['cachedRatings', 'settings']);
          const cachedRatings = result.cachedRatings || {};
          const settings = result.settings;

          console.log('Storage check:', {
            hasSettings: !!settings,
            isInitialized: settings?.isInitialized,
            isDev: isDevelopmentMode(),
            hasCachedRating: !!cachedRatings[post.id]
          });

          // In development mode or if initialized, proceed with analysis
          if (!settings?.isInitialized && !isDevelopmentMode()) {
            console.log('Extension not initialized and not in development mode');
            sendResponse({ rating: createFallbackRating().overallScore, fallback: true });
            return;
          }

          // Check cache first with expiration check
          if (cachedRatings[post.id]) {
            const cachedRating = cachedRatings[post.id];
            const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
            const isExpired = Date.now() - cachedRating.timestamp > CACHE_EXPIRY;
            
            if (!isExpired) {
              console.log('Returning cached rating for post:', post.id);
              sendResponse({ 
                rating: cachedRating.overallScore, 
                contentType: cachedRating.contentType,
                cached: true 
              });
              return;
            } else {
              console.log('Cached rating expired for post:', post.id);
              delete cachedRatings[post.id];
            }
          }

          // Generate new rating
          console.log('Generating new rating for post:', post.id);
          try {
            let rating: ContentRating;
            
            // Check if Ollama is available
            if (ollamaService.isOllamaAvailable()) {
              console.log('Using Ollama for content analysis');
              const modelName = settings?.modelSettings?.ollamaModel || 'llama3.2';
              rating = await ollamaService.analyzeContent(post, modelName);
            } else {
              throw new Error('Ollama is not available. Please ensure Ollama is running.');
            }
            
            console.log('Rating generated:', {
              postId: post.id,
              overallScore: rating.overallScore,
              timestamp: rating.timestamp
            });

            // Cache the rating with size limit
            cachedRatings[post.id] = rating;
            
            // Implement cache size limit (1000 entries max)
            const cacheKeys = Object.keys(cachedRatings);
            const MAX_CACHE_SIZE = 1000;
            
            if (cacheKeys.length > MAX_CACHE_SIZE) {
              // Remove oldest entries (by timestamp)
              const sortedKeys = cacheKeys.sort((a, b) => 
                cachedRatings[a].timestamp - cachedRatings[b].timestamp
              );
              
              const keysToRemove = sortedKeys.slice(0, cacheKeys.length - MAX_CACHE_SIZE);
              keysToRemove.forEach(key => delete cachedRatings[key]);
              
              console.log(`Cleaned cache: removed ${keysToRemove.length} old entries`);
            }
            
            await chrome.storage.local.set({ cachedRatings });

            sendResponse({ 
              rating: rating.overallScore,
              contentType: rating.contentType 
            });
          } catch (error) {
            console.error('Error analyzing content:', error);
            // Use fallback rating and still cache it
            const fallbackRating = createFallbackRating();
            console.log('Using fallback rating due to error');
            
            // Cache the fallback rating too so stats are updated
            cachedRatings[post.id] = fallbackRating;
            await chrome.storage.local.set({ cachedRatings });
            
            sendResponse({ 
              rating: fallbackRating.overallScore, 
              contentType: fallbackRating.contentType,
              fallback: true 
            });
          }
        } catch (error) {
          console.error('Error in REQUEST_RATING handler:', error);
          sendResponse({ rating: createFallbackRating().overallScore, fallback: true });
        }
      })();

      return true;
    }

    // Handle setup completion
    if (message.type === 'SETUP_COMPLETE') {
      console.log('Setup completed successfully');
      return true;
    }


    // Handle feed analytics messages
    if (message.type === 'FEED_ITEM_DETECTED') {
      (async () => {
        try {
          console.log('FEED_ITEM_DETECTED received:', message.data?.id);
          
          // Check if analytics are enabled
          const { settings } = await chrome.storage.local.get('settings');
          const analyticsEnabled = settings?.analytics?.enableFeedAnalytics ?? true;
          
          if (!analyticsEnabled) {
            sendResponse({ success: false, error: 'Analytics disabled' });
            return;
          }
          
          // Store the feed item
          const result = await databaseService.insertFeedItem(message.data);
          console.log('Feed item stored:', result);
          
          sendResponse({ success: true, result });
        } catch (error) {
          console.error('Error storing feed item:', error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
      })();
      return true;
    }
    
    if (message.type === 'GET_STATISTICS') {
      (async () => {
        try {
          const stats = await databaseService.getStatistics();
          sendResponse({ success: true, stats });
        } catch (error) {
          console.error('Error getting statistics:', error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
      })();
      return true;
    }

    if (message.type === 'CHECK_OLLAMA') {
      (async () => {
        try {
          const isAvailable = await ollamaService.checkAvailability();
          const models = ollamaService.getAvailableModels();
          sendResponse({ 
            success: true, 
            available: isAvailable,
            models: models 
          });
        } catch (error) {
          console.error('Error checking Ollama:', error);
          sendResponse({ 
            success: false, 
            available: false,
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      })();
      return true;
    }

    return true;
  }
);


// Initialize when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, initializing...');
  initializeStorage();
});

// Initialize on startup (for development reloads)
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started, initializing...');
  initializeStorage();
});

// Initialize immediately when the background script loads
// This ensures the service is ready even after manual reloads during development
console.log('Background script loaded, initializing...');
initializeStorage();