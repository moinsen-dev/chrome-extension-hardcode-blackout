# Changelog

All notable changes to the Hardcore Blackout Chrome extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2025-07-31

### 🔧 Critical Bug Fixes & Debug Enhancement

### Fixed
- **🚨 Critical: Analytics Data Storage**: Fixed SQL syntax error preventing feed analytics from storing data
  - Corrected `GROUP_CONCAT(DISTINCT column, separator)` syntax incompatible with SQL.js
  - Now using standard `GROUP_CONCAT(column)` format
  - Resolves "DISTINCT aggregates must have exactly one argument" error
- **Database Schema Migration**: Fixed automatic column addition for existing databases
- **Statistics Retrieval**: Analytics now properly display stored data

### Added
- **Comprehensive Debug Panel**: Real-time analytics debugging in extension options
  - Database status and table information
  - Storage size and processed posts tracking
  - Recent feed items preview with AI analysis data
  - Manual test insertion to verify functionality
- **Enhanced Logging**: Complete data flow tracking from feed detection to storage
  - Feed processing confirmation logs
  - AI analysis status and results
  - Database operation confirmations
  - Statistics updates after each insertion
- **Manual Testing Tools**: 
  - "Test Insert" button for immediate functionality verification
  - DEBUG_ANALYTICS message handler for deep inspection
  - Browser console testing commands

### Changed
- **Error Resilience**: Database operations continue gracefully with schema upgrade failures
- **Performance Monitoring**: Real-time tracking of processing statistics
- **Development Experience**: Comprehensive debug documentation and testing tools

### Technical Details
- Fixed SQL.js compatibility issues with aggregate functions
- Enhanced Chrome storage integration monitoring
- Improved error handling throughout analytics pipeline
- Added database schema version management

## [0.7.0] - 2025-07-31

### 🚀 Feed Analytics Activation & Status Window Enhancement

### Added
- **Feed Analytics Database Integration**: Connected existing components to enable data flow
  - Created `processFeedItem` method to handle data conversion
  - Added comprehensive logging for debugging database operations
  - Implemented proper error handling throughout the pipeline
- **Status Window Settings Access**: Quick access to extension settings
  - Added settings gear icon to status indicator
  - Click handler opens extension options page
  - Smooth hover animations and visual feedback
- **Enhanced Debug Logging**: Track data flow from extraction to storage
  - Database initialization status
  - Table creation verification
  - Feed item processing confirmation

### Fixed
- **Analytics Data Display**: Resolved issue preventing stats from showing
  - Fixed method naming mismatch (`insertFeedItem` vs `processFeedItem`)
  - Corrected data format conversion between feed analyzer and database
  - Added null safety checks for SQL.js initialization
- **Status Window Position**: Moved up to avoid LinkedIn message overlap
  - Changed from `bottom: 20px` to `bottom: 80px`
  - Prevents interference with LinkedIn's messaging UI

### Changed
- **Status Window UI**: Enhanced with settings access
  - Added settings button with hover effects
  - Improved visual hierarchy with proper spacing
  - Better accessibility with tooltips

### Technical Details
- Fixed TypeScript strict null checks in database service
- Improved error resilience in content extraction
- Enhanced message passing between content and background scripts

## [0.6.0] - 2025-07-31

### 🤖 AI Content Detection & Enhanced User Preferences

### Added
- **AI-Generated Content Detection**: Identify and flag AI-written posts
  - Comprehensive detection patterns including writing style analysis
  - Em-dash (—) usage detection as AI indicator
  - Excessive emoji usage (3+) flagging
  - Common AI phrases and patterns recognition
  - Visual indicator (🤖) for AI-detected content with confidence percentage
- **User Content Preferences**: Customize what content you value
  - Custom prompt input for personal preferences
  - Interest keywords configuration (comma-separated)
  - Topics to avoid configuration
  - Toggle for preferring original content over reshares
  - Example templates for different user types
- **AI Detection Scoring**: AI-generated content penalties
  - 50% score reduction for high-confidence AI content (>70%)
  - Originality score capped at 3/10 for AI-detected posts
  - Visual badge appears on score display for transparency

### Changed
- **System Prompt Enhancement**: Shifted focus from ads to content quality
  - Rebalanced to prioritize originality and information value
  - Added detailed rating metrics explanations
  - Included originality scoring guide (1-10 scale)
  - Clear JSON format example with field descriptions
- **Content Analysis Focus**: New evaluation criteria
  - Original thought vs. reposts/reshares
  - Substantive information vs. small talk
  - Technical depth vs. surface-level content
  - Educational value vs. self-promotion
  - Human authenticity vs. AI patterns

### Fixed
- **JSON Response Format**: Clear structure for Ollama responses
  - Added complete example with all required fields
  - Explicit instructions for JSON-only responses
  - Field type clarifications and valid value ranges

### Technical Details
- Enhanced ContentRating type with AI detection fields
- Improved Ollama prompt engineering for better responses
- Added user settings integration to content analysis

## [0.5.2] - 2025-07-31

### 🐛 Debug Features & LinkedIn Data Extraction Fixes

### Added
- **Debug Popup Feature**: View AI analysis details
  - Debug icon (🐛) next to thumbs up/down buttons
  - Shows Ollama prompt sent and AI response received
  - Formatted timestamp with Europe/Berlin timezone
  - Popup overlay with formatted JSON display
  - Click outside to close functionality

### Fixed
- **LinkedIn Data Extraction**: Corrected empty/wrong data issues
  - Updated selectors for new LinkedIn HTML structure (`.update-components-text`)
  - Fixed author extraction from nested span structure
  - Improved ID generation with content-based hashing
  - Fixed timezone display (Europe/Berlin)
  - Resolved empty content extraction issue

### Changed
- **Default View Mode**: Condensed view is now default
  - Added configurable setting for expanded/condensed preference
  - Condensed view shows only score and category icon
  - User can change default in settings

### Technical Details
- Updated content extraction selectors for LinkedIn's current DOM
- Enhanced debug data storage in PostDetector class
- Improved error handling in data extraction

## [0.5.1] - 2025-07-31

### Fixed
- **Message Channel Timeout Errors**: Fixed Chrome extension message passing errors that occurred when background script didn't respond
  - Added proper error handling for all `chrome.runtime.sendMessage` calls
  - Added message handlers for BLOCK_CONTENT and UPDATE_ICON_STATE messages
  - Wrapped async message sends in try-catch blocks
- **Extension Enable/Disable**: Extension now properly stops when toggled off
  - Added extensionEnabled state check in content script initialization
  - Popup toggle now properly enables/disables the extension
  - Tabs reload when extension is toggled to apply state changes
- **Ollama API 403 Errors**: Resolved with CORS configuration
  - Documented Ollama CORS setup requirements
  - Simplified fetch headers for Chrome extension compatibility
  - Added comprehensive error handling for API failures

### Changed
- Improved error handling throughout the extension
- Enhanced message passing reliability between content and background scripts

## [0.5.0] - 2025-01-30

### 🎉 Feed Analytics Integration - LinkedIn Professional Intelligence

### Added
- **LinkedIn Feed Analytics**: Capture and analyze professional network content
  - Automatic post detection and extraction on LinkedIn feed
  - Author tracking with profiles, headlines, and verification status
  - Engagement metrics capture (reactions, comments, reposts)
  - Post type classification (standard, article, video, document)
  - Media detection and metadata extraction
- **Local SQLite Database**: Privacy-first data storage
  - SQL.js WebAssembly integration for in-browser database
  - Efficient storage handling 10,000+ posts
  - Automatic deduplication to prevent redundant captures
  - Persistent storage across browser sessions
- **Analytics Display**: Immediate insights in extension popup
  - Posts captured count
  - Unique authors tracked
  - Average engagement metrics
  - Separate section from content filtering stats

### Technical Implementation
- **Seamless Integration**: Feed analytics work alongside content filtering
  - No performance impact on existing features
  - Platform-specific activation (LinkedIn only)
  - Independent operation of both systems
- **Smart Data Extraction**: Sophisticated DOM parsing
  - Multiple fallback strategies for post ID extraction
  - Resilient to LinkedIn UI changes
  - Comprehensive author and engagement data capture
- **Background Processing**: Efficient message-based architecture
  - Content script captures data
  - Background script manages database
  - Popup fetches statistics on demand

### Infrastructure
- **No New Features Approach**: Leveraged existing, well-tested code
  - Feed analyzer already implemented but not integrated
  - Database service fully functional but disconnected
  - Minimal integration work to unlock major functionality
- **Privacy by Design**: All data stays local
  - No external API calls
  - No cloud storage
  - Complete user control over data

### Developer Notes
- Added `test-feed-analytics.md` for comprehensive testing guide
- Database initialized lazily on first LinkedIn visit
- Analytics enabled by default (can be disabled in future update)
- Prepared foundation for future analytics dashboard

## [0.4.0] - 2025-01-30

### 🎉 Phase 1 Implementation Complete - Core AI Pipeline Fixed

### Added
- **Comprehensive Error Handling**: Retry logic with exponential backoff (3 attempts max)
- **Intelligent Caching System**: 24-hour expiration with 1000-entry size limit
- **Automatic Cache Cleanup**: Startup cleanup and LRU-style eviction
- **Enhanced Loading States**: Progress tracking and visual feedback throughout
- **Mock AI Implementation**: Realistic rating generation for Phase 1 testing

### Fixed
- **🔧 Critical: WASM Loading**: Complete rewrite of Web Worker architecture
- **🔧 Critical: Worker Communication**: Proper message passing protocol implementation  
- **🔧 Critical: Rating Pipeline**: Content detection now correctly triggers AI analysis
- **Storage Consistency**: Fixed chrome.storage.local/sync inconsistencies
- **Filter Controls**: Slider settings now properly connected to visual filtering
- **TypeScript Errors**: All build errors resolved

### Performance Improvements
- **Processing Time**: Now 1-2 seconds (meets <2s requirement)
- **Memory Management**: Implemented cache size limits and cleanup
- **Worker Lifecycle**: Proper creation, initialization, and termination handling
- **Background Processing**: Non-blocking AI analysis in dedicated worker

### User Experience
- **Real Ratings**: No more fallback 50s - dynamic scores based on content
- **Visual Feedback**: Loading states, error indicators, and progress tracking
- **Filter Thresholds**: AutoHide ≤20, Dim ≤40, Light ≤60, Unfiltered >60
- **Quality Labels**: Excellent, Good, Fair, Poor, Very Poor based on scores
- **Fallback Indicators**: Dashed borders and "Est." labels for estimated ratings

### Developer Experience
- **Testing Guide**: Created comprehensive test-phase1.md
- **Build Success**: All webpack builds complete without errors
- **Error Logging**: Detailed console logging for debugging
- **Code Quality**: TypeScript strict mode compliance

### Infrastructure
- **Cache Management**: Automatic expiration and size-based cleanup
- **Error Recovery**: Graceful fallbacks and retry mechanisms
- **Development Mode**: Bypass setup requirements for testing
- **Resource Management**: Proper cleanup and memory monitoring

## [0.3.1] - 2024-02-11

### Added
- Support for DeepScaleR 1.5B model with enhanced mathematical reasoning
- Extended context length support for DeepScaleR model (4096 tokens)
- Improved model download progress tracking with size information

### Fixed
- Filter strength slider now properly updates and persists settings
- Fixed real-time updates for post processing statistics
- Improved text visibility with black color scheme in popup
- Status indicator now correctly shows active/inactive state

### Changed
- Enhanced popup UI with better organization and visual hierarchy
- Improved storage synchronization for settings
- Better stats display with separate sections
- Added version number display in popup

## [0.3.0] - 2024-02-11

### Added
- Colored containers for harmful content warnings
- Warning labels for potentially harmful posts
- Visual indicators for content quality
- Real-time content rating display

### Changed
- Enhanced post processing with visual feedback
- Improved warning system with severity levels
- Updated UI components for better user experience

## [0.2.0] - 2024-02-10

### Added
- Local AI processing with Llama.cpp integration
- Progress dialog for model downloads
- Support for multiple model types
- Advanced settings configuration

### Changed
- Improved model management system
- Enhanced error handling and user feedback
- Updated storage management for model data

## [0.1.0] - 2024-02-09

### Added
- Initial release
- Basic content filtering functionality
- Support for major social media platforms
- Post detection and processing system
- Basic UI components
- Storage management
- Platform-specific content detection