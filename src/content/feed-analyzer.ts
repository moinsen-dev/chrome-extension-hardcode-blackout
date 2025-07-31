// Types for feed analysis
export interface FeedAuthor {
  id: string;
  name: string;
  headline: string;
  profileUrl: string;
  verified: boolean;
}

export interface FeedData {
  id: string;
  author: FeedAuthor;
  content: string;
  postType: 'post' | 'article' | 'video' | 'document';
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  reactionTypes: string[];
  hasMedia: boolean;
  mediaType?: string;
  mediaTitle?: string;
  timestamp: string;
}

export class FeedAnalyzer {
  private observer: MutationObserver | null = null;
  private processedPosts: Set<string> = new Set();
  private isObserving: boolean = false;

  constructor() {
    // Initialize with stored processed posts to avoid duplicates across sessions
    this.loadProcessedPosts();
  }

  private async loadProcessedPosts(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get('processedPostIds');
      if (stored.processedPostIds) {
        this.processedPosts = new Set(stored.processedPostIds);
      }
    } catch (error) {
      console.error('Failed to load processed posts:', error);
    }
  }

  private async saveProcessedPosts(): Promise<void> {
    try {
      // Keep only last 1000 post IDs to prevent storage bloat
      const recentIds = Array.from(this.processedPosts).slice(-1000);
      await chrome.storage.local.set({ processedPostIds: recentIds });
    } catch (error) {
      console.error('Failed to save processed posts:', error);
    }
  }

  startObserving(): void {
    if (this.isObserving) {
      console.log('Feed analyzer already observing');
      return;
    }

    console.log('Feed analyzer starting to observe...');
    this.waitForFeed().then((feedContainer) => {
      console.log('LinkedIn feed detected, starting feed analysis');
      this.observeFeed(feedContainer);
      this.isObserving = true;
      console.log('Feed analyzer is now observing LinkedIn feed');
    }).catch((error) => {
      console.error('Failed to start feed observation:', error);
    });
  }

  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
    }
  }

  private async waitForFeed(): Promise<Element> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 30 seconds
      
      const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Looking for LinkedIn feed container (attempt ${attempts}/${maxAttempts})`);
        
        const feedContainer = document.querySelector('div[role="main"] .scaffold-finite-scroll__content');
        if (feedContainer) {
          console.log('LinkedIn feed container found:', feedContainer);
          clearInterval(checkInterval);
          resolve(feedContainer);
        } else if (attempts >= maxAttempts) {
          console.error('LinkedIn feed container not found after 30 seconds');
          clearInterval(checkInterval);
          reject(new Error('Feed container not found'));
        }
      }, 1000);
    });
  }

  private observeFeed(feedContainer: Element): void {
    this.observer = new MutationObserver((mutations) => {
      const newFeedItems: Element[] = [];
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
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

  private async processFeedItem(element: Element): Promise<void> {
    try {
      const postId = this.extractPostId(element);
      if (!postId) {
        console.warn('Could not extract post ID from element:', element);
        return;
      }
      
      if (this.processedPosts.has(postId)) {
        console.log(`Post ${postId} already processed, skipping`);
        return;
      }

      console.log(`Processing new feed item: ${postId}`);
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
        } else if (response) {
          console.error('Failed to store feed item:', response.error);
        }
      } catch (msgError) {
        // Handle case where background script doesn't respond
        console.warn('Background script did not respond to FEED_ITEM_DETECTED:', msgError);
      }
    } catch (error) {
      console.error('Error processing feed item:', error);
    }
  }

  private extractPostId(element: Element): string | null {
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

  private extractFeedData(element: Element): FeedData | null {
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
    } catch (error) {
      console.error('Data extraction error:', error);
      return null;
    }
  }

  private extractAuthorData(element: Element): FeedAuthor {
    const authorContainer = element.querySelector('.update-components-actor__container');
    
    const authorLink = authorContainer?.querySelector('a[href*="/in/"]') as HTMLAnchorElement;
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

  private extractAuthorIdFromUrl(url: string): string {
    const match = url.match(/\/in\/([^/?]+)/);
    return match ? match[1] : `unknown-${Date.now()}`;
  }

  private extractContentData(element: Element): { text: string; type: FeedData['postType'] } {
    const textContainer = element.querySelector('.update-components-text');
    const text = textContainer?.textContent?.trim() || '';
    
    // Determine post type based on content structure
    let type: FeedData['postType'] = 'post';
    if (element.querySelector('.feed-shared-article')) {
      type = 'article';
    } else if (element.querySelector('.feed-shared-external-video')) {
      type = 'video';
    } else if (element.querySelector('.update-components-document__container')) {
      type = 'document';
    }

    return { text, type };
  }

  private extractEngagementData(element: Element): {
    reactions: number;
    comments: number;
    reposts: number;
    reactionTypes: string[];
  } {
    const socialCounts = element.querySelector('.social-details-social-counts');
    
    // Extract reaction count
    const reactionButton = socialCounts?.querySelector('.social-details-social-counts__reactions');
    const reactionText = reactionButton?.getAttribute('aria-label') || '';
    const reactions = this.parseCount(reactionText);

    // Extract reaction types from images
    const reactionTypes: string[] = [];
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

  private extractMediaData(element: Element): {
    hasMedia: boolean;
    type?: string;
    title?: string;
  } {
    const hasImage = !!element.querySelector('.update-components-image');
    const hasVideo = !!element.querySelector('.feed-shared-external-video');
    const hasDocument = !!element.querySelector('.update-components-document__container');
    
    let type: string | undefined;
    let title: string | undefined;

    if (hasDocument) {
      type = 'document';
      const docTitle = element.querySelector('iframe[title*="Document"]')?.getAttribute('title');
      if (docTitle) {
        title = docTitle.replace(/^Document\s*(-\s*)?Wiedergabe:\s*/, '').trim();
      }
    } else if (hasVideo) {
      type = 'video';
    } else if (hasImage) {
      type = 'image';
    }

    return {
      hasMedia: hasImage || hasVideo || hasDocument,
      type,
      title
    };
  }

  private parseCount(text: string): number {
    // Handle various count formats: "5 reactions", "1.2K comments", "1,234", etc.
    const cleanText = text.replace(/[,\.]/g, '');
    const match = cleanText.match(/(\d+\.?\d*)\s*([kKmM]?)/);
    if (!match) return 0;

    let count = parseFloat(match[1]);
    const multiplier = match[2]?.toLowerCase();

    if (multiplier === 'k') count *= 1000;
    if (multiplier === 'm') count *= 1000000;

    return Math.floor(count);
  }

  // Public method to manually analyze visible feed items
  async analyzeVisibleFeed(): Promise<number> {
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
export const feedAnalyzer = new FeedAnalyzer();
