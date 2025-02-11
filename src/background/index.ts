/// <reference types="chrome"/>
import { ContentRating, Post, StorageData } from '../utils/types';
import { llamaService } from './llama-service';

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
      modelPath: 'models/small.gguf',
      modelType: 'default',
      inferenceSettings: {
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.9
      }
    },
    cachedRatings: {},
    userFeedback: {},
    isInitialized: false  // Track if extension has been set up
  };

  try {
    // Get existing storage data
    const storage = await chrome.storage.local.get('settings') as { settings?: StorageData };

    // If no settings exist or not initialized, set defaults and show setup
    if (!storage.settings || !storage.settings.isInitialized) {
      await chrome.storage.local.set({ settings: defaultSettings });
      // Open setup page
      await showSetupPage();
      return;
    }

    // If already initialized, proceed with normal startup
    await initializeLlamaService(storage.settings.modelSettings);
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    await showSetupPage();
  }
}

// Show the setup page
async function showSetupPage() {
  // Create setup tab
  const setupUrl = chrome.runtime.getURL('options.html?setup=true');
  await chrome.tabs.create({ url: setupUrl });
}

// Initialize Llama service with settings
async function initializeLlamaService(modelSettings: StorageData['modelSettings']) {
  try {
    await llamaService.initialize(modelSettings);
    console.log('Llama service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Llama service:', error);
    // Show setup page if initialization fails
    await showSetupPage();
  }
}

// Create a fallback rating when Llama service fails
function createFallbackRating(): ContentRating {
  return {
    overallScore: 50,
    contentQuality: {
      writingQuality: 5,
      informationDensity: 5,
      sourceCredibility: 5,
      originality: 5
    },
    emotionalImpact: {
      toxicityLevel: 5,
      emotionalManipulation: 5,
      socialHarmony: 5
    },
    userPreferences: {
      topicAlignment: 5,
      sourcePreference: 5,
      historicalInteraction: 5
    },
    timestamp: Date.now()
  };
}

// Download progress handler
async function downloadModel(modelType: string) {
  try {
    const modelUrls = {
      'fast': 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-GGUF/resolve/main/tinyllama-1.1b-chat-v0.3.Q4_K_M.gguf',
      'default': 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf',
      'accurate': 'https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf'
    };

    const url = modelUrls[modelType as keyof typeof modelUrls];
    if (!url) throw new Error('Invalid model type');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');

    const contentLength = Number(response.headers.get('Content-Length')) || 0;
    let receivedLength = 0;
    let result = await reader.read();

    while (!result.done) {
      receivedLength += result.value.length;
      const progress = (receivedLength / contentLength) * 100;

      // Send progress message
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_PROGRESS',
        modelType,
        progress
      });

      // TODO: Save chunks to IndexedDB or other storage
      result = await reader.read();
    }

    // Send completion message
    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_COMPLETE',
      modelType
    });

  } catch (error: unknown) {
    console.error('Failed to download model:', error);
    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_ERROR',
      modelType,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Message handling
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; modelType?: string; post?: Post },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (message.type === 'REQUEST_RATING') {
      if (!message.post) {
        console.error('No post data provided');
        return true;
      }
      const post: Post = message.post;

      // Check cache first
      chrome.storage.local.get(['cachedRatings', 'settings'], async (result) => {
        const cachedRatings = result.cachedRatings || {};
        const settings = result.settings;

        // If not initialized, return fallback rating
        if (!settings?.isInitialized) {
          sendResponse({ rating: createFallbackRating().overallScore, fallback: true });
          return;
        }

        if (cachedRatings[post.id]) {
          sendResponse({ rating: cachedRatings[post.id].overallScore });
        } else {
          try {
            // Generate rating using Llama
            const rating = await llamaService.analyzeContent(post);

            // Cache the rating
            cachedRatings[post.id] = rating;
            await chrome.storage.local.set({ cachedRatings });

            sendResponse({ rating: rating.overallScore });
          } catch (error) {
            console.error('Error analyzing content:', error);
            // Use fallback rating instead of failing
            const fallbackRating = createFallbackRating();
            sendResponse({ rating: fallbackRating.overallScore, fallback: true });
          }
        }
      });

      return true;
    }

    // Handle setup completion
    if (message.type === 'SETUP_COMPLETE') {
      (async () => {
        try {
          const { settings } = await chrome.storage.local.get('settings');
          if (settings) {
            // Initialize the Llama service with the saved settings
            await initializeLlamaService(settings.modelSettings);
            console.log('Setup completed successfully');
          }
        } catch (error) {
          console.error('Failed to complete setup:', error);
          await showSetupPage();
        }
      })();
      return true;
    }

    if (message.type === 'DOWNLOAD_MODEL' && message.modelType) {
      downloadModel(message.modelType);
      return true;
    }

    return true;
  }
);

// Handle settings changes
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.settings?.newValue?.modelSettings) {
    const settings = changes.settings.newValue;
    // Only update if initialization is complete
    if (settings.isInitialized) {
      try {
        await llamaService.unloadModel();
        await llamaService.initialize(settings.modelSettings);
        console.log('Model settings updated successfully');
      } catch (error) {
        console.error('Failed to update model settings:', error);
        // Show setup page if update fails
        await showSetupPage();
      }
    }
  }
});

// Initialize when installed
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
});