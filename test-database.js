// Test database operations directly
// Run this in the extension background console

console.log('=== Testing Database Operations ===');

// Test 1: Check if database is initialized
(async () => {
  try {
    // First check database status
    const debugResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'DEBUG_ANALYTICS' }, resolve);
    });
    
    console.log('Database Debug Info:', debugResponse);
    
    if (!debugResponse.success) {
      console.error('Failed to get debug info:', debugResponse.error);
      return;
    }
    
    console.log('\n--- Database Status ---');
    console.log('Status:', debugResponse.debugInfo.databaseStatus);
    console.log('Tables:', debugResponse.debugInfo.tableInfo.tables);
    console.log('Counts:', debugResponse.debugInfo.tableInfo.counts);
    
    // Test 2: Try a direct test insert
    console.log('\n--- Testing Direct Insert ---');
    const testResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'TEST_ANALYTICS_INSERT' }, resolve);
    });
    
    if (testResponse.success) {
      console.log('✅ Test insert successful!');
      console.log('Stats after insert:', testResponse.stats);
    } else {
      console.error('❌ Test insert failed:', testResponse.error);
    }
    
    // Test 3: Get current statistics
    console.log('\n--- Getting Current Statistics ---');
    const statsResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATISTICS' }, resolve);
    });
    
    if (statsResponse.success) {
      console.log('Current stats:', statsResponse.stats);
    } else {
      console.error('Failed to get stats:', statsResponse.error);
    }
    
    // Test 4: Check Chrome storage directly
    console.log('\n--- Checking Chrome Storage ---');
    const storage = await chrome.storage.local.get(['feedDatabase', 'processedPostIds', 'settings']);
    console.log('Storage contents:', {
      hasFeedDatabase: !!storage.feedDatabase,
      feedDatabaseSize: storage.feedDatabase ? storage.feedDatabase.length : 0,
      processedPostIds: storage.processedPostIds ? storage.processedPostIds.length : 0,
      settings: storage.settings
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
})();