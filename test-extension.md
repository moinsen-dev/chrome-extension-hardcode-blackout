# Testing the Hardcore Blackout Extension

## Steps to Test the Extension

1. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory
   - The extension should load without errors

2. **Check the Console for Initialization**
   - Right-click on the extension icon and select "Inspect views: service worker"
   - Look for the following log messages:
     - "Background script loaded, initializing..."
     - "Development mode: Bypassing setup requirement"
     - "Initializing Llama service with settings:"
     - "LlamaService initialized successfully - ready for analysis"

3. **Test on a Social Media Site**
   - Navigate to Twitter (x.com), Facebook, Reddit, or LinkedIn
   - Open the browser console (F12) and switch to the Console tab
   - You should see:
     - "PostDetector: Initializing on [hostname]"
     - "PostDetector: Detected platform: [platform]"
     - A green snackbar saying "Hardcore Blackout is active on [platform]"

4. **Verify Post Processing**
   - As you scroll through posts, you should see in the console:
     - "Processing post: {id, platform, contentLength, author}"
     - "Sending REQUEST_RATING for post: [id]"
     - "REQUEST_RATING received:" (in the service worker console)
     - "Generating new rating for post: [id]"
     - Rating overlays should appear on posts with scores

## Expected Behavior

- Posts should display rating overlays in the top-right corner
- Ratings should show numerical scores (e.g., 50, 65, 72)
- The mock implementation generates random ratings between 30-80
- Posts with low ratings (<40) should show warning indicators
- The extension status indicator should show the number of processed posts

## Debugging Tips

If ratings aren't appearing:
1. Check both the page console and service worker console for errors
2. Verify the extension has permissions for the current site
3. Make sure the post selectors match the current site's HTML structure
4. Check that the Llama service initialized successfully

## Common Issues and Solutions

1. **"Llama service not initialized" errors**
   - The service should auto-initialize in development mode
   - Check the service worker console for initialization logs

2. **No posts detected**
   - The site's HTML structure may have changed
   - Check if the CSS selectors in `getPostSelectors()` are still valid

3. **Ratings not showing**
   - Verify the REQUEST_RATING messages are being sent and received
   - Check for any JavaScript errors in the console