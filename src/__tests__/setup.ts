import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { chrome } from 'jest-chrome';

declare module '@jest/expect' {
  interface AsymmetricMatchers extends TestingLibraryMatchers<any, any> {}
  interface Matchers<R> extends TestingLibraryMatchers<R, any> {}
}

// Mock chrome API
Object.defineProperty(window, 'chrome', {
  value: chrome,
  writable: true,
  configurable: true
});

// Mock WebAssembly
const mockWebAssemblyModule = {
  instantiate: jest.fn().mockImplementation(() => Promise.resolve({
    instance: {},
    module: {}
  })),
  compile: jest.fn().mockImplementation(() => Promise.resolve({})),
  instantiateStreaming: jest.fn().mockImplementation(() => Promise.resolve({
    instance: {},
    module: {}
  })),
  compileStreaming: jest.fn().mockImplementation(() => Promise.resolve({}))
};

Object.defineProperty(global, 'WebAssembly', {
  value: {
    ...WebAssembly,
    ...mockWebAssemblyModule
  },
  writable: true
});

// Mock IndexedDB
const mockIDBRequest = {
  result: {},
  error: null,
  source: null,
  transaction: null,
  readyState: 'done',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onerror: null,
  onsuccess: null
} as unknown as IDBRequest;

const mockIndexedDB = {
  open: jest.fn().mockReturnValue(mockIDBRequest),
  deleteDatabase: jest.fn().mockReturnValue(mockIDBRequest)
} as unknown as IDBFactory;

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB
});

// Mock Worker
class MockWorker {
  private listeners: { [key: string]: Array<(event: Event) => void> } = {};

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;

  constructor() {
    this.listeners = {};
  }

  addEventListener(type: string, callback: (event: Event) => void): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  removeEventListener(type: string, callback: (event: Event) => void): void {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  dispatchEvent(event: Event): boolean {
    const callbacks = this.listeners[event.type] || [];
    callbacks.forEach(callback => callback(event));
    return true;
  }

  postMessage = jest.fn();
  terminate = jest.fn();
}

// Override Worker constructor
Object.defineProperty(global, 'Worker', {
  value: MockWorker,
  writable: true
});