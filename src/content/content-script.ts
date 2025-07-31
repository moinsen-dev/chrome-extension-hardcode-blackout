import { Post } from '../utils/types';
import { feedAnalyzer } from './feed-analyzer';

// Add snackbar styles
const snackbarStyles = `
.blackout-rating-overlay {
  position: absolute;
  top: 40px;
  right: 8px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Responsive positioning for smaller posts */
@media (max-height: 200px) {
  .blackout-rating-overlay {
    top: 20px;
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
`;

// Content type icon mapping
function getContentTypeIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'personal': '💬',      // Personal/Social talk
    'business': '💼',      // Business content
    'tech': '💻',          // Technology
    'finance': '💰',       // Finance/Money
    'news': '📰',          // News/Current events
    'entertainment': '🎬', // Entertainment
    'education': '📚',     // Educational content
    'advertisement': '🛍️', // Commercial ads/Sponsored content
    'promotion': '📢',     // Personal promotion/Self-branding
    'politics': '🏛️',      // Political content
    'other': '📄'          // Other/Unknown
  };
  return iconMap[category] || '📄';
}

export class PostDetector {
  private platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin' | null;
  private observer: MutationObserver;
  private statusIndicator: HTMLElement | null = null;
  private snackbar: HTMLElement | null = null;

  constructor() {
    console.log('PostDetector: Initializing on', window.location.hostname);
    this.injectStyles();
    this.platform = this.detectPlatform();
    console.log('PostDetector: Detected platform:', this.platform);
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.createStatusIndicator();
    this.showPlatformSupport();
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = snackbarStyles;
    document.head.appendChild(style);
  }

  private detectPlatform(): 'twitter' | 'facebook' | 'reddit' | 'linkedin' | null {
    const hostname = window.location.hostname;
    if (hostname.includes('twitter.com')) return 'twitter';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    return null;
  }

  private showPlatformSupport() {
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
    } else {
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

  private getPostSelectors(): string {
    if (!this.platform) return '';

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

  private createStatusIndicator() {
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

  private updateStats(processedCount: number) {
    const statsElement = this.statusIndicator?.querySelector('.blackout-processed');
    if (statsElement) {
      statsElement.textContent = processedCount.toString();
    }
  }

  private addTooltip(button: HTMLButtonElement | null, text: string) {
    if (!button) return;

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

  private extractPostData(element: Element): Post | null {
    if (!this.platform) return null;

    try {
      const id = element.getAttribute('data-testid') ||
               element.getAttribute('id') ||
               Math.random().toString(36);

      let content = '';
      let author = '';
      let metadata: Post['metadata'] = {};

      switch (this.platform) {
        case 'twitter':
          content = element.querySelector('[data-testid="tweetText"]')?.textContent || '';
          author = element.querySelector('[data-testid="User-Name"]')?.textContent || '';
          
          // Check for promoted tweets
          metadata.isSponsored = element.querySelector('[data-testid="tweet-text-show-more-link"]')?.textContent?.includes('Promoted') || false;
          break;
          
        case 'facebook':
          content = element.querySelector('.userContent')?.textContent || '';
          author = element.querySelector('.profileLink')?.textContent || '';
          
          // Check for sponsored posts
          metadata.isSponsored = element.querySelector('.uiStreamSponsoredLink')?.textContent?.includes('Sponsored') || false;
          break;
          
        case 'reddit':
          content = element.querySelector('[data-testid="post-content"]')?.textContent || '';
          author = element.querySelector('.author')?.textContent || '';
          
          // Check for promoted posts
          metadata.isSponsored = element.querySelector('.promotedlink')?.textContent?.includes('promoted') || false;
          break;
          
        case 'linkedin':
          // Extract multiple content elements for comprehensive analysis
          const mainText = element.querySelector('.feed-shared-text')?.textContent || '';
          const articleTitle = element.querySelector('.feed-shared-article__title')?.textContent || '';
          const articleDescription = element.querySelector('.feed-shared-article__description')?.textContent || '';
          const reshareCommentary = element.querySelector('.feed-shared-update-v2__commentary')?.textContent || '';
          const sharedText = element.querySelector('.feed-shared-text-view')?.textContent || '';
          
          // Combine all text elements
          content = [mainText, reshareCommentary, articleTitle, articleDescription, sharedText]
            .filter(text => text && text.trim())
            .join(' | ');
          
          // Get author information
          author = element.querySelector('.feed-shared-actor__name')?.textContent || 
                  element.querySelector('.feed-shared-actor__title')?.textContent || '';
          
          // LinkedIn specific metadata
          metadata.isSponsored = element.querySelector('.feed-shared-actor__description')?.textContent?.includes('Promoted') ||
                                element.querySelector('.feed-shared-text-view__text-mention')?.textContent?.includes('Sponsored') ||
                                false;
          
          // Check if it's a company account (has followers count)
          metadata.isCompanyAccount = element.querySelector('.feed-shared-actor__description')?.textContent?.includes('followers') || false;
          
          // Check for external links
          metadata.hasExternalLinks = element.querySelector('.feed-shared-article__link-container') !== null ||
                                     element.querySelector('.feed-shared-external-video__meta') !== null;
          
          if (metadata.isSponsored) {
            content = '[SPONSORED] ' + content;
          }
          break;
      }
      
      // Check for promotional CTAs in content
      const promotionalKeywords = ['buy now', 'sign up', 'register now', 'limited offer', 'discount', 'sale', 'get yours', 'click here', 'learn more', 'download now'];
      metadata.hasPromotionalCTA = promotionalKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );

      return {
        id,
        platform: this.platform,
        content,
        author,
        timestamp: Date.now(),
        metadata
      };
    } catch (error) {
      console.error('Error extracting post data:', error);
      return null;
    }
  }

  private handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches(this.getPostSelectors())) {
              this.processPost(node);
            } else {
              node.querySelectorAll(this.getPostSelectors()).forEach((post) => {
                this.processPost(post);
              });
            }
          }
        });
      }
    }
  }

  private async processPost(element: Element) {
    if (element.hasAttribute('data-blackout-processed')) return;

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

    // Create and inject the rating overlay with loading state
    const overlay = document.createElement('div');
    overlay.className = 'blackout-rating-overlay';
    overlay.innerHTML = `
      <div class="blackout-rating">
        <div class="blackout-score loading">Analyzing</div>
        <div class="blackout-actions">
          <button class="blackout-hide">Hide</button>
          <button class="blackout-block">Block</button>
        </div>
      </div>
    `;

    // Set up the overlay position
    (element as HTMLElement).style.position = 'relative';
    element.appendChild(overlay);

    // Add click handlers and tooltips for hide/block buttons
    const hideButton = overlay.querySelector('.blackout-hide') as HTMLButtonElement;
    const blockButton = overlay.querySelector('.blackout-block') as HTMLButtonElement;

    // Add tooltips
    this.addTooltip(hideButton, 'Temporarily hide this post');
    this.addTooltip(blockButton, 'Permanently block similar content');

    hideButton?.addEventListener('click', () => {
      (element as HTMLElement).style.opacity = '0.1';
      (element as HTMLElement).style.transition = 'opacity 0.3s ease';
    });

    blockButton?.addEventListener('click', () => {
      (element as HTMLElement).style.display = 'none';
      chrome.runtime.sendMessage({
        type: 'BLOCK_CONTENT',
        post: postData
      });
    });

    // Request rating from background script
    console.log('Sending REQUEST_RATING for post:', postData.id);
    chrome.runtime.sendMessage(
      { type: 'REQUEST_RATING', post: postData },
      (response) => {
        console.log('Received rating response:', {
          postId: postData.id,
          rating: response?.rating,
          fallback: response?.fallback,
          cached: response?.cached,
          error: chrome.runtime.lastError?.message
        });
        
        if (response && response.rating) {
          this.updateRatingDisplay(overlay, response.rating, response.fallback, response.contentType);
          this.updateStats(document.querySelectorAll('[data-blackout-processed]').length);
        } else {
          console.error('No rating received for post:', postData.id);
        }
      }
    );
  }

  private async updateRatingDisplay(overlay: HTMLElement, rating: number, isFallback: boolean = false, contentType?: { category: string; confidence: number }) {
    const scoreElement = overlay.querySelector('.blackout-score');
    const ratingContainer = overlay.querySelector('.blackout-rating');
    
    if (scoreElement) {
      // Remove loading class and update score
      scoreElement.classList.remove('loading');
      
      // Add quality label based on score
      let qualityLabel = '';
      if (rating >= 80) qualityLabel = 'Excellent';
      else if (rating >= 60) qualityLabel = 'Good';
      else if (rating >= 40) qualityLabel = 'Fair';
      else if (rating >= 20) qualityLabel = 'Poor';
      else qualityLabel = 'Very Poor';
      
      scoreElement.innerHTML = `
        <div style="font-size: 28px; line-height: 1;">${rating}</div>
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
      const postElement = overlay.closest('[data-blackout-processed]') as HTMLElement;
      if (postElement) {
        // Remove any existing warning classes and filters
        postElement.classList.remove(
          'blackout-post-warning', 
          'blackout-warning-moderate', 
          'blackout-warning-severe',
          'blackout-filtered',
          'opacity-25',
          'opacity-50',
          'opacity-75',
          'blur-light',
          'blur-medium',
          'blur-heavy',
          'grayscale'
        );

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
          } else if (rating <= settings.dimThreshold) {
            // Dim low quality content
            postElement.classList.add('blackout-filtered', 'blur-medium', 'opacity-50');
          } else if (rating <= 60) {
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
            } else {
              postElement.classList.add('blackout-warning-moderate');
              warningLabel.textContent = '⚠️ Low Quality Content';
              warningLabel.style.backgroundColor = '#FFA726';
            }

            postElement.insertBefore(warningLabel, postElement.firstChild);
          }
        } catch (error) {
          console.error('Error getting filter settings:', error);
        }
      }
    }
  }

  public start() {
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
    });
  }

  public stop() {
    this.observer.disconnect();
    if (this.statusIndicator) {
      this.statusIndicator.remove();
    }
    chrome.runtime.sendMessage({
      type: 'UPDATE_ICON_STATE',
      active: false
    });
  }
}

// Initialize and start the detector
const detector = new PostDetector();
detector.start();

// Initialize LinkedIn feed analytics if on LinkedIn
if (window.location.hostname.includes('linkedin.com')) {
  console.log('LinkedIn detected - initializing feed analytics');
  
  // Check if analytics are enabled (default to true for now)
  chrome.storage.local.get(['settings'], (result) => {
    const analyticsEnabled = result.settings?.settings?.analytics?.enableFeedAnalytics ?? true;
    
    if (analyticsEnabled) {
      console.log('Starting LinkedIn feed analyzer...');
      feedAnalyzer.startObserving();
    } else {
      console.log('LinkedIn feed analytics disabled in settings');
    }
  });
}