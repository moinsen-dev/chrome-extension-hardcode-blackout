# State Tracker - Hardcore Blackout

## Project Status Overview
**Current Phase:** Phase 2 - Local LLama Integration
**Last Updated:** 2024-02-11

## Project Structure
```
src/
├── background/
│   ├── llama-service.ts        # Local Llama integration and model management ✅
│   ├── content-analyzer.ts     # Content analysis and rating logic ✅
│   └── history-manager.ts      # Browser history management
├── content/
│   ├── content-script.ts       # Main content script for DOM manipulation ✅
│   ├── post-decorator.ts       # Post decoration and UI enhancement ✅
│   └── style-injector.ts       # Dynamic styles for UI elements ✅
├── llama-wasm/                 # WASM integration for Llama
│   ├── llama.wasm             # Compiled WASM binary ✅
│   ├── llama.js               # Emscripten generated JS ✅
│   ├── wrapper.js             # Custom WASM wrapper ✅
│   ├── llama-wasm.ts          # TypeScript implementation ✅
│   └── llama-interface.ts     # TypeScript interfaces ✅
├── ui/
│   ├── components/            # Reusable UI components
│   │   ├── PostOverlay.tsx    # Post rating and action overlay ✅
│   │   ├── ModelSelector.tsx  # Llama model configuration
│   │   └── FilterSettings.tsx # Content filter settings ✅
│   ├── popup/                 # Extension popup ✅
│   └── options/              # Advanced settings page ✅
└── utils/
    ├── model-utils.ts         # Llama model utilities ✅
    ├── storage.ts             # Chrome storage management ✅
    └── types.ts              # TypeScript type definitions ✅
```

## Implementation Plan

### Phase 1: Core Infrastructure (✅ Completed)
- [x] Repository setup
- [x] Basic extension structure
- [x] TypeScript configuration
- [x] Webpack/build system setup
- [x] Basic Chrome extension manifest

### Phase 2: Local LLama Integration (Current)
- [x] Llama.cpp WebAssembly integration
- [x] Model loading and management system
- [x] Model configuration UI
- [x] Basic content analysis pipeline
- [ ] Performance optimization for local inference

### Phase 3: Content Processing
- [x] Post detection for major social platforms
- [x] Content extraction system
- [x] Post decoration framework
- [x] Rating calculation system
- [x] Action button implementation (block/hide)

### Phase 4: User Interface
- [x] Modern, responsive popup design
- [x] Advanced settings page
- [x] Post overlay component
- [x] Custom styling system
- [x] Dark/light theme support

### Phase 5: Settings & Customization
- [x] Platform-specific filters
- [x] Custom keywords and rules
- [x] Model selection interface
- [ ] Performance settings
- [ ] Filter strength controls

### Phase 6: Testing & Optimization
- [ ] Performance testing
- [ ] Cross-platform compatibility
- [ ] Memory usage optimization
- [ ] User experience testing
- [ ] Security audit

## Current Focus
- Optimizing WASM performance
- Implementing model caching
- Fine-tuning content analysis

## Technical Decisions

### UI Framework
- Using React with TypeScript for UI components ✅
- Tailwind CSS for styling ✅
- Material-UI for core components ✅

### AI Implementation
- Local Llama.cpp via WebAssembly ✅
- Support for multiple model sizes ✅
- Configurable inference settings ✅
- Memory-efficient processing (In Progress)

### Storage Strategy
- Chrome Storage Sync for settings ✅
- IndexedDB for model cache (Planned)
- Local Storage for temporary data ✅

### Performance Considerations
- Lazy loading for UI components ✅
- Worker threads for AI processing ✅
- Efficient DOM manipulation ✅
- Caching for processed content (In Progress)

## Next Steps
1. Implement model caching system
2. Optimize WASM performance
3. Add progress indicators for model loading
4. Implement memory management controls

## Known Challenges
- WebAssembly performance optimization
- Memory management for local models
- Real-time content processing
- Cross-platform compatibility

## Notes
- Focus on privacy-first approach ✅
- Ensure smooth user experience
- Maintain flexible architecture for future updates

## User Experience Overview

### What Users Can Expect

#### Core Features
- **Privacy-First Content Filtering**: All content analysis happens locally on your device using your chosen Llama model
- **Customizable Social Media Experience**: Full control over what content you want to see or hide
- **Smart Content Rating**: Each social media post gets automatically analyzed and rated
- **Visual Feedback**: Posts get decorated with:
  - Content rating indicator
  - Quick action buttons (hide/block/allow)
  - Hover overlay with detailed information
  - Customizable visual markers (highlighting/dimming)

#### Easy Setup & Configuration
1. **Simple Installation**: Standard Chrome extension installation
2. **Quick Start**:
   - Choose your preferred Llama model
   - Select basic filtering preferences
   - Start browsing with immediate effect
3. **Advanced Settings**: Available but optional for power users

#### Daily Usage
- **Automatic Protection**: Once set up, works automatically on supported platforms
- **Interactive Controls**:
  - Hover over posts to see ratings and actions
  - Quick buttons to adjust filtering on the fly
  - Easy temporary bypassing of filters when needed
- **Performance**:
  - Minimal impact on browsing speed
  - Background processing won't freeze your browser
  - Efficient caching to avoid re-processing

#### Supported Platforms
Initial release will support:
- Twitter/X
- Facebook
- Reddit
(More platforms planned for future updates)

#### Privacy Benefits
- No data leaves your device
- No external API calls
- Complete control over AI model selection
- All settings stored locally

#### Customization Options
- **Visual Preferences**:
  - Dark/light theme
  - Custom highlighting colors
  - Adjustable overlay opacity
- **Filtering Rules**:
  - Platform-specific settings
  - Custom keywords and phrases
  - Adjustable sensitivity levels
- **AI Model Settings**:
  - Model selection
  - Processing speed vs accuracy balance
  - Memory usage controls

#### Resource Usage
- **Storage**:
  - ~2-4GB for AI model (user-selected)
  - Minimal for extension data
- **Memory**:
  - ~500MB-1GB during active use
  - Configurable based on device capabilities
- **Processing**:
  - Efficient background processing
  - Adjustable based on device performance

This extension aims to provide a powerful yet user-friendly way to take control of your social media experience while maintaining complete privacy through local processing.

## Content Rating System

### Rating Overview
The rating system provides a 0-100 score for each post, where:
- 0-20: Highly problematic content
- 21-40: Potentially problematic content
- 41-60: Neutral content
- 61-80: Good quality content
- 81-100: High quality content

### Rating Components
Each post's final score (0-100) is calculated from these components:

#### 1. Content Quality (40% of total score)
- **Writing Quality** (0-10)
  - Grammar and spelling
  - Sentence structure
  - Readability
- **Information Density** (0-10)
  - Substance vs. fluff
  - Meaningful content
- **Source Credibility** (0-10)
  - Author reputation
  - Platform verification
- **Originality** (0-10)
  - Unique perspectives
  - Creative expression

#### 2. Emotional Impact (30% of total score)
- **Toxicity Level** (0-10)
  - Hostility detection
  - Aggressive language
- **Emotional Manipulation** (0-10)
  - Clickbait detection
  - Sensationalism
- **Social Harmony** (0-10)
  - Divisive content
  - Community impact

#### 3. User Preferences (30% of total score)
- **Topic Alignment** (0-10)
  - User interests
  - Blocked topics
- **Source Preference** (0-10)
  - Preferred authors
  - Trusted sources
- **Historical Interaction** (0-10)
  - Similar content ratings
  - Past engagement

### Visual Representation
- **Color Coding**:
  - 81-100: 🟢 Green
  - 61-80: 🟡 Light Green
  - 41-60: 🟡 Yellow
  - 21-40: 🟠 Orange
  - 0-20: 🔴 Red

### Rating Popup Details
The rating popup will show:

#### Quick Overview
- Overall score (large number 0-100)
- Color-coded indicator
- One-line summary of rating

#### Detailed Breakdown
- Individual scores for each component
- Key factors affecting the rating
- Suggestions for improvement

#### User Actions
- Override rating
- Adjust weight of components
- Report incorrect rating
- Block similar content

### Rating Storage & Learning
- Ratings are cached locally
- User feedback improves future ratings
- Regular model updates based on feedback
- Export/import rating preferences

### Integration with Content Filtering
- Automatic actions based on thresholds:
  - < 20: Auto-hide
  - 20-40: Dim content
  - 40-60: Show normally
  - > 60: Highlight content
- Custom threshold settings
- Platform-specific adjustments
- Category-based filtering rules
