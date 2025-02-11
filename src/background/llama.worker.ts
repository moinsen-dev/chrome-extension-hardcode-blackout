import { LlamaConfig } from '../llama-wasm/llama-interface';
import { createLlamaModule } from '../llama-wasm/llama-wasm';
import { ContentRating, ModelSettings } from '../utils/types';

declare const self: DedicatedWorkerGlobalScope;

let llamaModule: Awaited<ReturnType<typeof createLlamaModule>> | null = null;
let currentSettings: ModelSettings | null = null;

// Initialize the Llama module
async function initializeLlama(settings: ModelSettings) {
  try {
    const config: LlamaConfig = {
      modelPath: settings.modelPath,
      contextSize: 2048,
      threads: navigator.hardwareConcurrency || 4,
      batchSize: 512,
      temperature: settings.inferenceSettings.temperature,
      topP: settings.inferenceSettings.topP,
      topK: 40,
      repeatPenalty: 1.1,
      lastTokensSize: 64
    };

    llamaModule = await createLlamaModule(config);
    currentSettings = settings;

    self.postMessage({ type: 'MODEL_READY' });
  } catch (error) {
    self.postMessage({ type: 'MODEL_ERROR', error });
  }
}

// Parse Llama output into structured rating
function parseModelOutput(output: string): ContentRating {
  try {
    // Expected format: JSON string with ratings
    const ratings = JSON.parse(output) as {
      contentQuality: {
        writingQuality: number;
        informationDensity: number;
        sourceCredibility: number;
        originality: number;
      };
      emotionalImpact: {
        toxicityLevel: number;
        emotionalManipulation: number;
        socialHarmony: number;
      };
      userPreferences: {
        topicAlignment: number;
        sourcePreference: number;
        historicalInteraction: number;
      };
    };

    return {
      overallScore: calculateOverallScore(ratings),
      contentQuality: {
        writingQuality: ratings.contentQuality.writingQuality,
        informationDensity: ratings.contentQuality.informationDensity,
        sourceCredibility: ratings.contentQuality.sourceCredibility,
        originality: ratings.contentQuality.originality
      },
      emotionalImpact: {
        toxicityLevel: ratings.emotionalImpact.toxicityLevel,
        emotionalManipulation: ratings.emotionalImpact.emotionalManipulation,
        socialHarmony: ratings.emotionalImpact.socialHarmony
      },
      userPreferences: {
        topicAlignment: ratings.userPreferences.topicAlignment,
        sourcePreference: ratings.userPreferences.sourcePreference,
        historicalInteraction: ratings.userPreferences.historicalInteraction
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to parse model output:', error);
    // Return default rating if parsing fails
    return createDefaultRating();
  }
}

function calculateOverallScore(ratings: {
  contentQuality: { [key: string]: number };
  emotionalImpact: { [key: string]: number };
  userPreferences: { [key: string]: number };
}): number {
  const weights = {
    contentQuality: 0.4,
    emotionalImpact: 0.3,
    userPreferences: 0.3
  };

  const contentQualityScore = Object.values(ratings.contentQuality).reduce((a, b) => a + b, 0) / 4;
  const emotionalImpactScore = Object.values(ratings.emotionalImpact).reduce((a, b) => a + b, 0) / 3;
  const userPreferencesScore = Object.values(ratings.userPreferences).reduce((a, b) => a + b, 0) / 3;

  return Math.round(
    (contentQualityScore * weights.contentQuality +
     emotionalImpactScore * weights.emotionalImpact +
     userPreferencesScore * weights.userPreferences) * 10
  );
}

function createDefaultRating(): ContentRating {
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

// Handle messages from the main thread
self.onmessage = async (e: MessageEvent) => {
  const { type, settings, prompt } = e.data;

  switch (type) {
    case 'INIT_MODEL':
      await initializeLlama(settings);
      break;

    case 'ANALYZE_CONTENT':
      try {
        if (!llamaModule || !currentSettings) {
          throw new Error('Model not initialized');
        }

        const response = await llamaModule.generate({
          prompt,
          temperature: currentSettings.inferenceSettings.temperature,
          topP: currentSettings.inferenceSettings.topP,
          maxTokens: currentSettings.inferenceSettings.maxTokens,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: []
        });
        const rating = parseModelOutput(response);

        self.postMessage({
          type: 'ANALYSIS_COMPLETE',
          rating
        });
      } catch (error) {
        self.postMessage({
          type: 'ANALYSIS_ERROR',
          error
        });
      }
      break;

    default:
      console.warn('Unknown message type:', type);
  }
};