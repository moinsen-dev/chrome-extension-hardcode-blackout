// Rating Types
export interface ContentQuality {
  writingQuality: number;
  informationDensity: number;
  sourceCredibility: number;
  originality: number;
}

export interface EmotionalImpact {
  toxicityLevel: number;
  emotionalManipulation: number;
  socialHarmony: number;
}

export interface UserPreferences {
  topicAlignment: number;
  sourcePreference: number;
  historicalInteraction: number;
}

export interface ContentRating {
  overallScore: number;
  contentQuality: ContentQuality;
  emotionalImpact: EmotionalImpact;
  userPreferences: UserPreferences;
  timestamp: number;
}

// Post Types
export interface Post {
  id: string;
  platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin';
  content: string;
  author: string;
  timestamp: number;
  rating?: ContentRating;
}

// UI Types
export type ColorCode = '🟢' | '🟡' | '🟡' | '🟠' | '🔴';

export interface RatingDisplay {
  score: number;
  color: ColorCode;
  summary: string;
}

// Settings Types
export interface FilterSettings {
  autoHideThreshold: number;
  dimThreshold: number;
  highlightThreshold: number;
  weights: {
    contentQuality: number;
    emotionalImpact: number;
    userPreferences: number;
  };
}

export interface ModelSettings {
  modelPath: string;
  modelType: string;
  inferenceSettings: {
    maxTokens: number;
    temperature: number;
    topP: number;
  };
}

// Storage Types
export interface StorageData {
  settings: FilterSettings;
  modelSettings: ModelSettings;
  cachedRatings: { [postId: string]: ContentRating };
  userFeedback: { [postId: string]: number };
  isInitialized: boolean;  // Track if extension has completed initial setup
}