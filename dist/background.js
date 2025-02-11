/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background/llama-service.ts":
/*!*****************************************!*\
  !*** ./src/background/llama-service.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   llamaService: () => (/* binding */ llamaService)
/* harmony export */ });
class LlamaService {
    static instance;
    llamaInstance = null;
    modelLoadPromise = null;
    isInitialized = false;
    constructor() {
        // Private constructor for singleton
    }
    static getInstance() {
        if (!LlamaService.instance) {
            LlamaService.instance = new LlamaService();
        }
        return LlamaService.instance;
    }
    async initialize(settings) {
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
    async loadDependencies() {
        try {
            // First load the WASM module
            const wasmUrl = chrome.runtime.getURL('llama.wasm');
            const workerUrl = chrome.runtime.getURL('llama.worker.js');
            // Load scripts in sequence
            await new Promise((resolve, reject) => {
                try {
                    importScripts(wasmUrl);
                    importScripts(workerUrl);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
            console.log('Dependencies loaded successfully');
        }
        catch (error) {
            console.error('Failed to load dependencies:', error);
            throw error;
        }
    }
    async initModel(settings) {
        try {
            // Initialize the WASM module
            const wasmModule = self.LlamaWasmModule;
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
        }
        catch (error) {
            console.error('Failed to initialize model:', error);
            throw error;
        }
    }
    async analyzeContent(post) {
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
        }
        catch (error) {
            console.error('Analysis failed:', error);
            throw error;
        }
    }
    parseModelOutput(output) {
        try {
            // Attempt to parse the model output
            let parsedRating = {};
            try {
                parsedRating = JSON.parse(output);
            }
            catch {
                console.warn('Failed to parse model output as JSON:', output);
            }
            // Create default rating with any parsed values
            const rating = {
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
        }
        catch (error) {
            console.error('Failed to parse model output:', error);
            throw error;
        }
    }
    createAnalysisPrompt(post) {
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
    async unloadModel() {
        if (!this.llamaInstance) {
            return;
        }
        try {
            await this.llamaInstance.model.dispose();
            this.llamaInstance = null;
            this.modelLoadPromise = null;
            this.isInitialized = false;
        }
        catch (error) {
            console.error('Failed to unload model:', error);
            throw error;
        }
    }
}
const llamaService = LlamaService.getInstance();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/background/index.ts ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _llama_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./llama-service */ "./src/background/llama-service.ts");

// Initialize default settings
async function initializeStorage() {
    const defaultSettings = {
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
        isInitialized: false // Track if extension has been set up
    };
    try {
        // Get existing storage data
        const storage = await chrome.storage.local.get('settings');
        // If no settings exist or not initialized, set defaults and show setup
        if (!storage.settings || !storage.settings.isInitialized) {
            await chrome.storage.local.set({ settings: defaultSettings });
            // Open setup page
            await showSetupPage();
            return;
        }
        // If already initialized, proceed with normal startup
        await initializeLlamaService(storage.settings.modelSettings);
    }
    catch (error) {
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
async function initializeLlamaService(modelSettings) {
    try {
        await _llama_service__WEBPACK_IMPORTED_MODULE_0__.llamaService.initialize(modelSettings);
        console.log('Llama service initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize Llama service:', error);
        // Show setup page if initialization fails
        await showSetupPage();
    }
}
// Create a fallback rating when Llama service fails
function createFallbackRating() {
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
async function downloadModel(modelType) {
    try {
        const modelUrls = {
            'fast': 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-GGUF/resolve/main/tinyllama-1.1b-chat-v0.3.Q4_K_M.gguf',
            'default': 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf',
            'accurate': 'https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf'
        };
        const url = modelUrls[modelType];
        if (!url)
            throw new Error('Invalid model type');
        const response = await fetch(url);
        if (!response.ok)
            throw new Error('Network response was not ok');
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('Failed to get response reader');
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
    }
    catch (error) {
        console.error('Failed to download model:', error);
        chrome.runtime.sendMessage({
            type: 'DOWNLOAD_ERROR',
            modelType,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REQUEST_RATING') {
        if (!message.post) {
            console.error('No post data provided');
            return true;
        }
        const post = message.post;
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
            }
            else {
                try {
                    // Generate rating using Llama
                    const rating = await _llama_service__WEBPACK_IMPORTED_MODULE_0__.llamaService.analyzeContent(post);
                    // Cache the rating
                    cachedRatings[post.id] = rating;
                    await chrome.storage.local.set({ cachedRatings });
                    sendResponse({ rating: rating.overallScore });
                }
                catch (error) {
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
            }
            catch (error) {
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
});
// Handle settings changes
chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.settings?.newValue?.modelSettings) {
        const settings = changes.settings.newValue;
        // Only update if initialization is complete
        if (settings.isInitialized) {
            try {
                await _llama_service__WEBPACK_IMPORTED_MODULE_0__.llamaService.unloadModel();
                await _llama_service__WEBPACK_IMPORTED_MODULE_0__.llamaService.initialize(settings.modelSettings);
                console.log('Model settings updated successfully');
            }
            catch (error) {
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

})();

/******/ })()
;
//# sourceMappingURL=background.js.map