# Fixing Ollama CORS Issues for Chrome Extension

The Chrome extension receives 403 Forbidden errors when trying to access Ollama API because Ollama doesn't include CORS headers by default.

## Solution: Configure Ollama to Allow CORS

### Option 1: Set Environment Variable (Recommended)

Before starting Ollama, set the OLLAMA_ORIGINS environment variable:

```bash
# macOS/Linux
export OLLAMA_ORIGINS="*"
ollama serve

# Or to allow specific Chrome extension origin:
export OLLAMA_ORIGINS="chrome-extension://*"
ollama serve
```

### Option 2: Use launchctl on macOS (for Ollama.app)

1. Create a launch configuration:
```bash
# Stop Ollama if running
killall Ollama

# Set environment variable for Ollama.app
launchctl setenv OLLAMA_ORIGINS "*"

# Restart Ollama.app
open -a Ollama
```

### Option 3: Run Ollama with Custom Configuration

```bash
# Stop current Ollama instance
killall ollama

# Run with CORS enabled
OLLAMA_ORIGINS="*" ollama serve
```

## Testing CORS is Enabled

After restarting Ollama with CORS enabled, test it:

```bash
curl -I http://localhost:11434/api/tags
```

You should see headers like:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Chrome Extension Manifest

Ensure your manifest.json has the correct permissions:

```json
{
  "host_permissions": [
    "http://localhost:11434/*",
    "http://127.0.0.1:11434/*"
  ]
}
```

## Alternative: Use Ollama WebUI or API Proxy

If you cannot modify Ollama's CORS settings, consider:
1. Using Ollama WebUI which proxies requests
2. Creating a simple proxy server that adds CORS headers
3. Using the Chrome extension's background script as a proxy

## Current Status

The extension code is properly configured for Chrome extension fetch requirements. The 403 errors are due to Ollama's default CORS policy blocking Chrome extension requests.