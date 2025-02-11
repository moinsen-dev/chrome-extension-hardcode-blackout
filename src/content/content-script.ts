import { Post } from '../utils/types';

class PostDetector {
  private platform: 'twitter' | 'facebook' | 'reddit';
  private observer: MutationObserver;

  constructor() {
    this.platform = this.detectPlatform();
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  private detectPlatform(): 'twitter' | 'facebook' | 'reddit' {
    const hostname = window.location.hostname;
    if (hostname.includes('twitter.com')) return 'twitter';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('reddit.com')) return 'reddit';
    return 'twitter'; // default fallback
  }

  private getPostSelectors(): string {
    switch (this.platform) {
      case 'twitter':
        return 'article[data-testid="tweet"]';
      case 'facebook':
        return '[role="article"]';
      case 'reddit':
        return '[data-testid="post-container"]';
      default:
        return '';
    }
  }

  private extractPostData(element: Element): Post | null {
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
          <button class="blackout-block">Block</button>
        </div>
      </div>
    `;

    // Position the overlay
    const rect = element.getBoundingClientRect();
    (element as HTMLElement).style.position = 'relative';
    element.appendChild(overlay);

    // Request rating from background script
    chrome.runtime.sendMessage(
      { type: 'REQUEST_RATING', post: postData },
      (response) => {
        if (response && response.rating) {
          this.updateRatingDisplay(overlay, response.rating);
        }
      }
    );
  }

  private updateRatingDisplay(overlay: HTMLElement, rating: number) {
    const scoreElement = overlay.querySelector('.blackout-score');
    if (scoreElement) {
      scoreElement.textContent = rating.toString();
      scoreElement.className = `blackout-score score-${Math.floor(rating / 20) * 20}`;
    }
  }

  public start() {
    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Process existing posts
    document.querySelectorAll(this.getPostSelectors()).forEach((post) => {
      this.processPost(post);
    });
  }
}

// Initialize and start the detector
const detector = new PostDetector();
detector.start();