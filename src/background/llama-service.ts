// Add type declaration for service worker globals
declare function importScripts(...urls: string[]): void;

import { LlamaModule } from '../llama-wasm/llama-interface';
import { ContentRating, ModelSettings, Post } from '../utils/types';

interface LlamaInstance {
  model: LlamaModule;
  isLoaded: boolean;
  settings: ModelSettings;
}

class LlamaService {
  private static instance: LlamaService;
  private llamaInstance: LlamaInstance | null = null;
  private modelLoadPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): LlamaService {
    if (!LlamaService.instance) {
      LlamaService.instance = new LlamaService();
    }
    return LlamaService.instance;
  }

  async initialize(settings: ModelSettings): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    this.modelLoadPromise = new Promise((resolve, reject) => {
      // Load dependencies in the correct order
      console.log('Loading WASM module...');
      this.loadDependencies()
        .then(() => {
          console.log('Initializing model...');
          return this.initModel(settings);
        })
        .then(() => {
          this.isInitialized = true;
          resolve();
        })
        .catch((error) => {
          console.error('Failed to initialize Llama:', error);
          reject(error);
        });
    });

    return this.modelLoadPromise;
  }

  private async loadDependencies(): Promise<void> {
    try {
      // First load the WASM module
      const wasmUrl = chrome.runtime.getURL('llama.wasm');
      const workerUrl = chrome.runtime.getURL('llama.worker.js');

      // Load scripts in sequence
      await new Promise<void>((resolve, reject) => {
        try {
          importScripts(wasmUrl);
          importScripts(workerUrl);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      console.log('Dependencies loaded successfully');
    } catch (error) {
      console.error('Failed to load dependencies:', error);
      throw error;
    }
  }

  private async initModel(settings: ModelSettings): Promise<void> {
    try {
      // Initialize the WASM module
      const wasmModule = (self as any).LlamaWasmModule;
      if (!wasmModule) {
        throw new Error('WASM module not loaded');
      }

      // Create model instance
      this.llamaInstance = {
        model: await wasmModule.create(settings),
        isLoaded: true,
        settings
      };

      console.log('Model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize model:', error);
      throw error;
    }
  }

  async analyzeContent(post: Post): Promise<ContentRating> {
    if (!this.llamaInstance?.isLoaded) {
      throw new Error('Llama service not initialized');
    }

    try {
      const prompt = this.createAnalysisPrompt(post);
      const result = await this.llamaInstance.model.generate({
        prompt,
        temperature: this.llamaInstance.settings.inferenceSettings.temperature,
        topP: this.llamaInstance.settings.inferenceSettings.topP,
        maxTokens: this.llamaInstance.settings.inferenceSettings.maxTokens,
        topK: 40,
        repeatPenalty: 1.1,
        stopSequences: []
      });

      return this.parseModelOutput(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  private parseModelOutput(output: string): ContentRating {
    try {
      // Attempt to parse the model output
      let parsedRating: Partial<ContentRating> = {};
      try {
        parsedRating = JSON.parse(output);
      } catch {
        console.warn('Failed to parse model output as JSON:', output);
      }

      // Create default rating with any parsed values
      const rating: ContentRating = {
        overallScore: parsedRating.overallScore ?? 50,
        contentQuality: {
          writingQuality: 5,
          informationDensity: 5,
          sourceCredibility: 5,
          originality: 5,
          ...parsedRating.contentQuality
        },
        emotionalImpact: {
          toxicityLevel: 5,
          emotionalManipulation: 5,
          socialHarmony: 5,
          ...parsedRating.emotionalImpact
        },
        userPreferences: {
          topicAlignment: 5,
          sourcePreference: 5,
          historicalInteraction: 5,
          ...parsedRating.userPreferences
        },
        timestamp: Date.now()
      };

      return rating;
    } catch (error) {
      console.error('Failed to parse model output:', error);
      throw error;
    }
  }

  private createAnalysisPrompt(post: Post): string {
    return `Analyze the following social media post and rate it on multiple dimensions:

Content: "${post.content}"
Author: ${post.author}
Platform: ${post.platform}

Please rate the following aspects on a scale of 0-10:

1. Content Quality:
- Writing quality
- Information density
- Source credibility
- Originality

2. Emotional Impact:
- Toxicity level
- Emotional manipulation
- Social harmony

3. User Engagement:
- Topic relevance
- Author reputation
- Community value

Provide ratings in a structured format.`;
  }

  async unloadModel(): Promise<void> {
    if (!this.llamaInstance) {
      return;
    }

    try {
      await this.llamaInstance.model.dispose();
      this.llamaInstance = null;
      this.modelLoadPromise = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to unload model:', error);
      throw error;
    }
  }
}

export const llamaService = LlamaService.getInstance();