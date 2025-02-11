# Hardcore Blackout

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![MUI](https://img.shields.io/badge/MUI-5.0.0-blue.svg)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Local AI](https://img.shields.io/badge/AI-Local_Processing-orange.svg)](https://github.com/ggerganov/llama.cpp)

A sophisticated Chrome extension that helps you take control of your social media experience through advanced content filtering and rating, powered by local AI processing.

![Hardcore Blackout](hardcore-blocker.jpeg)

## Features

### 🎯 Smart Content Rating
- Real-time content analysis using local LLama models
- 0-100 rating scale with visual indicators
- Comprehensive rating components:
  - Content Quality (40%)
  - Emotional Impact (30%)
  - User Preferences (30%)

### 🛡️ Content Filtering
- Platform-specific content detection
- Customizable filtering thresholds
- Visual feedback through color-coded ratings
- Quick actions: Hide/Block content

### 🔒 Privacy First
- All processing happens locally on your device
- No data sent to external servers
- Local LLama model integration
- Complete control over AI model selection

### ⚡ Performance
- Efficient post detection and processing
- Background worker for AI processing
- Smart caching system
- Minimal impact on browsing experience

### 🎨 Modern UI
- Clean, intuitive interface
- Dark mode support
- Material Design components
- Responsive overlays and popups

## Implementation

### Current Status
- ✅ Basic extension structure
- ✅ TypeScript/React setup
- ✅ Post detection system
- ✅ Rating overlay UI
- ✅ Settings management
- 🔄 Local AI integration (in progress)

### Tech Stack
- **Frontend**: React, TypeScript, Material-UI
- **Styling**: TailwindCSS
- **AI**: Local Llama.cpp via WebAssembly
- **Build**: Webpack, PostCSS

## Getting Started

### Prerequisites

Before you begin, ensure you have the following tools installed:

1. **Node.js and npm**
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Required version: 16.x or higher

2. **CMake**
   - macOS: `brew install cmake`
   - Linux: `sudo apt-get install cmake`
   - Windows: Download installer from [cmake.org](https://cmake.org/download/)
   - Required version: 3.13 or higher

3. **Emscripten**
   - Install using the following commands:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh  # On Windows, use: emsdk_env.bat
   ```
   - Add to your PATH as instructed by the installer
   - Required version: 3.1.45 or higher

4. **Git**
   - macOS: `brew install git`
   - Linux: `sudo apt-get install git`
   - Windows: Download from [git-scm.com](https://git-scm.com/)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/chrome-extension-hardcode-blackout.git
cd chrome-extension-hardcode-blackout
```

2. Install dependencies
```bash
npm install
```

3. Prepare the Llama model and WASM build
```bash
npm run prepare-model
```
This script will:
- Clone and build llama.cpp with WASM support
- Download the required model files
- Set up the WASM integration

4. Build the extension
```bash
npm run build
```

5. Load in Chrome
- Open Chrome and go to `chrome://extensions/`
- Enable Developer mode
- Click "Load unpacked"
- Select the `dist` directory

## Development

### Local Development Setup

1. **Start Development Server**
```bash
npm run dev
```
This will:
- Start Webpack in watch mode
- Rebuild on file changes
- Enable source maps for debugging

2. **Enable Chrome DevTools**
- Right-click the extension icon
- Click "Inspect popup"
- Use the Console and Network tabs for debugging

3. **Live Reload**
- Changes to content scripts require extension reload
- Click the refresh icon in `chrome://extensions/`
- Or use Chrome's Extensions Reloader extension

4. **Debug Logging**
- Set `DEBUG=true` in your `.env` file
- View logs in the background script console
- Access via `chrome://extensions/` -> Inspect views

### Testing

The project includes comprehensive testing at multiple levels:

#### 1. Unit Tests
Test individual components and services:
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- llama-service.test.ts

# Watch mode for development
npm run test:unit -- --watch
```

#### 2. Integration Tests
Test component interactions and DOM manipulation:
```bash
# Run all integration tests
npm run test:integration

# Run with coverage
npm run test:integration -- --coverage
```

#### 3. End-to-End Tests
Test the extension in a real browser environment:
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific browser tests
npm run test:e2e -- --project=chromium

# Show test report
npx playwright show-report
```

#### Test Coverage
Generate and view test coverage reports:
```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Common Testing Scenarios

1. **Content Processing**
   - Post detection and analysis
   - Rating calculation
   - Visual overlay rendering

2. **UI Components**
   - Popup functionality
   - Settings page interactions
   - Dark/light theme switching

3. **Model Integration**
   - WASM module loading
   - Model inference
   - Performance benchmarks

4. **Browser Integration**
   - Extension installation
   - Chrome API interactions
   - Cross-platform compatibility

### Debugging Tests

1. **Jest Tests**
```bash
# Run with detailed logging
npm run test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test
```

2. **Playwright Tests**
```bash
# Run in debug mode
npm run test:e2e -- --debug

# Run with UI mode
npm run test:e2e -- --ui
```

3. **Common Issues**
- **WASM Loading**: Ensure proper path resolution in tests
- **Chrome API Mocks**: Verify mock implementation matches real behavior
- **Async Operations**: Use proper wait and timeout values
- **DOM Events**: Ensure proper event simulation and cleanup

### Code Quality

1. **Type Checking**
```bash
npm run type-check
```

2. **Linting**
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

3. **Pre-commit Hooks**
- Tests must pass
- No TypeScript errors
- No linting errors
- Coverage thresholds met

### Best Practices

1. **Writing Tests**
   - Follow AAA pattern (Arrange, Act, Assert)
   - Use meaningful test descriptions
   - Keep tests focused and isolated
   - Clean up after each test

2. **Mocking**
   - Mock external dependencies
   - Use jest.spyOn for verification
   - Reset mocks between tests
   - Document mock behavior

3. **Performance**
   - Group related tests
   - Reuse setup when possible
   - Mock heavy operations
   - Use snapshot testing wisely

## Usage

### Basic Configuration
1. Click the extension icon to open the popup
2. Use the quick settings for basic filtering
3. Open the full settings page for detailed configuration

### AI Model Setup
1. Select your preferred Llama model
2. Configure inference settings
3. Adjust processing parameters

### Content Filtering
- Posts are automatically rated (0-100)
- Color-coded indicators show content quality
- Use quick actions to hide or block content
- Customize thresholds in settings

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Llama.cpp](https://github.com/ggerganov/llama.cpp) for the WebAssembly integration
- [Material-UI](https://mui.com/) for the UI components
- The open-source community for inspiration and support

**Feature Specification: Hardcore Blackout**

### **1. Overview**
Hardcore Blackout constitutes a sophisticated Chrome extension meticulously engineered to regulate social media content exposure through an advanced filtration paradigm. This solution leverages a hybrid architecture integrating deterministic keyword filtering with probabilistic AI-driven content analysis to grant users unparalleled control over the digital landscape. The platform facilitates a multi-tiered approach wherein users may dictate precise content filtration rules, employ OpenAI's advanced natural language processing models, or opt for entirely local AI-driven inference mechanisms via frameworks such as Ullama, ensuring privacy-centric computation. Additionally, the extension incorporates a robust browsing history sanitation module, expediting the automated removal of undesired entries predicated upon user-defined heuristics. This project, maintained as an open-source initiative, resides in a public GitHub repository and adheres to the permissive MIT License, fostering community-driven contributions and iterative enhancements.

### **2. Core Features**

#### **2.1 Deterministic Keyword-Based Filtering**
- Enables fine-grained specification of prohibited lexemes and phrases.
- Implements real-time content interception across multiple digital ecosystems, including Twitter, Facebook, and Reddit.
- Grants platform-specific configurability to ensure adaptive content management strategies.

#### **2.2 AI-Augmented Content Analysis**
- Facilitates user-defined prompt-based filtering by interfacing with OpenAI models (e.g., GPT-4-turbo).
- Introduces an alternative local processing mechanism leveraging open-source LLMs such as Ullama for enhanced privacy.
- Permits dynamic toggling between remote and local AI evaluation pipelines to optimize computational efficiency and cost management.

#### **2.3 Platform-Specific Control Mechanism**
- Empowers users with a modular interface to activate or deactivate filtering across designated platforms.
- Enhances processing efficiency by narrowing operational scope to pertinent social media domains.

#### **2.4 Automated Browsing History Purge**
- Identifies and programmatically expunges history records encompassing filtered keywords.
- Implements a rule-based approach permitting manual validation or automated enforcement of deletion protocols.
- Allows persistent user-defined blacklists to refine and streamline future filtering operations.

#### **2.5 AI-Generated Content Attribution**
- Employs computational linguistics techniques to ascertain the probability of textual AI synthesis.
- Incorporates statistical similarity analysis and entropy-based heuristics to discern machine-generated content.
- Displays real-time confidence metrics enabling user-informed interaction with AI-generated discourse.

#### **2.6 Redundant Content Detection & Flagging**
- Utilizes cryptographic hashing functions to generate canonical fingerprints for encountered posts.
- Stores historical content signatures within an indexed local repository to facilitate redundancy assessment.
- Affords customizable visibility controls for duplicated content, encompassing highlighting, blurring, or removal.

#### **2.7 Configurable Content Obfuscation Modes**
- **Soft Filtering:** Implements opacity-based obfuscation, affording discretionary user visibility restoration.
- **Hardcore Blackout:** Executes absolute removal of designated content from rendered web pages.

### **3. Technical Implementation**

#### **3.1 Chrome Extension API Utilization**
- **Web Content Manipulation:** `chrome.webRequest` and `chrome.storage` are leveraged for content interception and storage operations.
- **Browsing History Manipulation:** `chrome.history.deleteUrl()` serves as the core API for deletion automation.
- **Persistent Configurations:** `chrome.storage.local` preserves user-defined preferences across sessions.

#### **3.2 AI-Oriented Processing Framework**
- **Remote OpenAI Integration:**
  - Transmits textual data via API requests for model inference and response generation.
  - Receives and processes sentiment-based or semantic filtration scores to inform removal decisions.
- **Local AI Deployment:**
  - Implements on-device inferencing with locally hosted models (e.g., Ullama) to ensure data sovereignty.
  - Utilizes optimization strategies such as quantized inference for enhanced computational efficiency.

#### **3.3 Hash-Based Duplicate Recognition**
- **Canonicalization Pipeline:**
  - Standardizes and tokenizes content before hash computation.
  - Compares resultant hashes against a stored repository for duplicate detection.

#### **3.4 UI & Customization Layer**
- **User Interface Enhancements:**
  - Provides an intuitive settings dashboard featuring per-platform toggle switches and dynamic input fields.
  - Integrates a real-time status monitor displaying AI computation metrics and filtering efficacy.
- **On-Page Controls:**
  - Empowers users to override or refine filtering results directly within the browser interface.

### **4. Implementation Roadmap**

#### **Phase 1: Repository Initialization & Baseline Architecture**
✅ Establish GitHub repository with structured documentation.
✅ Define modular project architecture to facilitate incremental development.
🔲 Implement foundational Chrome extension scaffolding and permission definitions.

#### **Phase 2: Core Filtering & History Management Features**
🔲 Deploy deterministic keyword-based filtering logic.
🔲 Implement dynamic browsing history sanitation mechanisms.
🔲 Design and integrate a feature-rich user settings page.

#### **Phase 3: AI-Enabled Processing Integration**
🔲 Establish OpenAI API interfacing for remote AI inference.
🔲 Implement Ullama-based local AI inference pipeline.
🔲 Integrate probabilistic AI-generated content detection mechanisms.

#### **Phase 4: UX Refinement & UI Enhancements**
🔲 Augment UI with interactive filtering status feedback.
🔲 Develop an on-screen content manipulation toolkit.
🔲 Refine in-page dynamic toggle and control mechanisms.

#### **Phase 5: Performance Tuning & Robustness Testing**
🔲 Optimize computational workload distribution for real-time filtering.
🔲 Conduct multi-platform testing to validate cross-environment compatibility.
🔲 Ensure compliance with Chrome extension security and permission policies.

#### **Phase 6: Public Release & Community Engagement**
🔲 Publish initial release on Chrome Web Store.
🔲 Develop community contribution guidelines and best practices.
🔲 Solicit and incorporate feedback for iterative refinements.

### **5. Key Considerations & Anticipated Challenges**
- **Computational Overhead:** Optimizing inferencing latency while maintaining accuracy is a primary objective.
- **Web Platform Compliance:** Adapting to evolving social media content policies remains an ongoing necessity.
- **Privacy Safeguards:** Ensuring on-device computation alternatives fortifies user data security.
- **OpenAI API Cost Management:** Provisions for quota monitoring and alternative AI deployments mitigate financial overhead.
- **Local AI Optimization:** Refining memory-efficient models to sustain real-time processing efficacy.

### **6. Prospective Enhancements & Future Trajectory**
- **Adaptive AI Personalization:** Continually evolving user-tailored filtration models via interactive feedback loops.
- **Extended Multi-Model Integration:** Expanding the AI processing ecosystem to encompass diversified LLM architectures.
- **Cross-Device Interoperability:** Facilitating synchronization across browser instances and mobile environments.

This document encapsulates a rigorous, methodologically structured approach to the development of Hardcore Blackout, ensuring an optimized, extensible, and research-driven solution for real-time social media content management.

