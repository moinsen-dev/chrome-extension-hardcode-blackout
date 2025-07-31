/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content/feed-analyzer.ts":
/*!**************************************!*\
  !*** ./src/content/feed-analyzer.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FeedAnalyzer: () => (/* binding */ FeedAnalyzer),
/* harmony export */   feedAnalyzer: () => (/* binding */ feedAnalyzer)
/* harmony export */ });
class FeedAnalyzer {
    observer = null;
    processedPosts = new Set();
    isObserving = false;
    constructor() {
        // Initialize with stored processed posts to avoid duplicates across sessions
        this.loadProcessedPosts();
    }
    async loadProcessedPosts() {
        try {
            const stored = await chrome.storage.local.get('processedPostIds');
            if (stored.processedPostIds) {
                this.processedPosts = new Set(stored.processedPostIds);
            }
        }
        catch (error) {
            console.error('Failed to load processed posts:', error);
        }
    }
    async saveProcessedPosts() {
        try {
            // Keep only last 1000 post IDs to prevent storage bloat
            const recentIds = Array.from(this.processedPosts).slice(-1000);
            await chrome.storage.local.set({ processedPostIds: recentIds });
        }
        catch (error) {
            console.error('Failed to save processed posts:', error);
        }
    }
    startObserving() {
        if (this.isObserving)
            return;
        this.waitForFeed().then((feedContainer) => {
            console.log('LinkedIn feed detected, starting feed analysis');
            this.observeFeed(feedContainer);
            this.isObserving = true;
        });
    }
    stopObserving() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            this.isObserving = false;
        }
    }
    async waitForFeed() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const feedContainer = document.querySelector('div[role="main"] .scaffold-finite-scroll__content');
                if (feedContainer) {
                    clearInterval(checkInterval);
                    resolve(feedContainer);
                }
            }, 1000);
        });
    }
    observeFeed(feedContainer) {
        this.observer = new MutationObserver((mutations) => {
            const newFeedItems = [];
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        // Look for feed update containers
                        const feedItems = element.querySelectorAll('.feed-shared-update-v2');
                        feedItems.forEach(item => newFeedItems.push(item));
                        // Check if the node itself is a feed item
                        if (element.classList && element.classList.contains('feed-shared-update-v2')) {
                            newFeedItems.push(element);
                        }
                    }
                });
            });
            if (newFeedItems.length > 0) {
                newFeedItems.forEach(item => this.processFeedItem(item));
            }
        });
        this.observer.observe(feedContainer, {
            childList: true,
            subtree: true
        });
        // Process existing items on initial load
        const existingItems = feedContainer.querySelectorAll('.feed-shared-update-v2');
        existingItems.forEach(item => this.processFeedItem(item));
    }
    async processFeedItem(element) {
        try {
            const postId = this.extractPostId(element);
            if (!postId || this.processedPosts.has(postId)) {
                return;
            }
            this.processedPosts.add(postId);
            await this.saveProcessedPosts();
            const feedData = this.extractFeedData(element);
            if (!feedData) {
                console.warn('Failed to extract data from feed item');
                return;
            }
            // Send to background script for storage with proper error handling
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'FEED_ITEM_DETECTED',
                    data: feedData
                });
                if (response && response.success) {
                    console.log(`Feed item processed: ${response.result?.status} - ${feedData.id}`);
                }
                else if (response) {
                    console.error('Failed to store feed item:', response.error);
                }
            }
            catch (msgError) {
                // Handle case where background script doesn't respond
                console.warn('Background script did not respond to FEED_ITEM_DETECTED:', msgError);
            }
        }
        catch (error) {
            console.error('Error processing feed item:', error);
        }
    }
    extractPostId(element) {
        // LinkedIn uses various ID schemes, check multiple sources
        const updateDiv = element.querySelector('[data-id]');
        if (updateDiv) {
            return updateDiv.getAttribute('data-id');
        }
        // Fallback to parsing urn from data attributes
        const urnElement = element.querySelector('[data-urn]');
        if (urnElement) {
            return urnElement.getAttribute('data-urn');
        }
        // Last resort: use a combination of author and timestamp
        const timestamp = element.querySelector('.update-components-actor__sub-description')?.textContent;
        const authorName = element.querySelector('.update-components-actor__title')?.textContent;
        if (timestamp && authorName) {
            return `${authorName}-${timestamp}`.replace(/\s+/g, '-');
        }
        return null;
    }
    extractFeedData(element) {
        try {
            const authorData = this.extractAuthorData(element);
            const contentData = this.extractContentData(element);
            const engagementData = this.extractEngagementData(element);
            const mediaData = this.extractMediaData(element);
            return {
                id: this.extractPostId(element) || `post-${Date.now()}`,
                author: authorData,
                content: contentData.text,
                postType: contentData.type,
                reactionCount: engagementData.reactions,
                commentCount: engagementData.comments,
                repostCount: engagementData.reposts,
                reactionTypes: engagementData.reactionTypes,
                hasMedia: mediaData.hasMedia,
                mediaType: mediaData.type,
                mediaTitle: mediaData.title,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Data extraction error:', error);
            return null;
        }
    }
    extractAuthorData(element) {
        const authorContainer = element.querySelector('.update-components-actor__container');
        const authorLink = authorContainer?.querySelector('a[href*="/in/"]');
        const authorNameElement = authorContainer?.querySelector('.update-components-actor__title span[dir="ltr"]');
        const authorName = authorNameElement?.textContent?.trim() || 'Unknown';
        const authorHeadline = authorContainer?.querySelector('.update-components-actor__description')?.textContent?.trim() || '';
        const isVerified = !!authorContainer?.querySelector('[data-test-icon="verified-small"]');
        const profileUrl = authorLink?.href || '';
        const authorId = this.extractAuthorIdFromUrl(profileUrl);
        return {
            id: authorId,
            name: authorName,
            headline: authorHeadline,
            profileUrl: profileUrl,
            verified: isVerified
        };
    }
    extractAuthorIdFromUrl(url) {
        const match = url.match(/\/in\/([^/?]+)/);
        return match ? match[1] : `unknown-${Date.now()}`;
    }
    extractContentData(element) {
        const textContainer = element.querySelector('.update-components-text');
        const text = textContainer?.textContent?.trim() || '';
        // Determine post type based on content structure
        let type = 'post';
        if (element.querySelector('.feed-shared-article')) {
            type = 'article';
        }
        else if (element.querySelector('.feed-shared-external-video')) {
            type = 'video';
        }
        else if (element.querySelector('.update-components-document__container')) {
            type = 'document';
        }
        return { text, type };
    }
    extractEngagementData(element) {
        const socialCounts = element.querySelector('.social-details-social-counts');
        // Extract reaction count
        const reactionButton = socialCounts?.querySelector('.social-details-social-counts__reactions');
        const reactionText = reactionButton?.getAttribute('aria-label') || '';
        const reactions = this.parseCount(reactionText);
        // Extract reaction types from images
        const reactionTypes = [];
        const reactionImages = socialCounts?.querySelectorAll('.reactions-icon');
        reactionImages?.forEach(img => {
            const reactionType = img.getAttribute('alt');
            if (reactionType && !reactionTypes.includes(reactionType)) {
                reactionTypes.push(reactionType);
            }
        });
        // Extract comment count - look for comment button in social action bar
        const commentButton = element.querySelector('[aria-label*="comment" i], [aria-label*="komment" i]');
        const commentText = commentButton?.textContent?.trim() || '0';
        const comments = this.parseCount(commentText);
        // Extract repost count
        const repostButton = element.querySelector('[aria-label*="repost" i]');
        const repostText = repostButton?.textContent?.trim() || '0';
        const reposts = this.parseCount(repostText);
        return {
            reactions,
            comments,
            reposts,
            reactionTypes
        };
    }
    extractMediaData(element) {
        const hasImage = !!element.querySelector('.update-components-image');
        const hasVideo = !!element.querySelector('.feed-shared-external-video');
        const hasDocument = !!element.querySelector('.update-components-document__container');
        let type;
        let title;
        if (hasDocument) {
            type = 'document';
            const docTitle = element.querySelector('iframe[title*="Document"]')?.getAttribute('title');
            if (docTitle) {
                title = docTitle.replace(/^Document\s*(-\s*)?Wiedergabe:\s*/, '').trim();
            }
        }
        else if (hasVideo) {
            type = 'video';
        }
        else if (hasImage) {
            type = 'image';
        }
        return {
            hasMedia: hasImage || hasVideo || hasDocument,
            type,
            title
        };
    }
    parseCount(text) {
        // Handle various count formats: "5 reactions", "1.2K comments", "1,234", etc.
        const cleanText = text.replace(/[,\.]/g, '');
        const match = cleanText.match(/(\d+\.?\d*)\s*([kKmM]?)/);
        if (!match)
            return 0;
        let count = parseFloat(match[1]);
        const multiplier = match[2]?.toLowerCase();
        if (multiplier === 'k')
            count *= 1000;
        if (multiplier === 'm')
            count *= 1000000;
        return Math.floor(count);
    }
    // Public method to manually analyze visible feed items
    async analyzeVisibleFeed() {
        const feedItems = document.querySelectorAll('.feed-shared-update-v2');
        let processedCount = 0;
        for (const item of feedItems) {
            await this.processFeedItem(item);
            processedCount++;
        }
        return processedCount;
    }
}
// Export singleton instance
const feedAnalyzer = new FeedAnalyzer();


/***/ }),

/***/ "./src/utils/error-logger.ts":
/*!***********************************!*\
  !*** ./src/utils/error-logger.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorLogger: () => (/* binding */ ErrorLogger),
/* harmony export */   errorLogger: () => (/* binding */ errorLogger)
/* harmony export */ });
class ErrorLogger {
    static instance;
    maxErrors = 100; // Maximum number of errors to store
    storageKey = 'extensionErrors';
    constructor() { }
    static getInstance() {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }
    /**
     * Log an error with context information
     */
    async logError(component, operation, error, severity = 'medium', context) {
        try {
            const extensionError = {
                id: this.generateId(),
                timestamp: Date.now(),
                component,
                operation,
                severity,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                context: {
                    ...context,
                    url: typeof window !== 'undefined' ? window.location.href : undefined,
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                    extensionVersion: chrome.runtime.getManifest().version
                }
            };
            await this.storeError(extensionError);
            // Also log to console for immediate debugging
            console.error(`[${component}] ${operation}:`, error, context);
        }
        catch (storageError) {
            // Fallback: at least log to console if storage fails
            console.error('Failed to store error log:', storageError);
            console.error(`[${component}] ${operation}:`, error, context);
        }
    }
    /**
     * Log a simple message as an error
     */
    async logMessage(component, operation, message, severity = 'medium', context) {
        const error = new Error(message);
        await this.logError(component, operation, error, severity, context);
    }
    /**
     * Get all stored errors
     */
    async getErrors() {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            return result[this.storageKey] || [];
        }
        catch (error) {
            console.error('Failed to retrieve error logs:', error);
            return [];
        }
    }
    /**
     * Get errors filtered by component
     */
    async getErrorsByComponent(component) {
        const errors = await this.getErrors();
        return errors.filter(err => err.component === component);
    }
    /**
     * Get errors filtered by severity
     */
    async getErrorsBySeverity(severity) {
        const errors = await this.getErrors();
        return errors.filter(err => err.severity === severity);
    }
    /**
     * Clear all stored errors
     */
    async clearErrors() {
        try {
            await chrome.storage.local.remove(this.storageKey);
        }
        catch (error) {
            console.error('Failed to clear error logs:', error);
        }
    }
    /**
     * Clear errors older than specified days
     */
    async clearOldErrors(daysOld = 7) {
        try {
            const errors = await this.getErrors();
            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            const recentErrors = errors.filter(err => err.timestamp > cutoffTime);
            await chrome.storage.local.set({ [this.storageKey]: recentErrors });
        }
        catch (error) {
            console.error('Failed to clear old error logs:', error);
        }
    }
    /**
     * Get error statistics
     */
    async getErrorStats() {
        const errors = await this.getErrors();
        const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
        const stats = {
            total: errors.length,
            byComponent: {},
            bySeverity: {},
            last24Hours: errors.filter(err => err.timestamp > last24Hours).length
        };
        errors.forEach(err => {
            stats.byComponent[err.component] = (stats.byComponent[err.component] || 0) + 1;
            stats.bySeverity[err.severity] = (stats.bySeverity[err.severity] || 0) + 1;
        });
        return stats;
    }
    /**
     * Store error in Chrome storage
     */
    async storeError(error) {
        const errors = await this.getErrors();
        errors.unshift(error); // Add to beginning of array (most recent first)
        // Keep only the most recent errors
        if (errors.length > this.maxErrors) {
            errors.splice(this.maxErrors);
        }
        await chrome.storage.local.set({ [this.storageKey]: errors });
    }
    /**
     * Generate a unique ID for the error
     */
    generateId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Wrap a function to automatically log errors
     */
    wrapAsync(component, operation, fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            }
            catch (error) {
                await this.logError(component, operation, error, 'high', { args });
                throw error; // Re-throw to maintain original behavior
            }
        };
    }
    /**
     * Wrap a synchronous function to automatically log errors
     */
    wrapSync(component, operation, fn) {
        return (...args) => {
            try {
                return fn(...args);
            }
            catch (error) {
                // Use setTimeout to avoid blocking synchronous execution
                setTimeout(() => {
                    this.logError(component, operation, error, 'high', { args });
                }, 0);
                throw error; // Re-throw to maintain original behavior
            }
        };
    }
}
// Export a singleton instance
const errorLogger = ErrorLogger.getInstance();
// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorLogger.logError('global', 'unhandled-error', event.error || new Error(event.message), 'critical', {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });
    window.addEventListener('unhandledrejection', (event) => {
        errorLogger.logError('global', 'unhandled-promise-rejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 'critical');
    });
}


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
/*!***************************************!*\
  !*** ./src/content/content-script.ts ***!
  \***************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostDetector: () => (/* binding */ PostDetector)
/* harmony export */ });
/* harmony import */ var _feed_analyzer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./feed-analyzer */ "./src/content/feed-analyzer.ts");
/* harmony import */ var _utils_error_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/error-logger */ "./src/utils/error-logger.ts");


// Add snackbar styles
const snackbarStyles = `
.blackout-rating-overlay {
  position: absolute;
  top: 90px;
  right: 8px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Responsive positioning for smaller posts */
@media (max-height: 200px) {
  .blackout-rating-overlay {
    top: 70px;
  }
}

.blackout-rating {
  background: rgba(33, 33, 33, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 100px;
  backdrop-filter: blur(8px);
  color: white;
  transition: all 0.3s ease;
}

/* Condensed/minimized view */
.blackout-rating.condensed {
  padding: 6px 8px;
  min-width: 60px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.blackout-rating.condensed .blackout-score {
  min-height: auto;
  padding: 4px 6px;
  margin: 0;
  font-size: 12px;
  line-height: 1.2;
}

.blackout-rating.condensed .blackout-category,
.blackout-rating.condensed .blackout-actions,
.blackout-rating.condensed .blackout-feedback {
  display: none;
}

/* Rating Score Styles */
.blackout-score {
  font-weight: bold;
  text-align: center;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Score color ranges */
.blackout-score.score-0,
.blackout-score.score-20 {
  background: linear-gradient(135deg, #d32f2f, #f44336);
  color: white;
  border: 2px solid #b71c1c;
}

.blackout-score.score-40 {
  background: linear-gradient(135deg, #f57c00, #ff9800);
  color: white;
  border: 2px solid #e65100;
}

.blackout-score.score-60 {
  background: linear-gradient(135deg, #fbc02d, #ffd54f);
  color: #333;
  border: 2px solid #f57f17;
}

.blackout-score.score-80,
.blackout-score.score-100 {
  background: linear-gradient(135deg, #388e3c, #4caf50);
  color: white;
  border: 2px solid #1b5e20;
}

/* Fallback rating style */
.blackout-score.fallback {
  opacity: 0.7;
  border-style: dashed !important;
  position: relative;
}

.blackout-score.fallback::after {
  content: "Est.";
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 10px;
  background: rgba(33, 33, 33, 0.9);
  padding: 2px 4px;
  border-radius: 4px;
  color: #999;
  font-weight: normal;
}

/* Loading state */
.blackout-score.loading {
  background: linear-gradient(90deg, #424242, #616161, #424242);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  color: #999;
  border: 2px solid #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.blackout-score.loading::before {
  content: "";
  width: 12px;
  height: 12px;
  border: 2px solid #666;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* AI-generated indicator */
.blackout-ai-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff9800;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
  cursor: help;
  transition: transform 0.2s;
}

.blackout-ai-indicator:hover {
  transform: scale(1.1);
}

.blackout-ai-indicator::after {
  content: "🤖";
}

/* Action buttons styling */
.blackout-actions {
  display: flex;
  gap: 6px;
  position: relative;
}

.blackout-actions button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.blackout-actions button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.blackout-actions button:active::before {
  width: 100px;
  height: 100px;
}

.blackout-hide {
  background: linear-gradient(135deg, #616161, #757575);
  color: white;
}

.blackout-hide:hover {
  background: linear-gradient(135deg, #757575, #9e9e9e);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.blackout-block {
  background: linear-gradient(135deg, #d32f2f, #f44336);
  color: white;
}

.blackout-block:hover {
  background: linear-gradient(135deg, #f44336, #ef5350);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Post filter effects */
.blackout-filtered {
  transition: all 0.5s ease;
}

.blackout-filtered.opacity-25 {
  opacity: 0.25 !important;
}

.blackout-filtered.opacity-50 {
  opacity: 0.5 !important;
}

.blackout-filtered.opacity-75 {
  opacity: 0.75 !important;
}

.blackout-filtered.blur-light {
  filter: blur(2px);
}

.blackout-filtered.blur-medium {
  filter: blur(4px);
}

.blackout-filtered.blur-heavy {
  filter: blur(8px);
}

.blackout-filtered.grayscale {
  filter: grayscale(100%);
}

/* Combined effects */
.blackout-filtered.blur-light.opacity-75 {
  filter: blur(2px);
  opacity: 0.75 !important;
}

.blackout-filtered.blur-medium.opacity-50 {
  filter: blur(4px);
  opacity: 0.5 !important;
}

.blackout-filtered.blur-heavy.opacity-25 {
  filter: blur(8px);
  opacity: 0.25 !important;
}

/* Rating appear animation */
@keyframes ratingAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.blackout-rating {
  animation: ratingAppear 0.3s ease-out;
}

/* Hover effects for the rating overlay */
.blackout-rating:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* Make action buttons more visible on hover */
.blackout-rating:hover .blackout-actions {
  opacity: 1;
}

.blackout-actions {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

/* Content classification */
.blackout-classification {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.blackout-classification-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.blackout-classification-label {
  text-transform: capitalize;
  font-weight: 500;
}

.blackout-snackbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 14px;
  z-index: 999999;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.blackout-tooltip {
  position: absolute;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1001;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.blackout-actions button:hover + .blackout-tooltip {
  opacity: 1;
}

/* Debug button styles */
.blackout-debug-btn {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  margin-left: 4px;
}

.blackout-debug-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Debug popup styles */
.blackout-debug-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(33, 33, 33, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  max-width: 80vw;
  max-height: 80vh;
  overflow: auto;
  z-index: 10000;
  color: white;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.blackout-debug-popup h3 {
  margin: 0 0 15px 0;
  color: #4CAF50;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
}

.blackout-debug-section {
  margin-bottom: 20px;
}

.blackout-debug-section h4 {
  color: #2196F3;
  margin: 0 0 10px 0;
  font-size: 14px;
  text-transform: uppercase;
}

.blackout-debug-content {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
}

.blackout-debug-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.blackout-debug-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.blackout-debug-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
}

/* Status indicator styles */
.blackout-status-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.blackout-status-indicator:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.blackout-status-icon {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.blackout-status-text {
  font-weight: 500;
}

.blackout-stats {
  font-size: 11px;
  color: #999;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 12px;
}

.blackout-processed {
  color: #4caf50;
  font-weight: bold;
}

.blackout-snackbar.supported {
  background-color: #4caf50;
}

.blackout-snackbar.unsupported {
  background-color: #f44336;
}

.blackout-snackbar-icon {
  font-size: 20px;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Post container warning styles */
.blackout-post-warning {
  position: relative;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.blackout-post-warning::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 8px;
  z-index: -1;
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.blackout-post-warning:hover::before {
  opacity: 0.15;
}

.blackout-warning-moderate::before {
  background-color: #FFA726;  /* Orange for moderate warning */
}

.blackout-warning-severe::before {
  background-color: #EF5350;  /* Red for severe warning */
}

.blackout-warning-label {
  position: absolute;
  top: -10px;
  left: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  z-index: 1000;
}

.blackout-warning-moderate .blackout-warning-label {
  background-color: #FFA726;
}

.blackout-warning-severe .blackout-warning-label {
  background-color: #EF5350;
}

/* Toggle button for minimize/maximize */
.blackout-toggle {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;
  font-weight: bold;
  color: #333;
}

.blackout-toggle:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* User feedback buttons */
.blackout-feedback {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  justify-content: center;
}

.blackout-feedback-btn {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.blackout-feedback-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.blackout-feedback-btn.positive {
  color: #4CAF50;
}

.blackout-feedback-btn.negative {
  color: #F44336;
}

.blackout-feedback-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.7);
}

/* Classification icon in condensed mode */
.blackout-category-icon {
  font-size: 16px;
  margin-right: 4px;
}

.blackout-rating.condensed .blackout-category-icon {
  font-size: 14px;
  margin-right: 2px;
}
`;
// Content type icon mapping
function getContentTypeIcon(category) {
    const iconMap = {
        'personal': '💬', // Personal/Social talk
        'business': '💼', // Business content
        'tech': '💻', // Technology
        'finance': '💰', // Finance/Money
        'news': '📰', // News/Current events
        'entertainment': '🎬', // Entertainment
        'education': '📚', // Educational content
        'advertisement': '🛍️', // Commercial ads/Sponsored content
        'promotion': '📢', // Personal promotion/Self-branding
        'politics': '🏛️', // Political content
        'other': '📄' // Other/Unknown
    };
    return iconMap[category] || '📄';
}
class PostDetector {
    platform;
    observer;
    statusIndicator = null;
    snackbar = null;
    debugData = new Map();
    constructor() {
        console.log('PostDetector: Initializing on', window.location.hostname);
        this.injectStyles();
        this.platform = this.detectPlatform();
        console.log('PostDetector: Detected platform:', this.platform);
        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.createStatusIndicator();
        this.showPlatformSupport();
    }
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = snackbarStyles;
        document.head.appendChild(style);
    }
    detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('twitter.com'))
            return 'twitter';
        if (hostname.includes('facebook.com'))
            return 'facebook';
        if (hostname.includes('reddit.com'))
            return 'reddit';
        if (hostname.includes('linkedin.com'))
            return 'linkedin';
        return null;
    }
    showPlatformSupport() {
        // Remove existing snackbar if any
        if (this.snackbar) {
            this.snackbar.remove();
        }
        this.snackbar = document.createElement('div');
        this.snackbar.className = `blackout-snackbar ${this.platform ? 'supported' : 'unsupported'}`;
        if (this.platform) {
            this.snackbar.innerHTML = `
        <span class="blackout-snackbar-icon">✓</span>
        <span>Hardcore Blackout is active on ${this.platform}</span>
      `;
        }
        else {
            this.snackbar.innerHTML = `
        <span class="blackout-snackbar-icon">!</span>
        <span>This website is not supported by Hardcore Blackout</span>
      `;
        }
        document.body.appendChild(this.snackbar);
        // Remove snackbar after 5 seconds
        setTimeout(() => {
            if (this.snackbar) {
                this.snackbar.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (this.snackbar) {
                        this.snackbar.remove();
                        this.snackbar = null;
                    }
                }, 300);
            }
        }, 5000);
    }
    getPostSelectors() {
        if (!this.platform)
            return '';
        switch (this.platform) {
            case 'twitter':
                return 'article[data-testid="tweet"]';
            case 'facebook':
                return '[role="article"]';
            case 'reddit':
                return '[data-testid="post-container"]';
            case 'linkedin':
                return '.feed-shared-update-v2';
            default:
                return '';
        }
    }
    createStatusIndicator() {
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = 'blackout-status-indicator';
        this.statusIndicator.innerHTML = `
      <div class="blackout-status-icon"></div>
      <div class="blackout-status-text">Hardcore Blackout Active</div>
      <div class="blackout-stats">
        <span class="blackout-processed">0</span> posts processed
      </div>
    `;
        document.body.appendChild(this.statusIndicator);
        this.updateStats(0);
    }
    updateStats(processedCount) {
        const statsElement = this.statusIndicator?.querySelector('.blackout-processed');
        if (statsElement) {
            statsElement.textContent = processedCount.toString();
        }
    }
    addTooltip(button, text) {
        if (!button)
            return;
        const tooltip = document.createElement('div');
        tooltip.className = 'blackout-tooltip';
        tooltip.textContent = text;
        button.style.position = 'relative';
        button.appendChild(tooltip);
        button.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });
        button.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    }
    extractPostData(element) {
        if (!this.platform)
            return null;
        try {
            // Try to find a unique ID from various sources
            let id = element.getAttribute('data-testid') ||
                element.id ||
                element.getAttribute('data-id');
            // For LinkedIn, try to extract ID from child elements
            if (!id && this.platform === 'linkedin') {
                // Try to find ID from ember elements or other data attributes
                const emberElement = element.querySelector('[id^="ember"]');
                if (emberElement) {
                    id = 'linkedin-' + emberElement.id;
                }
                else {
                    // Look for data-id in child elements
                    const dataIdElement = element.querySelector('[data-id]');
                    if (dataIdElement) {
                        id = dataIdElement.getAttribute('data-id') || '';
                    }
                }
            }
            // If still no ID, generate a unique one based on content hash
            if (!id) {
                const contentHash = element.textContent?.substring(0, 50) || '';
                id = 'post-' + this.platform + '-' + Date.now() + '-' +
                    contentHash.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0).toString(36);
            }
            let content = '';
            let author = '';
            let title = '';
            const contextualInfo = {};
            switch (this.platform) {
                case 'twitter': {
                    content = element.querySelector('[data-testid="tweetText"]')?.textContent || '';
                    author = element.querySelector('[data-testid="User-Name"]')?.textContent || '';
                    // Extract contextual info
                    contextualInfo.postType = element.querySelector('[data-testid="retweet"]') ? 'repost' : 'original';
                    contextualInfo.hasMedia = element.querySelector('[data-testid="tweetPhoto"], video') !== null;
                    contextualInfo.hasLinks = element.querySelector('a[href*="://"]') !== null;
                    // Get engagement metrics if available
                    const likes = element.querySelector('[data-testid="like"]')?.getAttribute('aria-label');
                    const retweets = element.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label');
                    if (likes || retweets) {
                        contextualInfo.engagementMetrics = {
                            likes: likes ? parseInt(likes.match(/\d+/)?.[0] || '0') : undefined,
                            shares: retweets ? parseInt(retweets.match(/\d+/)?.[0] || '0') : undefined
                        };
                    }
                    break;
                }
                case 'facebook': {
                    content = element.querySelector('.userContent')?.textContent || '';
                    author = element.querySelector('.profileLink')?.textContent || '';
                    // Extract contextual info
                    contextualInfo.postType = element.querySelector('.shareUnit') ? 'repost' : 'original';
                    contextualInfo.hasMedia = element.querySelector('img, video') !== null;
                    contextualInfo.hasLinks = element.querySelector('a[href*="://"]') !== null;
                    break;
                }
                case 'reddit': {
                    content = element.querySelector('[data-testid="post-content"]')?.textContent || '';
                    author = element.querySelector('.author')?.textContent || '';
                    title = element.querySelector('[data-testid="post-title"]')?.textContent || '';
                    // Extract contextual info
                    contextualInfo.postType = 'original';
                    contextualInfo.hasMedia = element.querySelector('img, video') !== null;
                    contextualInfo.hasLinks = element.querySelector('a[href*="://"]') !== null;
                    // Get engagement metrics
                    const upvotes = element.querySelector('[aria-label*="upvote"]')?.textContent;
                    const redditComments = element.querySelector('[aria-label*="comment"]')?.textContent;
                    if (upvotes || redditComments) {
                        contextualInfo.engagementMetrics = {
                            likes: upvotes ? parseInt(upvotes.match(/\d+/)?.[0] || '0') : undefined,
                            comments: redditComments ? parseInt(redditComments.match(/\d+/)?.[0] || '0') : undefined
                        };
                    }
                    break;
                }
                case 'linkedin': {
                    // Extract content from the new LinkedIn HTML structure
                    // Look for the main commentary/text content
                    const updateCommentary = element.querySelector('.update-components-text')?.textContent || '';
                    const feedSharedText = element.querySelector('.feed-shared-inline-show-more-text')?.textContent || '';
                    const articleTitle = element.querySelector('.feed-shared-article__title')?.textContent || '';
                    const articleDescription = element.querySelector('.feed-shared-article__description')?.textContent || '';
                    // Combine all text content, prioritizing the main commentary
                    content = updateCommentary || feedSharedText ||
                        [articleTitle, articleDescription].filter(text => text && text.trim()).join(' | ') ||
                        '';
                    // Remove "mehr" (more) button text if present
                    content = content.replace(/…\s*mehr$/, '').trim();
                    // Separate title from content
                    title = articleTitle || '';
                    // Get author information from the new structure
                    const actorTitle = element.querySelector('.update-components-actor__title');
                    if (actorTitle) {
                        // Extract author name from the structured span elements
                        author = actorTitle.querySelector('span[dir="ltr"] span:not(.visually-hidden)')?.textContent?.trim() || '';
                    }
                    if (!author) {
                        // Fallback to old selectors
                        author = element.querySelector('.feed-shared-actor__name')?.textContent ||
                            element.querySelector('.feed-shared-actor__title')?.textContent || '';
                    }
                    // Get author description/profile
                    const authorDescription = element.querySelector('.update-components-actor__description')?.textContent?.trim() ||
                        element.querySelector('.feed-shared-actor__description')?.textContent || '';
                    // Extract rich contextual information
                    contextualInfo.authorProfile = authorDescription;
                    contextualInfo.postType = element.querySelector('.feed-shared-update-v2__commentary') ? 'repost' :
                        element.querySelector('.feed-shared-article__title') ? 'article' :
                            element.querySelector('video') ? 'video' :
                                element.querySelector('.feed-shared-document') ? 'document' : 'status';
                    contextualInfo.hasMedia = element.querySelector('img, video') !== null;
                    contextualInfo.hasLinks = element.querySelector('.feed-shared-article__link-container, .feed-shared-external-video__meta') !== null;
                    // Get engagement metrics
                    const reactions = element.querySelector('.social-counts-reactions__count')?.textContent;
                    const linkedinComments = element.querySelector('.social-counts-comments')?.textContent;
                    if (reactions || linkedinComments) {
                        contextualInfo.engagementMetrics = {
                            likes: reactions ? parseInt(reactions.match(/\d+/)?.[0] || '0') : undefined,
                            comments: linkedinComments ? parseInt(linkedinComments.match(/\d+/)?.[0] || '0') : undefined
                        };
                    }
                    // Store platform-specific data for AI analysis
                    // Check for sponsored indicators in multiple languages
                    const allText = [
                        authorDescription,
                        element.querySelector('.feed-shared-text-view__text-mention')?.textContent || '',
                        element.querySelector('.feed-shared-actor__description')?.textContent || '',
                        // Check common LinkedIn sponsored post indicators
                        element.textContent || ''
                    ].join(' ').toLowerCase();
                    contextualInfo.platformSpecific = {
                        hasPromotedTag: allText.includes('promoted') ||
                            allText.includes('sponsored') ||
                            allText.includes('anzeige') ||
                            allText.includes('gesponsert') ||
                            allText.includes('beworben') ||
                            allText.includes('werbung') ||
                            allText.includes('publicité') ||
                            allText.includes('sponsorisé'),
                        hasFollowersInfo: authorDescription.includes('followers') || authorDescription.includes('follower'),
                        hasExternalArticle: element.querySelector('.feed-shared-article__link-container') !== null
                    };
                    break;
                }
            }
            return {
                id,
                platform: this.platform,
                content,
                author,
                title: title || undefined,
                timestamp: Date.now(),
                contextualInfo
            };
        }
        catch (error) {
            console.error('Error extracting post data:', error);
            // Use setTimeout to avoid blocking since this is not an async method
            setTimeout(() => {
                _utils_error_logger__WEBPACK_IMPORTED_MODULE_1__.errorLogger.logError('content-script', 'extract-post-data', error, 'medium', {
                    platform: this.platform || 'unknown',
                    elementTagName: element.tagName,
                    elementClasses: element.className,
                    url: window.location.href
                });
            }, 0);
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
    async processPost(element) {
        if (element.hasAttribute('data-blackout-processed'))
            return;
        const postData = this.extractPostData(element);
        if (!postData) {
            console.log('Failed to extract post data from element');
            return;
        }
        console.log('Processing post:', {
            id: postData.id,
            platform: postData.platform,
            contentLength: postData.content.length,
            author: postData.author
        });
        // Mark as processed
        element.setAttribute('data-blackout-processed', 'true');
        // Get user settings for default view mode
        const settings = await this.getSettings();
        const defaultViewMode = settings?.defaultViewMode || 'condensed';
        const isCondensed = defaultViewMode === 'condensed';
        // Create and inject the rating overlay with loading state
        const overlay = document.createElement('div');
        overlay.className = 'blackout-rating-overlay';
        overlay.innerHTML = `
      <div class="blackout-rating${isCondensed ? ' condensed' : ''}" data-post-id="${postData.id}">
        <div class="blackout-toggle" title="${isCondensed ? 'Expand view' : 'Minimize view'}">${isCondensed ? '⋯' : '⌄'}</div>
        <div class="blackout-score loading">Analyzing</div>
        <div class="blackout-category"></div>
        <div class="blackout-feedback">
          <div class="blackout-feedback-btn positive" title="Good rating">👍</div>
          <div class="blackout-feedback-btn negative" title="Poor rating">👎</div>
          <div class="blackout-debug-btn" title="Show AI debug info">🐛</div>
        </div>
        <div class="blackout-actions">
          <button class="blackout-hide">Hide</button>
          <button class="blackout-block">Block</button>
        </div>
      </div>
    `;
        // Set up the overlay position
        element.style.position = 'relative';
        element.appendChild(overlay);
        // Add click handlers and tooltips for all buttons
        const hideButton = overlay.querySelector('.blackout-hide');
        const blockButton = overlay.querySelector('.blackout-block');
        const toggleButton = overlay.querySelector('.blackout-toggle');
        const positiveBtn = overlay.querySelector('.blackout-feedback-btn.positive');
        const negativeBtn = overlay.querySelector('.blackout-feedback-btn.negative');
        const debugBtn = overlay.querySelector('.blackout-debug-btn');
        const ratingDiv = overlay.querySelector('.blackout-rating');
        // Add tooltips
        this.addTooltip(hideButton, 'Temporarily hide this post');
        this.addTooltip(blockButton, 'Permanently block similar content');
        // Toggle button functionality (minimize/maximize)
        let isMinimized = isCondensed; // Start with the default setting
        toggleButton?.addEventListener('click', () => {
            isMinimized = !isMinimized;
            if (isMinimized) {
                ratingDiv.classList.add('condensed');
                toggleButton.textContent = '⋯';
                toggleButton.title = 'Expand view';
            }
            else {
                ratingDiv.classList.remove('condensed');
                toggleButton.textContent = '⌄';
                toggleButton.title = 'Minimize view';
            }
        });
        // Feedback button functionality
        let userFeedback = null;
        positiveBtn?.addEventListener('click', () => {
            userFeedback = userFeedback === 'positive' ? null : 'positive';
            positiveBtn.classList.toggle('active', userFeedback === 'positive');
            negativeBtn.classList.remove('active');
            this.submitUserFeedback(postData.id, userFeedback);
        });
        negativeBtn?.addEventListener('click', () => {
            userFeedback = userFeedback === 'negative' ? null : 'negative';
            negativeBtn.classList.toggle('active', userFeedback === 'negative');
            positiveBtn.classList.remove('active');
            this.submitUserFeedback(postData.id, userFeedback);
        });
        // Debug button functionality
        debugBtn?.addEventListener('click', () => {
            const debugInfo = this.debugData.get(postData.id);
            if (debugInfo) {
                this.showDebugPopup(postData, debugInfo);
            }
            else {
                this.showSnackbar('Debug info not available yet. Wait for AI analysis to complete.', 'info');
            }
        });
        hideButton?.addEventListener('click', () => {
            element.style.opacity = '0.1';
            element.style.transition = 'opacity 0.3s ease';
        });
        blockButton?.addEventListener('click', () => {
            element.style.display = 'none';
            chrome.runtime.sendMessage({
                type: 'BLOCK_CONTENT',
                post: postData
            }).catch(err => console.warn('Failed to send BLOCK_CONTENT message:', err));
        });
        // Request rating from background script
        console.log('Sending REQUEST_RATING for post:', postData.id);
        chrome.runtime.sendMessage({ type: 'REQUEST_RATING', post: postData }, (response) => {
            console.log('Received rating response:', {
                postId: postData.id,
                rating: response?.rating,
                fallback: response?.fallback,
                cached: response?.cached,
                error: chrome.runtime.lastError?.message,
                isAIGenerated: response?.isAIGenerated,
                aiConfidence: response?.aiConfidence
            });
            if (response && response.rating) {
                this.updateRatingDisplay(overlay, response.rating, response.fallback, response.contentType, response.isAIGenerated, response.aiConfidence);
                this.updateStats(document.querySelectorAll('[data-blackout-processed]').length);
                // Store debug info if available
                if (response.debugInfo) {
                    this.debugData.set(postData.id, response.debugInfo);
                }
            }
            else {
                console.error('No rating received for post:', postData.id);
            }
        });
    }
    async updateRatingDisplay(overlay, rating, isFallback = false, contentType, isAIGenerated, aiConfidence) {
        const scoreElement = overlay.querySelector('.blackout-score');
        const categoryElement = overlay.querySelector('.blackout-category');
        const ratingContainer = overlay.querySelector('.blackout-rating');
        if (scoreElement) {
            // Remove loading class and update score
            scoreElement.classList.remove('loading');
            // Add quality label based on score
            let qualityLabel = '';
            if (rating >= 80)
                qualityLabel = 'Excellent';
            else if (rating >= 60)
                qualityLabel = 'Good';
            else if (rating >= 40)
                qualityLabel = 'Fair';
            else if (rating >= 20)
                qualityLabel = 'Poor';
            else
                qualityLabel = 'Very Poor';
            // Update category display with icon
            if (categoryElement && contentType) {
                const icon = getContentTypeIcon(contentType.category);
                categoryElement.innerHTML = `
          <span class="blackout-category-icon">${icon}</span>
          <span class="blackout-category-text">${contentType.category}</span>
        `;
            }
            scoreElement.innerHTML = `
        <div style="font-size: 28px; line-height: 1; position: relative;">
          ${rating}
          ${isAIGenerated && aiConfidence && aiConfidence > 0.7 ? `<div class="blackout-ai-indicator" title="AI-generated content detected (${Math.round(aiConfidence * 100)}% confidence)"></div>` : ''}
        </div>
        <div style="font-size: 11px; font-weight: normal; margin-top: 2px; opacity: 0.8;">${qualityLabel}</div>
      `;
            scoreElement.className = `blackout-score score-${Math.floor(rating / 20) * 20}${isFallback ? ' fallback' : ''}`;
            // Add content classification if available
            if (contentType && contentType.category && ratingContainer) {
                const existingClassification = ratingContainer.querySelector('.blackout-classification');
                if (!existingClassification) {
                    const classificationElement = document.createElement('div');
                    classificationElement.className = 'blackout-classification';
                    classificationElement.innerHTML = `
            <span class="blackout-classification-icon">${getContentTypeIcon(contentType.category)}</span>
            <span class="blackout-classification-label">${contentType.category}</span>
          `;
                    // Insert after score element
                    scoreElement.insertAdjacentElement('afterend', classificationElement);
                }
            }
            // Get the post container element
            const postElement = overlay.closest('[data-blackout-processed]');
            if (postElement) {
                // Remove any existing warning classes and filters
                postElement.classList.remove('blackout-post-warning', 'blackout-warning-moderate', 'blackout-warning-severe', 'blackout-filtered', 'opacity-25', 'opacity-50', 'opacity-75', 'blur-light', 'blur-medium', 'blur-heavy', 'grayscale');
                // Get filter settings from storage
                try {
                    const result = await chrome.storage.local.get(['settings']);
                    const settings = result.settings?.settings || {
                        autoHideThreshold: 20,
                        dimThreshold: 40,
                        highlightThreshold: 80
                    };
                    // Apply filters based on rating and thresholds
                    if (rating <= settings.autoHideThreshold) {
                        // Auto-hide very low quality content
                        postElement.classList.add('blackout-filtered', 'blur-heavy', 'opacity-25');
                    }
                    else if (rating <= settings.dimThreshold) {
                        // Dim low quality content
                        postElement.classList.add('blackout-filtered', 'blur-medium', 'opacity-50');
                    }
                    else if (rating <= 60) {
                        // Light filter for moderate content
                        postElement.classList.add('blackout-filtered', 'opacity-75');
                    }
                    // High quality content (> 60) remains unfiltered
                    // Add warning classes based on rating
                    if (rating <= 40) {
                        postElement.classList.add('blackout-post-warning');
                        // Remove existing warning label if any
                        const existingLabel = postElement.querySelector('.blackout-warning-label');
                        if (existingLabel) {
                            existingLabel.remove();
                        }
                        // Add warning label
                        const warningLabel = document.createElement('div');
                        warningLabel.className = 'blackout-warning-label';
                        if (rating <= 20) {
                            postElement.classList.add('blackout-warning-severe');
                            warningLabel.textContent = '⚠️ Potentially Harmful Content';
                            warningLabel.style.backgroundColor = '#EF5350';
                        }
                        else {
                            postElement.classList.add('blackout-warning-moderate');
                            warningLabel.textContent = '⚠️ Low Quality Content';
                            warningLabel.style.backgroundColor = '#FFA726';
                        }
                        postElement.insertBefore(warningLabel, postElement.firstChild);
                    }
                }
                catch (error) {
                    console.error('Error getting filter settings:', error);
                }
            }
        }
    }
    start() {
        if (!this.platform) {
            console.log('Platform not supported');
            return;
        }
        // Start observing
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Process existing posts
        document.querySelectorAll(this.getPostSelectors()).forEach((post) => {
            this.processPost(post);
        });
        // Update extension icon to show active state
        chrome.runtime.sendMessage({
            type: 'UPDATE_ICON_STATE',
            active: true,
            platform: this.platform
        }).catch(err => console.warn('Failed to send UPDATE_ICON_STATE message:', err));
    }
    stop() {
        this.observer.disconnect();
        if (this.statusIndicator) {
            this.statusIndicator.remove();
        }
        chrome.runtime.sendMessage({
            type: 'UPDATE_ICON_STATE',
            active: false
        }).catch(err => console.warn('Failed to send UPDATE_ICON_STATE message:', err));
    }
    /**
     * Submit user feedback for a post rating
     */
    async submitUserFeedback(postId, feedback) {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'USER_FEEDBACK',
                postId: postId,
                feedback: feedback,
                timestamp: Date.now()
            });
            if (response && response.success) {
                console.log(`User feedback submitted for post ${postId}: ${feedback}`);
            }
        }
        catch (error) {
            console.error('Failed to submit user feedback:', error);
            setTimeout(() => {
                _utils_error_logger__WEBPACK_IMPORTED_MODULE_1__.errorLogger.logError('content-script', 'submit-user-feedback', error, 'medium', {
                    postId,
                    feedback,
                    url: window.location.href
                });
            }, 0);
        }
    }
    /**
     * Show debug popup with AI prompt and response
     */
    showDebugPopup(postData, debugInfo) {
        // Remove any existing debug popup
        const existingOverlay = document.querySelector('.blackout-debug-overlay');
        const existingPopup = document.querySelector('.blackout-debug-popup');
        existingOverlay?.remove();
        existingPopup?.remove();
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'blackout-debug-overlay';
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'blackout-debug-popup';
        // Format timestamp with local timezone
        const date = new Date(debugInfo.timestamp);
        const timeStr = date.toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        popup.innerHTML = `
      <div class="blackout-debug-close">✕</div>
      <h3>AI Debug Information</h3>
      
      <div class="blackout-debug-section">
        <h4>Post Details</h4>
        <div class="blackout-debug-content">
ID: ${postData.id}
Author: ${postData.author}
Platform: ${postData.platform}
Time: ${timeStr}
Content Length: ${postData.content.length} chars
        </div>
      </div>

      <div class="blackout-debug-section">
        <h4>Prompt Sent to Ollama</h4>
        <div class="blackout-debug-content">${this.escapeHtml(debugInfo.prompt)}</div>
      </div>

      <div class="blackout-debug-section">
        <h4>AI Response</h4>
        <div class="blackout-debug-content">${this.escapeHtml(debugInfo.response)}</div>
      </div>
    `;
        // Add close handlers
        const closeBtn = popup.querySelector('.blackout-debug-close');
        const closePopup = () => {
            overlay.remove();
            popup.remove();
        };
        closeBtn?.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }
    /**
     * Show a temporary snackbar notification
     */
    showSnackbar(message, type = 'info') {
        // Remove any existing snackbar
        const existing = document.querySelector('.blackout-snackbar');
        existing?.remove();
        // Create snackbar
        const snackbar = document.createElement('div');
        snackbar.className = `blackout-snackbar blackout-snackbar-${type}`;
        snackbar.textContent = message;
        snackbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
        document.body.appendChild(snackbar);
        // Auto remove after 3 seconds
        setTimeout(() => {
            snackbar.style.opacity = '0';
            snackbar.style.transition = 'opacity 0.3s ease';
            setTimeout(() => snackbar.remove(), 300);
        }, 3000);
    }
    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Get user settings from storage
     */
    async getSettings() {
        try {
            const result = await chrome.storage.local.get('settings');
            return result.settings?.settings || null;
        }
        catch (error) {
            console.error('Failed to get settings:', error);
            return null;
        }
    }
}
// Check if extension is enabled before starting
chrome.storage.local.get(['extensionEnabled', 'settings'], (result) => {
    // Default to enabled if not set
    const extensionEnabled = result.extensionEnabled !== false;
    if (!extensionEnabled) {
        console.log('Hardcore Blackout extension is disabled');
        return;
    }
    console.log('Hardcore Blackout extension is enabled - starting content script');
    // Initialize and start the detector
    const detector = new PostDetector();
    detector.start();
    // Initialize LinkedIn feed analytics if on LinkedIn
    if (window.location.hostname.includes('linkedin.com')) {
        console.log('LinkedIn detected - initializing feed analytics');
        const analyticsEnabled = result.settings?.analytics?.enableFeedAnalytics ?? true;
        if (analyticsEnabled) {
            console.log('Starting LinkedIn feed analyzer...');
            _feed_analyzer__WEBPACK_IMPORTED_MODULE_0__.feedAnalyzer.startObserving();
        }
        else {
            console.log('LinkedIn feed analytics disabled in settings');
        }
    }
});

})();

/******/ })()
;
//# sourceMappingURL=content.js.map