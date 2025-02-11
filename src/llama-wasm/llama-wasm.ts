import {
    DEFAULT_CONFIG,
    LlamaConfig,
    LlamaInferenceParams,
    LlamaModelState,
    LlamaModule,
    LlamaWasmModule,
    stringToUTF8,
    UTF8ToString
} from './llama-interface';

export type { LlamaConfig, LlamaInferenceParams, LlamaModule };

class LlamaWasm implements LlamaModule {
  private module: LlamaWasmModule | null = null;
  private contextPtr: number = 0;
  private config: LlamaConfig = DEFAULT_CONFIG;
  private isGenerating: boolean = false;

  async init(config: LlamaConfig): Promise<void> {
    try {
      // Load WASM module
      const moduleFactory = await import('./llama.wasm');
      const module = await moduleFactory.default();
      this.module = module;

      if (!this.module) {
        throw new Error('Failed to load WASM module');
      }

      // Initialize configuration
      this.config = { ...DEFAULT_CONFIG, ...config };

      // Allocate memory for config
      const configPtr = this.module._malloc(8 * 4); // 8 32-bit integers
      if (!configPtr) {
        throw new Error('Failed to allocate memory for config');
      }

      try {
        // Set config values in memory
        const configView = new Int32Array(this.module.HEAPU8.buffer, configPtr, 8);
        configView[0] = this.config.contextSize || DEFAULT_CONFIG.contextSize!;
        configView[1] = this.config.threads || DEFAULT_CONFIG.threads!;
        configView[2] = this.config.batchSize || DEFAULT_CONFIG.batchSize!;

        // Initialize Llama context
        this.contextPtr = this.module._llama_init(configPtr);

        if (this.contextPtr === 0) {
          throw new Error('Failed to initialize Llama context');
        }

        // Load model if path is provided
        if (this.config.modelPath) {
          await this.loadModel(this.config.modelPath);
        }
      } finally {
        // Free config memory
        this.module._free(configPtr);
      }
    } catch (error) {
      console.error('Failed to initialize Llama WASM:', error);
      throw error;
    }
  }

  async loadModel(modelPath: string): Promise<void> {
    if (!this.module || this.contextPtr === 0) {
      throw new Error('Llama not initialized');
    }

    // Allocate memory for model path
    const pathPtr = this.module._malloc(modelPath.length + 1);
    if (!pathPtr) {
      throw new Error('Failed to allocate memory for model path');
    }

    try {
      stringToUTF8(modelPath, pathPtr, modelPath.length + 1);
      const result = this.module._llama_load_model(this.contextPtr, pathPtr);

      if (result !== 0) {
        throw new Error('Failed to load model');
      }

      this.config = {
        ...this.config,
        modelPath
      };
    } finally {
      this.module._free(pathPtr);
    }
  }

  isModelLoaded(): boolean {
    return this.contextPtr !== 0 && Boolean(this.config.modelPath);
  }

  getState(): LlamaModelState {
    if (!this.module || this.contextPtr === 0) {
      throw new Error('Llama not initialized');
    }

    const statePtr = this.module._malloc(5 * 4); // 5 32-bit integers
    if (!statePtr) {
      throw new Error('Failed to allocate memory for state');
    }

    try {
      this.module._llama_get_state(this.contextPtr, statePtr);

      const stateView = new Int32Array(this.module.HEAPU8.buffer, statePtr, 5);
      return {
        contextSize: stateView[0],
        threads: stateView[1],
        batchSize: stateView[2],
        modelLoaded: stateView[3] !== 0,
        modelPath: this.config.modelPath
      };
    } finally {
      this.module._free(statePtr);
    }
  }

  async generate(params: LlamaInferenceParams): Promise<string> {
    if (!this.module || this.contextPtr === 0) {
      throw new Error('Llama not initialized');
    }

    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    this.isGenerating = true;

    try {
      // Allocate memory for prompt
      const promptPtr = this.module._malloc(params.prompt.length + 1);
      if (!promptPtr) {
        throw new Error('Failed to allocate memory for prompt');
      }

      // Allocate memory for parameters
      const paramsPtr = this.module._malloc(7 * 4); // 7 32-bit floats/integers
      if (!paramsPtr) {
        this.module._free(promptPtr);
        throw new Error('Failed to allocate memory for parameters');
      }

      try {
        stringToUTF8(params.prompt, promptPtr, params.prompt.length + 1);

        const paramsView = new Float32Array(this.module.HEAPU8.buffer, paramsPtr, 7);
        paramsView[0] = params.temperature;
        paramsView[1] = params.topP;
        paramsView[2] = params.topK;
        paramsView[3] = params.maxTokens;
        paramsView[4] = params.repeatPenalty || this.config.repeatPenalty!;

        const resultPtr = this.module._llama_generate(this.contextPtr, promptPtr, paramsPtr);
        if (!resultPtr) {
          throw new Error('Generation failed');
        }

        return UTF8ToString(resultPtr);
      } finally {
        this.module._free(promptPtr);
        this.module._free(paramsPtr);
      }
    } finally {
      this.isGenerating = false;
    }
  }

  async *generateStream(params: LlamaInferenceParams): AsyncGenerator<string, void, unknown> {
    const result = await this.generate(params);
    yield result;
  }

  stopGeneration(): void {
    this.isGenerating = false;
  }

  async unloadModel(): Promise<void> {
    if (this.module && this.contextPtr !== 0) {
      this.module._llama_free_model(this.contextPtr);
      this.contextPtr = 0;
      this.config = {
        ...this.config,
        modelPath: ''  // Use empty string instead of null
      };
    }
  }

  async dispose(): Promise<void> {
    if (this.module) {
      await this.unloadModel();
      this.module._llama_shutdown();
      this.module = null;
    }
  }
}

export const createLlamaModule = async (config: LlamaConfig): Promise<LlamaModule> => {
  const llama = new LlamaWasm();
  await llama.init(config);
  return llama;
};