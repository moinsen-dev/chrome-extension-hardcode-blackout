// Debug script to test analytics functionality
// Run this in the browser console on LinkedIn

console.log('Starting LinkedIn Feed Analytics Debug...');

// 1. Check if the extension is loaded
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  console.log('✓ Chrome extension API available');
  console.log('Extension ID:', chrome.runtime.id);
} else {
  console.error('✗ Chrome extension API not available');
}

// 2. Check for feed analyzer
try {
  // Look for feed items on the page
  const feedItems = document.querySelectorAll('.feed-shared-update-v2');
  console.log(`Found ${feedItems.length} feed items on page`);
  
  if (feedItems.length > 0) {
    console.log('✓ LinkedIn feed detected');
    
    // Try to extract data from first item
    const firstItem = feedItems[0];
    console.log('First feed item:', firstItem);
    
    // Check for author data
    const authorContainer = firstItem.querySelector('.update-components-actor__container');
    if (authorContainer) {
      const authorLink = authorContainer.querySelector('a[href*="/in/"]');
      const authorName = authorContainer.querySelector('.update-components-actor__title span[dir="ltr"]')?.textContent;
      console.log('Author found:', { name: authorName, link: authorLink?.href });
    } else {
      console.warn('No author container found');
    }
    
    // Check for content
    const textContainer = firstItem.querySelector('.update-components-text');
    if (textContainer) {
      console.log('Content found:', textContainer.textContent?.substring(0, 100) + '...');
    } else {
      console.warn('No content found');
    }
  } else {
    console.warn('✗ No LinkedIn feed items found - are you on the LinkedIn feed page?');
  }
} catch (error) {
  console.error('Error checking feed items:', error);
}

// 3. Test message to background script
async function testBackgroundConnection() {
  try {
    console.log('Testing background script connection...');
    
    // Test GET_STATISTICS
    const statsResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GET_STATISTICS' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('Statistics response:', statsResponse);
    
    if (statsResponse.success) {
      console.log('✓ Background script responding');
      console.log('Database stats:', statsResponse.stats);
    } else {
      console.error('✗ Background script error:', statsResponse.error);
    }
  } catch (error) {
    console.error('✗ Failed to connect to background script:', error);
  }
}

// 4. Test manual feed item processing
async function testManualFeedProcessing() {
  try {
    console.log('Testing manual feed item processing...');
    
    const feedItems = document.querySelectorAll('.feed-shared-update-v2');
    if (feedItems.length === 0) {
      console.warn('No feed items to test with');
      return;
    }
    
    const testItem = feedItems[0];
    
    // Create mock feed data
    const mockFeedData = {
      id: `test-${Date.now()}`,
      author: {
        id: 'test-author',
        name: 'Test Author',
        headline: 'Test Headline',
        profileUrl: 'https://linkedin.com/in/test',
        verified: false
      },
      content: 'Test content for analytics',
      postType: 'post',
      reactionCount: 5,
      commentCount: 2,
      repostCount: 1,
      reactionTypes: ['like'],
      hasMedia: false,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending test feed item:', mockFeedData);
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'FEED_ITEM_DETECTED',
        data: mockFeedData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('Feed item processing response:', response);
    
    if (response.success) {
      console.log('✓ Test feed item processed successfully');
      
      // Check statistics again
      setTimeout(async () => {
        await testBackgroundConnection();
      }, 1000);
    } else {
      console.error('✗ Failed to process test feed item:', response.error);
    }
  } catch (error) {
    console.error('Error testing manual feed processing:', error);
  }
}

// Run tests
console.log('Running tests...');
testBackgroundConnection();

// Wait a bit then test manual processing
setTimeout(() => {
  testManualFeedProcessing();
}, 2000);

console.log('Debug script loaded. Check console for results.');