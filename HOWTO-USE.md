# How to Use Hardcore Blackout

## Table of Contents
1. [Installation](#installation)
2. [Requirements](#requirements)
3. [Initial Setup](#initial-setup)
4. [Basic Usage](#basic-usage)
5. [Configuration Options](#configuration-options)
6. [Advanced Settings](#advanced-settings)
7. [Troubleshooting](#troubleshooting)

## Installation

### From Source
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chrome-extension-hardcode-blackout.git
   cd chrome-extension-hardcode-blackout
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` directory from the project

### From Chrome Web Store
*(Coming soon)*

## Requirements

- Chrome browser (version 88 or higher)
- Minimum 4GB RAM recommended
- At least 500MB free disk space for models
- For development:
  - Node.js 16.x or higher
  - npm 7.x or higher

## Initial Setup

1. After installation, click the extension icon in your toolbar
2. The extension will automatically download and set up the default AI model
3. Initial setup may take a few minutes to complete
4. You can start using the extension immediately with default settings

## Basic Usage

### Quick Controls
- Click the extension icon to access quick controls
- Toggle the extension on/off using the main switch
- View current statistics:
  - Processed posts count
  - Average content score
  - Number of blocked posts

### Content Rating System
Posts are rated on a 0-100 scale:
- 🟢 81-100: High-quality content
- 🟡 61-80: Good content
- 🟡 41-60: Neutral content
- 🟠 21-40: Low-quality content
- 🔴 0-20: Potentially problematic content

### Post Actions
Each post will have an overlay with:
- Quality score (0-100)
- Quick action buttons:
  - Hide: Temporarily hide the post
  - Block: Permanently block similar content

## Configuration Options

### Filter Settings
Access through extension popup or options page:

1. **Auto-Hide Threshold** (Default: 20)
   - Posts below this score are automatically hidden
   - Range: 0-100
   - Recommended: 20-30 for balanced filtering

2. **Dim Threshold** (Default: 40)
   - Posts below this score appear dimmed
   - Range: 0-100
   - Recommended: 40-50 for moderate visibility

3. **Highlight Threshold** (Default: 80)
   - Posts above this score are highlighted
   - Range: 0-100
   - Recommended: 80-90 for exceptional content

### Rating Components

1. **Content Quality** (40% of total score)
   - Writing Quality (0-10)
   - Information Density (0-10)
   - Source Credibility (0-10)
   - Originality (0-10)

2. **Emotional Impact** (30% of total score)
   - Toxicity Level (0-10)
   - Emotional Manipulation (0-10)
   - Social Harmony (0-10)

3. **User Preferences** (30% of total score)
   - Topic Alignment (0-10)
   - Source Preference (0-10)
   - Historical Interaction (0-10)

## Advanced Settings

### AI Model Settings

1. **Model Selection**
   - Fast (Smaller): TinyLlama 1.1B model
     - Best for low-resource devices
     - Fastest processing speed
     - Recommended for laptops and basic usage

   - Default (Balanced): Llama-2-7B model
     - Good balance of speed and accuracy
     - Recommended for most users
     - Moderate resource usage

   - Accurate (Larger): Llama-2-13B model
     - Best accuracy but requires more resources
     - Recommended for desktop computers with 8GB+ RAM
     - Slower processing speed

   Models are automatically downloaded during installation and updated when you change the model type. No manual configuration is required.

2. **Inference Settings**
   - Temperature (0.0-1.0): Controls randomness in analysis
     - Lower values (0.1-0.3): More consistent, conservative ratings
     - Higher values (0.7-0.9): More varied ratings
     - Default: 0.7

   - Max Tokens (50-500): Maximum response length
     - Lower values: Faster processing, less detailed analysis
     - Higher values: More detailed analysis, slower processing
     - Default: 100

### Platform-Specific Settings
Configure different thresholds for each platform:
- Twitter/X
- Facebook
- Reddit

### Cache Settings
- Rating Cache Size: Control memory usage
- Cache Duration: How long to keep ratings
- Clear Cache: Reset stored ratings

## Troubleshooting

### Common Issues

1. **High CPU Usage**
   - Try switching to the "Fast" model
   - Increase cache size
   - Reduce processing frequency

2. **Slow Content Analysis**
   - Check your internet connection
   - Verify model is properly loaded
   - Consider using a lighter model

3. **Missing Ratings**
   - Refresh the page
   - Check if extension is enabled
   - Verify platform is supported

### Debug Mode
Enable debug mode for detailed logging:
1. Right-click extension icon
2. Select "Options"
3. Enable "Debug Mode"
4. Open Chrome DevTools to view logs

### Support
For additional help:
- Check the [GitHub Issues](https://github.com/yourusername/chrome-extension-hardcode-blackout/issues)
- Submit a bug report
- Join our community discussions

## Privacy Notes

- All content analysis happens locally on your device
- No data is sent to external servers
- Model files are stored locally
- Ratings and preferences are stored in your browser
- You can delete all stored data from the options page

## Performance Tips

1. **Optimize for Your Device**
   - Adjust model size based on available RAM
   - Use cache to reduce processing load
   - Configure processing frequency

2. **Battery Life**
   - Use "Fast" model on laptops
   - Enable "Battery Saver Mode"
   - Increase cache duration

3. **Memory Management**
   - Regular cache clearing
   - Adjust maximum stored ratings
   - Monitor memory usage in task manager