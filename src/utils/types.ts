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
  contentType?: ContentClassification;
  timestamp: number;
}

export interface ContentClassification {
  category: 'personal' | 'business' | 'tech' | 'finance' | 'news' | 'entertainment' | 'education' | 'advertisement' | 'promotion' | 'politics' | 'other';
  confidence: number;
}

// Post Types
export interface Post {
  id: string;
  platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin';
  content: string;
  author: string;
  timestamp: number;
  rating?: ContentRating;
  metadata?: {
    isSponsored?: boolean;
    isCompanyAccount?: boolean;
    hasPromotionalCTA?: boolean;
    hasExternalLinks?: boolean;
  };
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
  modelType: 'fast' | 'default' | 'accurate' | 'deepscaler' | 'tiny';
  inferenceSettings: {
    maxTokens: number;
    temperature: number;
    topP: number;
    contextLength?: number;  // Added for DeepScaleR's extended context support
  };
  backend?: 'ollama';  // Only Ollama backend supported
  ollamaModel?: string;
}

// Add DeepScaleR specific types
export interface DeepScalerConfig {
  contextSize: number;
  temperature: number;
  topP: number;
  maxTokens: number;
  groupSize?: number;  // For Group Relative Policy Optimization
}

// Storage Types
export interface StorageData {
  settings: FilterSettings;
  modelSettings: ModelSettings;
  cachedRatings: { [postId: string]: ContentRating };
  userFeedback: { [postId: string]: number };
  isInitialized: boolean;  // Track if extension has completed initial setup
  analytics?: {
    enableFeedAnalytics: boolean;
    linkedinOnly: boolean;
    maxStoredPosts: number;
  };
}