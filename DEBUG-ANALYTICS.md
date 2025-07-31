# Debug Analytics - Step by Step Troubleshooting Guide

The analytics are showing zeros despite our implementation. Follow these steps to identify and fix the issue.

## Prerequisites
1. ✅ Extension built with `npm run build`
2. Extension reloaded in Chrome (chrome://extensions -> reload button)
3. Navigate to LinkedIn feed page

## Step 1: Test Database Initialization

Open Chrome DevTools (F12) and run in console:

```javascript
// Test if background script is running and database is initialized
chrome.runtime.sendMessage({ type: 'GET_STATISTICS' }, (response) => {
  console.log('Statistics Response:', response);
  if (response.success) {
    console.log('✅ Database working, stats:', response.stats);
  } else {
    console.error('❌ Database error:', response.error);
  }
});
```

**Expected Result:** Should return database statistics (even if all zeros)
**If Failed:** Database initialization issue - check background script console

## Step 2: Test Feed Detection

On LinkedIn feed page, run:

```javascript
// Check if feed items are detected
const feedItems = document.querySelectorAll('.feed-shared-update-v2');
console.log(`Found ${feedItems.length} LinkedIn feed items`);

if (feedItems.length > 0) {
  console.log('✅ Feed items detected');
  console.log('First item:', feedItems[0]);
} else {
  console.error('❌ No feed items found - wrong page or LinkedIn changed HTML structure');
}
```

**Expected Result:** Should find multiple feed items
**If Failed:** LinkedIn structure changed or not on correct page

## Step 3: Test Manual Feed Item Processing

Run this to manually insert a test feed item:

```javascript
// Test manual feed item insertion
const testFeedData = {
  id: `debug-test-${Date.now()}`,
  author: {
    id: 'debug-author',
    name: 'Debug Test Author',
    headline: 'Test Headline',
    profileUrl: 'https://linkedin.com/in/debug',
    verified: false
  },
  content: 'This is a debug test post for analytics',
  postType: 'post',
  reactionCount: 10,
  commentCount: 5,
  repostCount: 2,
  reactionTypes: ['like', 'celebrate'],
  hasMedia: false,
  timestamp: new Date().toISOString()
};

chrome.runtime.sendMessage({
  type: 'FEED_ITEM_DETECTED',
  data: testFeedData
}, (response) => {
  console.log('Feed processing response:', response);
  if (response.success) {
    console.log('✅ Test feed item processed successfully');
    
    // Check stats again after 1 second
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'GET_STATISTICS' }, (statsResponse) => {
        console.log('Updated statistics:', statsResponse.stats);
      });
    }, 1000);
  } else {
    console.error('❌ Failed to process test feed item:', response.error);
  }
});
```

**Expected Result:** Should successfully insert and show updated statistics
**If Failed:** Database processing issue

## Step 4: Check Background Script Console

1. Go to chrome://extensions
2. Click "service worker" link next to Hardcore Blackout extension
3. Look for initialization messages and any errors
4. Look for "DatabaseService: ..." log messages

## Step 5: Test Feed Analyzer Startup

Run this in LinkedIn page console:

```javascript
// Check if content script variables are available
if (typeof window.feedAnalyzer !== 'undefined') {
  console.log('✅ Feed analyzer available');
} else {
  console.log('❌ Feed analyzer not found - content script issue');
}

// Look for any analytics-related console messages
console.log('Check console for feed analyzer startup messages');
```

## Step 6: Full Debug Script

Copy and paste the entire contents of `debug-analytics.js` into the LinkedIn page console to run comprehensive tests.

## Common Issues and Solutions

### Issue: Database Not Initializing
**Symptoms:** GET_STATISTICS returns error about database not initialized
**Solution:** 
- Check if sql-wasm.wasm file exists in dist/ folder
- Verify background script console for SQL.js errors
- May need to add sql-wasm.wasm to web_accessible_resources in manifest

### Issue: Feed Items Not Detected
**Symptoms:** No feed items found by querySelector
**Solution:**
- LinkedIn changed their HTML structure
- Update selectors in feed-analyzer.ts
- Check if you're on the correct LinkedIn feed page

### Issue: Message Passing Fails
**Symptoms:** chrome.runtime.sendMessage doesn't get responses
**Solution:**
- Extension not properly loaded or background script crashed
- Reload extension and check background script console

### Issue: SQL.js WebAssembly Loading
**Symptoms:** "Failed to initialize database" with WebAssembly errors
**Solution:**
- Add sql-wasm.wasm to manifest web_accessible_resources
- Check Content Security Policy allows wasm-unsafe-eval

## Next Steps Based on Results

1. **If Step 1 fails:** Fix database initialization
2. **If Step 2 fails:** Update LinkedIn selectors  
3. **If Step 3 succeeds but real feed doesn't work:** Feed analyzer not running
4. **If all steps fail:** Extension loading issue

Run through all steps and report which ones pass/fail for targeted debugging.