// Test LinkedIn feed processing
// Run this in the LinkedIn page console

console.log('=== Testing LinkedIn Feed Processing ===');

// Test 1: Check if feed analyzer is active
console.log('\n--- Checking Feed Analyzer ---');
if (typeof window.feedAnalyzer !== 'undefined') {
  console.log('✅ Feed analyzer object exists');
} else {
  console.log('❌ Feed analyzer not found - checking for module...');
}

// Test 2: Check for feed items
console.log('\n--- Checking for Feed Items ---');
const feedItems = document.querySelectorAll('.feed-shared-update-v2');
console.log(`Found ${feedItems.length} feed items on page`);

if (feedItems.length > 0) {
  // Test 3: Extract data from first item
  console.log('\n--- Testing Data Extraction ---');
  const firstItem = feedItems[0];
  
  // Check for post ID
  const postId = firstItem.querySelector('[data-id]')?.getAttribute('data-id') || 
                 firstItem.querySelector('[data-urn]')?.getAttribute('data-urn');
  console.log('Post ID:', postId);
  
  // Check for author
  const authorContainer = firstItem.querySelector('.update-components-actor__container');
  const authorName = authorContainer?.querySelector('.update-components-actor__title span[dir="ltr"]')?.textContent?.trim();
  console.log('Author:', authorName);
  
  // Check for content
  const content = firstItem.querySelector('.update-components-text')?.textContent?.trim();
  console.log('Content preview:', content?.substring(0, 100) + '...');
  
  // Test 4: Manually send a feed item
  console.log('\n--- Testing Manual Feed Processing ---');
  
  const testFeedData = {
    id: postId || `manual-test-${Date.now()}`,
    author: {
      id: 'manual-test-author',
      name: authorName || 'Manual Test Author',
      headline: 'Test Headline',
      profileUrl: 'https://linkedin.com/in/test',
      verified: false
    },
    content: content || 'Manual test content from LinkedIn page',
    postType: 'post',
    reactionCount: 10,
    commentCount: 5,
    repostCount: 2,
    reactionTypes: ['like'],
    hasMedia: false,
    timestamp: new Date().toISOString()
  };
  
  console.log('Sending test feed data:', testFeedData);
  
  chrome.runtime.sendMessage({
    type: 'FEED_ITEM_DETECTED',
    data: testFeedData
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Message error:', chrome.runtime.lastError);
    } else if (response.success) {
      console.log('✅ Feed item processed successfully:', response.result);
    } else {
      console.error('❌ Processing failed:', response.error);
    }
  });
}

// Test 5: Check processed posts in storage
console.log('\n--- Checking Processed Posts ---');
chrome.storage.local.get('processedPostIds', (result) => {
  if (result.processedPostIds) {
    console.log(`Found ${result.processedPostIds.length} processed post IDs`);
    console.log('Recent IDs:', result.processedPostIds.slice(-5));
  } else {
    console.log('No processed posts found in storage');
  }
});

// Test 6: Get current analytics
console.log('\n--- Getting Analytics Stats ---');
chrome.runtime.sendMessage({ type: 'GET_STATISTICS' }, (response) => {
  if (response.success) {
    console.log('Current analytics:', response.stats);
  } else {
    console.error('Failed to get analytics:', response.error);
  }
});

console.log('\n=== Tests Complete - Check console for results ===');