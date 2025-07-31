// Test script to verify Llama service worker initialization
// This can be run in the Chrome extension's background service worker console

async function testLlamaService() {
  console.log('=== Testing Llama Service ===');
  
  try {
    // Test 1: Initialize the service
    console.log('Test 1: Initializing Llama service...');
    const settings = {
      modelPath: '/models/tinyllama-1.1b.gguf',
      modelType: 'fast',
      inferenceSettings: {
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.9,
        contextLength: 2048
      }
    };
    
    await llamaService.initialize(settings);
    console.log('✅ Llama service initialized successfully');
    
    // Test 2: Analyze content
    console.log('\nTest 2: Analyzing content...');
    const testPost = {
      id: 'test-123',
      platform: 'twitter',
      content: 'This is a test post to check if the AI rating system is working correctly.',
      author: 'TestUser',
      timestamp: Date.now()
    };
    
    const rating = await llamaService.analyzeContent(testPost);
    console.log('✅ Content analyzed successfully');
    console.log('Rating:', rating);
    
    // Test 3: Unload model
    console.log('\nTest 3: Unloading model...');
    await llamaService.unloadModel();
    console.log('✅ Model unloaded successfully');
    
    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLlamaService();