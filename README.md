# Hardcore Blackout

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![MUI](https://img.shields.io/badge/MUI-5.0.0-blue.svg)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Local AI](https://img.shields.io/badge/AI-Ollama-orange.svg)](https://ollama.ai/)

A sophisticated Chrome extension that helps you take control of your social media experience through advanced content filtering and rating, powered by local AI processing with Ollama.

![Hardcore Blackout](hardcore-blocker.jpeg)

## Features

### 🎯 Smart Content Rating
- Real-time content analysis using Ollama AI models
- 0-100 rating scale with visual indicators
- Content classification with icons (💬 Personal, 💼 Business, 💻 Tech, etc.)
- Comprehensive rating components:
  - Content Quality (40%)
  - Emotional Impact (30%)
  - User Preferences (30%)

### 🛡️ Content Filtering
- Platform-specific content detection (Twitter, Facebook, Reddit, LinkedIn)
- Customizable filtering thresholds
- Visual feedback through color-coded ratings
- Quick actions: Hide/Block content
- Automatic content dimming or hiding based on quality scores

### 🔒 Privacy First
- All processing happens locally using Ollama
- No data sent to external servers
- Complete control over AI model selection
- Your social media content never leaves your device

### 📊 Feed Analytics
- Track content quality trends over time
- Identify top authors and content types
- Export analytics data (CSV/JSON)
- LinkedIn-specific feed analysis

### ⚡ Performance
- Efficient post detection and processing
- Smart caching system with 24-hour expiration
- Minimal impact on browsing experience
- Real-time processing counter

### 🎨 Modern UI
- Clean, intuitive interface
- Dark mode support
- Material Design components
- Responsive overlays and popups
- Welcome screen with feature overview

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Styling**: TailwindCSS, PostCSS
- **AI**: Ollama (local LLM server)
- **Build**: Webpack 5, Babel
- **Storage**: Chrome Storage API, SQL.js for analytics

## Prerequisites

Before you begin, ensure you have the following:

1. **Node.js and npm**
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Required version: 16.x or higher

2. **Ollama**
   - Download and install from [ollama.ai](https://ollama.ai/)
   - Run Ollama locally: `ollama serve`
   - Pull a model (e.g., `ollama pull llama3.2` or `ollama pull gemma3:4b`)

3. **Git**
   - For cloning the repository

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chrome-extension-hardcode-blackout.git
cd chrome-extension-hardcode-blackout
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the extension
```bash
npm run build
```

### 4. Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` directory from the project

### 5. Start Ollama
Make sure Ollama is running on your system:
```bash
ollama serve
```

## Development

### Available Scripts

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
npm run prod

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### Project Structure

```
src/
├── background/          # Background service worker
│   ├── index.ts        # Main background script
│   ├── ollama-service.ts # Ollama API integration
│   └── database-service.ts # Analytics database
├── content/            # Content scripts
│   ├── content-script.ts # Main content script
│   └── feed-analyzer.ts  # LinkedIn feed analytics
├── ui/                 # React UI components
│   ├── popup/          # Extension popup
│   └── options/        # Options page
└── utils/              # Shared utilities and types
```

### Development Workflow

1. **Start Ollama**: Ensure Ollama is running locally
2. **Run dev build**: `npm run dev` for automatic rebuilding
3. **Reload extension**: Click refresh in `chrome://extensions/` after changes
4. **Debug**: Use Chrome DevTools for debugging

## Configuration

### Ollama Setup

1. **Install Ollama models**:
   ```bash
   # Recommended models
   ollama pull llama3.2      # Fast, balanced
   ollama pull gemma3:4b     # Google's Gemma
   ollama pull mistral       # Mistral AI
   ollama pull phi3          # Microsoft Phi-3
   ```

2. **Configure in extension**:
   - Click the extension icon
   - Go to Settings
   - Select your preferred Ollama model
   - Adjust inference settings (temperature, max tokens)

### Content Filtering Settings

- **Auto-Hide Threshold**: Posts below this score are hidden (default: 20)
- **Dim Threshold**: Posts below this score are dimmed (default: 40)
- **Highlight Threshold**: Posts above this score are highlighted (default: 80)

## Usage

### Basic Usage

1. **Initial Setup**:
   - Install the extension
   - Ensure Ollama is running
   - Visit the options page for initial configuration

2. **Browsing Social Media**:
   - Navigate to supported platforms (Twitter, Facebook, Reddit, LinkedIn)
   - Posts are automatically analyzed and rated
   - Look for the rating overlay in the top-right of each post

3. **Understanding Ratings**:
   - 🔴 0-20: Very Poor (auto-hidden)
   - 🟠 20-40: Poor (dimmed)
   - 🟡 40-60: Fair (slightly dimmed)
   - 🟢 60-80: Good (normal display)
   - 🟢 80-100: Excellent (may be highlighted)

4. **Content Classification Icons**:
   - 💬 Personal/Social
   - 💼 Business
   - 💻 Technology
   - 💰 Finance
   - 📰 News
   - 🎬 Entertainment
   - 📚 Education
   - 📢 Promotion/Ads
   - 🏛️ Politics
   - 📄 Other

### Advanced Features

- **Feed Analytics** (LinkedIn only):
  - View content quality trends
  - Track top authors
  - Export data for analysis

- **Quick Actions**:
  - Hide: Temporarily hide a post
  - Block: Permanently block similar content

## Troubleshooting

### Common Issues

1. **"Ollama Not Available" error**:
   - Ensure Ollama is running: `ollama serve`
   - Check if it's accessible at `http://localhost:11434`
   - Try clicking "Check Ollama Status" in settings

2. **No ratings appearing**:
   - Check the extension console for errors
   - Verify Ollama has a model loaded
   - Ensure you're on a supported platform

3. **Performance issues**:
   - Try a smaller Ollama model (e.g., `phi3`)
   - Adjust max tokens in settings
   - Clear cached ratings in Chrome storage

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy & Security

- **Local Processing**: All AI inference happens on your device via Ollama
- **No External APIs**: No content is sent to external services
- **Data Storage**: Only ratings and analytics are stored locally
- **Open Source**: Full code transparency

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for local LLM inference
- [Material-UI](https://mui.com/) for UI components
- The open-source community for inspiration and support

---

**Note**: This extension requires Ollama to be installed and running on your local machine. It does not include any AI models - you must download them separately through Ollama.