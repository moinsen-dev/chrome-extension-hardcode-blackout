import { Post } from '../utils/types';

// Add snackbar styles
const snackbarStyles = `
.blackout-rating-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
}

.blackout-actions button:hover + .blackout-tooltip {
  opacity: 1;
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

export class PostDetector {
  private platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin' | null;
  private observer: MutationObserver;
  private statusIndicator: HTMLElement | null = null;
  private snackbar: HTMLElement | null = null;

  constructor() {
    this.injectStyles();
    this.platform = this.detectPlatform();
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

  private extractPostData(element: Element): Post | null {
    if (!this.platform) return null;

    try {
      const id = element.getAttribute('data-testid') ||
               element.getAttribute('id') ||
               Math.random().toString(36);

      let content = '';
      let author = '';

      switch (this.platform) {
        case 'twitter':
          content = element.querySelector('[data-testid="tweetText"]')?.textContent || '';
          author = element.querySelector('[data-testid="User-Name"]')?.textContent || '';
          break;
        case 'facebook':
          content = element.querySelector('.userContent')?.textContent || '';
          author = element.querySelector('.profileLink')?.textContent || '';
          break;
        case 'reddit':
          content = element.querySelector('[data-testid="post-content"]')?.textContent || '';
          author = element.querySelector('.author')?.textContent || '';
          break;
        case 'linkedin':
          content = element.querySelector('.feed-shared-text')?.textContent || '';
          author = element.querySelector('.feed-shared-actor__name')?.textContent || '';
          break;
      }

      return {
        id,
        platform: this.platform,
        content,
        author,
        timestamp: Date.now()
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
    if (!postData) return;

    // Mark as processed
    element.setAttribute('data-blackout-processed', 'true');

    // Create and inject the rating overlay
    const overlay = document.createElement('div');
    overlay.className = 'blackout-rating-overlay';
    overlay.innerHTML = `
      <div class="blackout-rating">
        <div class="blackout-score">...</div>
        <div class="blackout-actions">
          <button class="blackout-hide">Hide</button>
          <div class="blackout-tooltip">Temporarily hide this post from view</div>
          <button class="blackout-block">Block</button>
          <div class="blackout-tooltip">Permanently block similar content</div>
        </div>
      </div>
    `;

    // Set up the overlay position
    (element as HTMLElement).style.position = 'relative';
    element.appendChild(overlay);

    // Add click handlers for hide/block buttons
    const hideButton = overlay.querySelector('.blackout-hide');
    const blockButton = overlay.querySelector('.blackout-block');

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
    chrome.runtime.sendMessage(
      { type: 'REQUEST_RATING', post: postData },
      (response) => {
        if (response && response.rating) {
          this.updateRatingDisplay(overlay, response.rating, response.fallback);
          this.updateStats(document.querySelectorAll('[data-blackout-processed]').length);
        }
      }
    );
  }

  private updateRatingDisplay(overlay: HTMLElement, rating: number, isFallback: boolean = false) {
    const scoreElement = overlay.querySelector('.blackout-score');
    if (scoreElement) {
      scoreElement.textContent = rating.toString();
      scoreElement.className = `blackout-score score-${Math.floor(rating / 20) * 20}${isFallback ? ' fallback' : ''}`;

      // Get the post container element
      const postElement = overlay.closest('[data-blackout-processed]') as HTMLElement;
      if (postElement) {
        // Remove any existing warning classes
        postElement.classList.remove('blackout-post-warning', 'blackout-warning-moderate', 'blackout-warning-severe');

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