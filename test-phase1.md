# Phase 1 Testing Guide

## Setup
1. Build the extension: `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder
5. The extension should now be installed

## Testing Steps

### 1. Basic Functionality Test
1. Navigate to Twitter, Facebook, Reddit, or LinkedIn
2. Look for the extension icon in the Chrome toolbar
3. Check the browser console for initialization logs:
   - Should see: "Background script loaded, initializing..."
   - Should see: "Development mode: Bypassing setup requirement"
   - Should see: "LlamaService initialized successfully - ready for analysis"

### 2. Rating Display Test
1. Scroll through a social media feed
2. For each post, you should see:
   - Initial state: "Analyzing" with loading animation
   - After 1-2 seconds: A rating score (0-100) with quality label
   - Color coding: Red (0-20), Orange (40), Yellow (60), Green (80-100)

### 3. Filter Application Test
1. Posts with ratings should have visual filters applied:
   - Score ≤ 20: Heavy blur + 25% opacity
   - Score ≤ 40: Medium blur + 50% opacity  
   - Score ≤ 60: Light opacity (75%)
   - Score > 60: No filter

### 4. Console Verification
Check browser console for:
```
REQUEST_RATING received: {postId: "...", platform: "twitter", contentLength: ...}
Generating new rating for post: ...
Worker: Generating response for prompt: ...
Mock rating generated: {processingTimeMs: ..., hasNegativeContent: ..., hasPositiveContent: ...}
Rating generated: {postId: "...", overallScore: ..., timestamp: ...}
```

## Expected Results
- All posts should receive ratings within 2 seconds
- Ratings should vary based on content (negative words = lower scores)
- Visual filters should apply correctly based on thresholds
- No errors in console
- Extension remains responsive

## Common Issues
1. If ratings show "Analyzing" forever:
   - Check console for worker initialization errors
   - Verify the extension has reloaded properly
   
2. If all ratings are 50 (fallback):
   - Check if llama service initialized successfully
   - Look for error messages in console

3. If no ratings appear:
   - Ensure content script is injected (check for blackout-rating-overlay elements)
   - Verify message passing between content script and background