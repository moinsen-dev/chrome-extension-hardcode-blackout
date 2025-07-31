# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Development
- `npm run build` - Build the extension for production
- `npm run dev` - Start webpack in development mode with watch
- `npm run watch` - Watch for changes and rebuild
- `npm run prod` - Build for production with optimizations
- `npm run prepare-model` - Download and prepare Llama models (runs automatically on install)

### Code Quality
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint on .ts and .tsx files
- `npm run lint:fix` - Auto-fix linting issues

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Architecture Overview

### Chrome Extension Structure
This is a Chrome Extension (Manifest V3) with the following key components:

1. **Background Service Worker** (`src/background/index.ts`)
   - Manages extension lifecycle and messaging
   - Handles Llama model initialization and setup
   - Coordinates content rating requests between content scripts and AI service
   - Manages storage for settings and cached ratings

2. **Content Script** (`src/content/content-script.ts`)
   - Injected into social media pages (Twitter, Facebook, Reddit, LinkedIn)
   - Detects and analyzes posts in real-time
   - Applies visual filtering based on AI ratings
   - Communicates with background script for ratings

3. **AI Processing** (`src/background/llama-service.ts` + `llama.worker.ts`)
   - Uses WebAssembly-compiled Llama.cpp for local AI inference
   - Runs in a dedicated Web Worker for non-blocking processing
   - Analyzes content across three dimensions: Content Quality, Emotional Impact, User Preferences
   - Returns ratings on a 0-100 scale

4. **Database Service** (`src/background/database-service.ts`)
   - SQL.js-based local database for feed analytics
   - Tracks content engagement and filtering effectiveness
   - Stores historical data for pattern analysis

5. **UI Components**
   - **Popup** (`src/ui/popup/index.tsx`) - Quick access controls
   - **Options Page** (`src/ui/options/index.tsx`) - Full settings and model management
   - Built with React, TypeScript, and Material-UI

### Key Technical Decisions

1. **Local AI Processing**: All AI inference happens locally using WebAssembly for privacy
2. **Worker-based Architecture**: Heavy AI processing runs in Web Workers to avoid blocking the UI
3. **TypeScript Throughout**: Strong typing for better maintainability
4. **Material-UI + TailwindCSS**: Hybrid styling approach for flexibility
5. **Webpack Build**: Custom configuration for Chrome Extension requirements

### Data Flow
1. Content script detects new posts on social media
2. Sends post data to background script via Chrome messaging
3. Background script checks cache or requests rating from Llama service
4. Llama service processes content in Web Worker
5. Rating returned to content script for visual application
6. Results cached for performance

### Model Integration
The extension supports multiple Llama model variants:
- `fast` - TinyLlama 1.1B (quick responses)
- `default` - Llama 2 7B (balanced)
- `accurate` - Llama 2 13B (highest quality)
- `deepscaler` - DeepScaleR 1.5B (extended context)

Models are downloaded on first setup and stored locally.