# LinkedIn Feed Analytics Testing Guide - v0.5.0

## Setup Instructions

1. **Build the extension**: `npm run build`
2. **Load in Chrome**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder
   - Note: If updating from v0.4.0, click the refresh icon

## Test Scenarios

### 1. Basic Functionality Test

1. **Navigate to LinkedIn**:
   - Go to https://www.linkedin.com/feed/
   - Open browser console (F12)
   - Check for message: "LinkedIn detected - initializing feed analytics"
   - Verify: "Starting LinkedIn feed analyzer..."

2. **Scroll Through Feed**:
   - Scroll slowly through 10-15 posts
   - Check console for: "Feed item processed: [status] - [post-id]"
   - Each post should be captured only once (deduplication)

3. **Check Popup Stats**:
   - Click extension icon
   - Look for "LinkedIn Analytics" section
   - Should show:
     - Posts Captured: [number]
     - Unique Authors: [number]
     - Avg. Engagement: [number]

### 2. Data Capture Verification

Check console for captured data:
```
FEED_ITEM_DETECTED received: [post-id]
Feed item stored: {status: "inserted", authorId: "..."}
```

### 3. Performance Testing

1. **Initial Load**:
   - Refresh LinkedIn feed
   - Analytics should start within 2-3 seconds
   - No impact on content filtering performance

2. **Heavy Scrolling**:
   - Rapidly scroll through 50+ posts
   - Extension should remain responsive
   - Check memory usage in Chrome Task Manager

### 4. Analytics Data Quality

Verify captured data includes:
- ✅ Post content (full text)
- ✅ Author information (name, headline, profile URL)
- ✅ Engagement metrics (reactions, comments, reposts)
- ✅ Post type (standard, article, video, document)
- ✅ Media information
- ✅ Timestamps

### 5. Integration with Content Filtering

1. **Dual Operation**:
   - Both systems should work simultaneously
   - Posts should show rating overlays AND be captured for analytics
   - No interference between features

2. **Platform Specific**:
   - Analytics only on LinkedIn
   - Content filtering on all platforms

### 6. Storage Verification

1. **Check Database Creation**:
   - Open Chrome DevTools > Application > Storage
   - Look for "feedDatabase" in Local Storage
   - Should contain binary SQLite data

2. **Deduplication**:
   - Refresh page and scroll past same posts
   - Console should show: "Feed item processed: duplicate - [post-id]"

## Expected Console Output

Success scenario:
```
LinkedIn detected - initializing feed analytics
Starting LinkedIn feed analyzer...
LinkedIn feed detected, starting feed analysis
Processing feed item: urn:li:activity:1234567890
Feed item processed: inserted - author-name-timestamp
FEED_ITEM_DETECTED received: author-name-timestamp
Feed item stored: {status: "inserted", authorId: "john-doe"}
```

## Common Issues & Solutions

### Analytics Not Starting
- Check console for errors
- Verify you're on linkedin.com/feed
- Try refreshing the page
- Check if extension is enabled in popup

### No Data in Popup
- Wait for at least one post to be captured
- Check background script console for database errors
- Try disabling/enabling extension

### Duplicate Processing
- This is prevented by design
- Check processedPostIds in Local Storage
- Limited to last 1000 post IDs

### Performance Issues
- Check Chrome Task Manager for memory usage
- Database should handle 10,000+ posts efficiently
- Consider clearing old data if needed

## Success Criteria

✅ Analytics start automatically on LinkedIn
✅ Posts are captured without duplicates
✅ Popup shows accurate statistics
✅ No performance impact on browsing
✅ Content filtering still works normally
✅ Data persists across sessions

## Next Steps

After successful testing:
1. Monitor for 24 hours of normal usage
2. Check database size growth
3. Verify no memory leaks
4. Consider implementing data export
5. Add analytics dashboard to options page