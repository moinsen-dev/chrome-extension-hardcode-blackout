export interface LlamaConfig {
  modelPath: string;
  contextSize?: number;
  threads?: number;
  batchSize?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  lastTokensSize?: number;
}

export interface LlamaModelState {
  contextSize: number;
  threads: number;
  batchSize: number;
  modelLoaded: boolean;
  modelPath: string | null;
}

export interface LlamaInferenceParams {
  prompt: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  stopSequences?: string[];
  repeatPenalty?: number;
}

export interface LlamaModule {
  // Initialization
  init(config: LlamaConfig): Promise<void>;
  loadModel(modelPath: string): Promise<void>;
  isModelLoaded(): boolean;
  getState(): LlamaModelState;

  // Text Generation
  generate(params: LlamaInferenceParams): Promise<string>;
  generateStream(params: LlamaInferenceParams): AsyncGenerator<string, void, unknown>;
  stopGeneration(): void;

  // Memory Management
  unloadModel(): Promise<void>;
  dispose(): Promise<void>;
}

export interface LlamaWasmModule extends EmscriptenModule {
  cwrap: typeof cwrap;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;

  // Llama specific functions will be added by the WASM module
  _llama_init: (configPtr: number) => number;
  _llama_load_model: (contextPtr: number, modelPathPtr: number) => number;
  _llama_generate: (contextPtr: number, promptPtr: number, paramsPtr: number) => number;
  _llama_get_state: (contextPtr: number, statePtr: number) => void;
  _llama_free_model: (contextPtr: number) => void;
  _llama_shutdown: () => void;
}

// Helper function to convert string to UTF8
export function stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void {
  const encoder = new TextEncoder();
  const utf8Array = encoder.encode(str);
  const bytes = utf8Array.subarray(0, Math.min(maxBytesToWrite, utf8Array.length));
  HEAPU8.set(bytes, outPtr);
  HEAPU8[outPtr + bytes.length] = 0; // Null terminator
}

// Helper function to read UTF8 string
export function UTF8ToString(ptr: number, maxBytesToRead?: number): string {
  const decoder = new TextDecoder();
  let end = ptr;
  while (maxBytesToRead === undefined || (end - ptr) < maxBytesToRead) {
    if (HEAPU8[end] === 0) break;
    end++;
  }
  return decoder.decode(HEAPU8.subarray(ptr, end));
}

// Default configuration
export const DEFAULT_CONFIG: LlamaConfig = {
  contextSize: 2048,
  threads: navigator.hardwareConcurrency || 4,
  batchSize: 512,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  lastTokensSize: 64,
  modelPath: ''
};