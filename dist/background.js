/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background/index.ts":
/*!*********************************!*\
  !*** ./src/background/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Temporary mock rating function until we integrate Llama
function mockRateContent(post) {
    // Generate somewhat random but consistent ratings for testing
    const hash = Array.from(post.content).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const normalizeScore = (n) => Math.min(10, Math.max(0, Math.abs(Math.sin(n)) * 10));
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
    const overallScore = Math.round((Object.values(contentQuality).reduce((a, b) => a + b) * 4 +
        Object.values(emotionalImpact).reduce((a, b) => a + b) * 3 +
        Object.values(userPreferences).reduce((a, b) => a + b) * 3) / 10);
    return {
        overallScore,
        contentQuality,
        emotionalImpact,
        userPreferences,
        timestamp: Date.now()
    };
}
// Initialize default settings
function initializeStorage() {
    return __awaiter(this, void 0, void 0, function* () {
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
        const storage = yield chrome.storage.local.get('settings');
        if (!storage.settings) {
            yield chrome.storage.local.set({ settings: defaultSettings });
        }
    });
}
// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REQUEST_RATING') {
        const post = message.post;
        // Check cache first
        chrome.storage.local.get(['cachedRatings'], (result) => __awaiter(void 0, void 0, void 0, function* () {
            const cachedRatings = result.cachedRatings || {};
            if (cachedRatings[post.id]) {
                sendResponse({ rating: cachedRatings[post.id] });
            }
            else {
                // Generate rating (mock for now)
                const rating = mockRateContent(post);
                // Cache the rating
                cachedRatings[post.id] = rating;
                yield chrome.storage.local.set({ cachedRatings });
                sendResponse({ rating: rating.overallScore });
            }
        }));
        // Keep the message channel open for async response
        return true;
    }
});
// Initialize when installed
chrome.runtime.onInstalled.addListener(() => {
    initializeStorage();
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/background/index.ts"](0, __webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=background.js.map