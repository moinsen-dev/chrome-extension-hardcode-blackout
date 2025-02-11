/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content/content-script.ts":
/*!***************************************!*\
  !*** ./src/content/content-script.ts ***!
  \***************************************/
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
class PostDetector {
    constructor() {
        this.platform = this.detectPlatform();
        this.observer = new MutationObserver(this.handleMutations.bind(this));
    }
    detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('twitter.com'))
            return 'twitter';
        if (hostname.includes('facebook.com'))
            return 'facebook';
        if (hostname.includes('reddit.com'))
            return 'reddit';
        return 'twitter'; // default fallback
    }
    getPostSelectors() {
        switch (this.platform) {
            case 'twitter':
                return 'article[data-testid="tweet"]';
            case 'facebook':
                return '[role="article"]';
            case 'reddit':
                return '[data-testid="post-container"]';
            default:
                return '';
        }
    }
    extractPostData(element) {
        var _a, _b, _c, _d, _e, _f;
        try {
            const id = element.getAttribute('data-testid') ||
                element.getAttribute('id') ||
                Math.random().toString(36);
            let content = '';
            let author = '';
            switch (this.platform) {
                case 'twitter':
                    content = ((_a = element.querySelector('[data-testid="tweetText"]')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
                    author = ((_b = element.querySelector('[data-testid="User-Name"]')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
                    break;
                case 'facebook':
                    content = ((_c = element.querySelector('.userContent')) === null || _c === void 0 ? void 0 : _c.textContent) || '';
                    author = ((_d = element.querySelector('.profileLink')) === null || _d === void 0 ? void 0 : _d.textContent) || '';
                    break;
                case 'reddit':
                    content = ((_e = element.querySelector('[data-testid="post-content"]')) === null || _e === void 0 ? void 0 : _e.textContent) || '';
                    author = ((_f = element.querySelector('.author')) === null || _f === void 0 ? void 0 : _f.textContent) || '';
                    break;
            }
            return {
                id,
                platform: this.platform,
                content,
                author,
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error('Error extracting post data:', error);
            return null;
        }
    }
    handleMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof Element) {
                        if (node.matches(this.getPostSelectors())) {
                            this.processPost(node);
                        }
                        else {
                            node.querySelectorAll(this.getPostSelectors()).forEach((post) => {
                                this.processPost(post);
                            });
                        }
                    }
                });
            }
        }
    }
    processPost(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element.hasAttribute('data-blackout-processed'))
                return;
            const postData = this.extractPostData(element);
            if (!postData)
                return;
            // Mark as processed
            element.setAttribute('data-blackout-processed', 'true');
            // Create and inject the rating overlay
            const overlay = document.createElement('div');
            overlay.className = 'blackout-rating-overlay';
            overlay.innerHTML = `
      <div class="blackout-rating">
        <div class="blackout-score">...</div>
        <div class="blackout-actions">
          <button class="blackout-hide">Hide</button>
          <button class="blackout-block">Block</button>
        </div>
      </div>
    `;
            // Position the overlay
            const rect = element.getBoundingClientRect();
            element.style.position = 'relative';
            element.appendChild(overlay);
            // Request rating from background script
            chrome.runtime.sendMessage({ type: 'REQUEST_RATING', post: postData }, (response) => {
                if (response && response.rating) {
                    this.updateRatingDisplay(overlay, response.rating);
                }
            });
        });
    }
    updateRatingDisplay(overlay, rating) {
        const scoreElement = overlay.querySelector('.blackout-score');
        if (scoreElement) {
            scoreElement.textContent = rating.toString();
            scoreElement.className = `blackout-score score-${Math.floor(rating / 20) * 20}`;
        }
    }
    start() {
        // Start observing
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Process existing posts
        document.querySelectorAll(this.getPostSelectors()).forEach((post) => {
            this.processPost(post);
        });
    }
}
// Initialize and start the detector
const detector = new PostDetector();
detector.start();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/content/content-script.ts"](0, __webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=content.js.map