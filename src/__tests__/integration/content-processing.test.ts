import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PostDetector } from '../../content/content-script';

// Define types for our mocks
type ChromeRuntimeSendMessage = (
  message: any,
  callback: (response: any) => void
) => boolean;

interface ChromeRuntime {
  sendMessage: ChromeRuntimeSendMessage;
}

interface Chrome {
  runtime: ChromeRuntime;
}

describe('Content Processing Pipeline', () => {
  let detector: PostDetector;

  beforeEach(() => {
    document.body.innerHTML = '';
    detector = new PostDetector();

    // Mock chrome API with proper types
    const mockSendMessage: ChromeRuntimeSendMessage = (message, callback) => {
      setTimeout(() => callback({ rating: 85 }), 0);
      return true;
    };

    const chrome: Chrome = {
      runtime: {
        sendMessage: jest.fn(mockSendMessage)
      }
    };

    (global as any).chrome = chrome;
  });

  test('should detect and process Twitter posts', async () => {
    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'twitter.com'
      }
    });

    // Create mock Twitter post
    const mockTweet = document.createElement('article');
    mockTweet.setAttribute('data-testid', 'tweet');

    const tweetText = document.createElement('div');
    tweetText.setAttribute('data-testid', 'tweetText');
    tweetText.textContent = 'Test tweet content';

    const userName = document.createElement('div');
    userName.setAttribute('data-testid', 'User-Name');
    userName.textContent = 'TestUser';

    mockTweet.appendChild(tweetText);
    mockTweet.appendChild(userName);
    document.body.appendChild(mockTweet);

    // Start detection
    detector.start();

    // Wait for processing and chrome.runtime.sendMessage callback
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify overlay was created
    const overlay = mockTweet.querySelector('.blackout-rating-overlay');
    expect(overlay).toBeTruthy();

    // Verify score was updated
    const score = overlay?.querySelector('.blackout-score');
    expect(score).toBeTruthy();
    expect(score).toHaveClass('score-80');
  });

  test('should detect and process Facebook posts', async () => {
    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'facebook.com'
      }
    });

    // Create mock Facebook post
    const mockPost = document.createElement('div');
    mockPost.setAttribute('role', 'article');

    const content = document.createElement('div');
    content.className = 'userContent';
    content.textContent = 'Test Facebook post';

    const author = document.createElement('a');
    author.className = 'profileLink';
    author.textContent = 'Test User';

    mockPost.appendChild(content);
    mockPost.appendChild(author);
    document.body.appendChild(mockPost);

    // Start detection
    detector.start();

    // Wait for processing and chrome.runtime.sendMessage callback
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify overlay was created
    const overlay = mockPost.querySelector('.blackout-rating-overlay');
    expect(overlay).toBeTruthy();

    // Verify score was updated
    const score = overlay?.querySelector('.blackout-score');
    expect(score).toBeTruthy();
    expect(score).toHaveClass('score-80');
  });

  test('should apply correct rating colors', async () => {
    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'twitter.com'
      }
    });

    // Create and process post
    const mockPost = document.createElement('article');
    mockPost.setAttribute('data-testid', 'tweet');
    document.body.appendChild(mockPost);

    detector.start();

    // Wait for processing and chrome.runtime.sendMessage callback
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify rating color
    const score = mockPost.querySelector('.blackout-score');
    expect(score).toBeTruthy();
    expect(score).toHaveClass('score-80');
  });
});