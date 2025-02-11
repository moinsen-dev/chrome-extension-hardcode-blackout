import { ContentRating, Post, StorageData } from '../utils/types';

// Temporary mock rating function until we integrate Llama
function mockRateContent(post: Post): ContentRating {
  // Generate somewhat random but consistent ratings for testing
  const hash = Array.from(post.content).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const normalizeScore = (n: number): number => Math.min(10, Math.max(0, Math.abs(Math.sin(n)) * 10));

  const contentQuality = {
    writingQuality: normalizeScore(hash * 0.1),
    informationDensity: normalizeScore(hash * 0.2),
    sourceCredibility: normalizeScore(hash * 0.3),
    originality: normalizeScore(hash * 0.4)
  };

  const emotionalImpact = {
    toxicityLevel: normalizeScore(hash * 0.5),
    emotionalManipulation: normalizeScore(hash * 0.6),
    socialHarmony: normalizeScore(hash * 0.7)
  };

  const userPreferences = {
    topicAlignment: normalizeScore(hash * 0.8),
    sourcePreference: normalizeScore(hash * 0.9),
    historicalInteraction: normalizeScore(hash * 1.0)
  };

  // Calculate overall score (0-100)
  const overallScore = Math.round(
    (Object.values(contentQuality).reduce((a, b) => a + b) * 4 +
     Object.values(emotionalImpact).reduce((a, b) => a + b) * 3 +
     Object.values(userPreferences).reduce((a, b) => a + b) * 3
    ) / 10
  );

  return {
    overallScore,
    contentQuality,
    emotionalImpact,
    userPreferences,
    timestamp: Date.now()
  };
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
      modelPath: '',
      modelType: 'default',
      inferenceSettings: {
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.9
      }
    },
    cachedRatings: {},
    userFeedback: {}
  };

  const storage = await chrome.storage.local.get('settings');
  if (!storage.settings) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REQUEST_RATING') {
    const post: Post = message.post;

    // Check cache first
    chrome.storage.local.get(['cachedRatings'], async (result) => {
      const cachedRatings = result.cachedRatings || {};

      if (cachedRatings[post.id]) {
        sendResponse({ rating: cachedRatings[post.id] });
      } else {
        // Generate rating (mock for now)
        const rating = mockRateContent(post);

        // Cache the rating
        cachedRatings[post.id] = rating;
        await chrome.storage.local.set({ cachedRatings });

        sendResponse({ rating: rating.overallScore });
      }
    });

    // Keep the message channel open for async response
    return true;
  }
});

// Initialize when installed
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
});