import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { llamaService } from '../../background/llama-service';
import { ModelSettings } from '../../utils/types';

describe('LlamaService', () => {
  const mockSettings: ModelSettings = {
    modelPath: '/models/test-model.gguf',
    modelType: 'default',
    inferenceSettings: {
      maxTokens: 100,
      temperature: 0.7,
      topP: 0.9
    }
  };

  let mockWorker: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock Worker
    mockWorker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null
    };

    // Mock Worker constructor
    (global as any).Worker = jest.fn(() => mockWorker);

    // Mock chrome.runtime
    (global as any).chrome = {
      runtime: {
        getURL: jest.fn((path) => `chrome-extension://mock-id/${path}`)
      }
    };

    // Reset LlamaService instance
    (llamaService as any).worker = null;
    (llamaService as any).llamaInstance = null;
    (llamaService as any).modelLoadPromise = null;
  });

  test('initialize should load WASM module and model', async () => {
    const initPromise = llamaService.initialize(mockSettings);

    // Simulate worker responses
    setTimeout(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { type: 'MODEL_READY' } });
      }
    }, 100);

    await initPromise;

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'INIT_MODEL',
      settings: mockSettings
    });
  }, 10000);

  test('analyzeContent should return valid content rating', async () => {
    const mockPost = {
      id: 'test-post',
      platform: 'twitter' as const,
      content: 'Test content',
      author: 'test-author',
      timestamp: Date.now()
    };

    const mockRating = {
      overallScore: 85,
      contentQuality: {
        writingQuality: 8,
        informationDensity: 7,
        sourceCredibility: 9,
        originality: 8
      },
      emotionalImpact: {
        toxicityLevel: 2,
        emotionalManipulation: 1,
        socialHarmony: 9
      },
      userPreferences: {
        topicAlignment: 8,
        sourcePreference: 9,
        historicalInteraction: 8
      },
      timestamp: Date.now()
    };

    // Initialize first
    const initPromise = llamaService.initialize(mockSettings);
    setTimeout(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { type: 'MODEL_READY' } });
      }
    }, 100);
    await initPromise;

    // Analyze content
    const analysisPromise = llamaService.analyzeContent(mockPost);
    setTimeout(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({
          data: {
            type: 'ANALYSIS_COMPLETE',
            rating: mockRating
          }
        });
      }
    }, 100);

    const rating = await analysisPromise;

    expect(rating).toBeDefined();
    expect(rating.overallScore).toBe(85);
    expect(rating.contentQuality).toBeDefined();
    expect(rating.emotionalImpact).toBeDefined();
    expect(rating.userPreferences).toBeDefined();
  }, 10000);

  test('unloadModel should cleanup resources', async () => {
    // Initialize first
    const initPromise = llamaService.initialize(mockSettings);
    setTimeout(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { type: 'MODEL_READY' } });
      }
    }, 100);
    await initPromise;

    // Unload
    await llamaService.unloadModel();

    expect(mockWorker.terminate).toHaveBeenCalled();
    expect((llamaService as any).worker).toBeNull();
    expect((llamaService as any).llamaInstance).toBeNull();
    expect((llamaService as any).modelLoadPromise).toBeNull();
  }, 10000);
});