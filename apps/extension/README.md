# Mindful Block - Browser Extension

This is the browser extension component of **Mindful Block**. It works in tandem with the Desktop Application to provide "Friction" based blocking.

## How it Works

1.  **Communication**: The extension polls the desktop application's local server (`http://127.0.0.1:17430/rules`) to get the current list of blocked sites and active friction modes.
2.  **Interception**: When you navigate to a blocked site, the extension intercepts the request.
3.  **Challenge**: Instead of blocking access completely, it presents a challenge (Math, Wait, or Typing) based on your settings.
4.  **Grace Period**: If you pass the challenge, you are granted temporary access to the site (default 5 minutes).
5.  **Timer Display**: The extension popup shows the remaining time for active grace periods.

## Features

### Real-time Synchronization
-   **Automatic Polling**: Fetches blocking rules from the desktop app every few seconds
-   **Live Updates**: Rule changes take effect immediately in the browser
-   **Connection Status**: Indicates whether the desktop app is running and reachable

### Grace Period Management
-   **Timed Access**: Temporary access tokens for recently unblocked sites
-   **Countdown Timer**: Extension popup displays remaining time for each active grace period
-   **Automatic Expiry**: Grace periods automatically expire after the configured duration
-   **Persistent Tokens**: Stored in `chrome.storage.local` and survive browser restarts

### Friction Challenges
-   **Math Challenge**: Solve a random multiplication problem (e.g., "What is 7 × 8?")
-   **Wait Timer**: Wait for a countdown (default 15 seconds) before proceeding
-   **Typing Challenge**: Type a specific confirmation phrase (e.g., "I choose to be distracted")
    -   Text cannot be copied/pasted, must be manually typed
    -   Case-sensitive matching

### User Interface
-   **Block Page**: Custom interstitial page (`block.html`) shown when accessing blocked sites
-   **Extension Popup**: Quick overview of active rules and grace period timers
-   **Visual Feedback**: Clear indicators for challenge progress and success/failure states

## Installation

Since this extension is designed to work specifically with the local Mindful Block desktop app, it is installed via "Developer Mode".

1.  Open Chrome (or Edge/Brave) and go to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top-right corner).
3.  Click **Load unpacked**.
4.  Navigate to this folder: `[Project Root]/apps/extension`.
5.  Select the folder. The extension "Mindful Block" should appear in your list.

## Architecture

### File Structure
```
apps/extension/
├── manifest.json       # Extension manifest (V3)
├── background.js       # Service worker (rule polling, navigation interception)
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic (displays rules, timers)
├── popup.css           # Popup styling
├── block.html          # Friction challenge page
├── block.js            # Challenge logic (math, wait, typing)
├── block.css           # Challenge page styling
├── content.js          # Content script (if applicable)
└── icons/              # Extension icons
```

### Background Script Flow

1. **Polling Loop** (`background.js`):
   ```javascript
   // Every 3 seconds
   fetch('http://127.0.0.1:17430/rules')
     .then(rules => updateBlockedDomains(rules))
   ```

2. **Navigation Interception**:
   ```javascript
   chrome.webNavigation.onBeforeNavigate.addListener((details) => {
     if (isBlocked(details.url) && !hasGracePeriod(details.url)) {
       chrome.tabs.update(details.tabId, {
         url: 'block.html?target=' + encodeURIComponent(details.url)
       });
     }
   });
   ```

3. **Grace Period Storage**:
   ```javascript
   // Store with expiration timestamp
   chrome.storage.local.set({
     [`grace_${domain}`]: Date.now() + (5 * 60 * 1000) // 5 minutes
   });
   ```

### Challenge Page Logic (`block.js`)

The block page supports three challenge types:

-   **Math**: Generates random multiplication problem, validates answer
-   **Wait**: Displays countdown timer, enables "Continue" button when complete
-   **Typing**: Shows phrase to type, validates exact match (no copy/paste)

On successful challenge completion:
1. Creates grace period token
2. Stores in `chrome.storage.local`
3. Redirects user to originally requested URL

## Development

### File Responsibilities

-   **`manifest.json`** (V3): Extension configuration and permissions
    -   Declares service worker, content scripts, and web accessible resources
    -   Requests permissions: `webNavigation`, `tabs`, `storage`
    
-   **`background.js`**: Service worker (background script)
    -   Polls desktop server for blocking rules
    -   Intercepts navigation to blocked sites
    -   Manages grace period lifecycle
    
-   **`popup.html/js/css`**: Extension popup interface
    -   Displays count of active blocking rules
    -   Shows remaining time for active grace periods
    -   Provides connection status to desktop app
    
-   **`block.html/js/css`**: Friction challenge page
    -   Rendered when user attempts to access blocked site
    -   Implements three challenge types
    -   Handles challenge completion and grace period creation
    
-   **`content.js`**: Content script (optional)
    -   Can inject UI elements into pages if needed
    -   Currently minimal or unused

### Local Development Workflow

The extension is built with Vanilla JavaScript—no build step required:

1.  **Edit Files**: Make changes to HTML, CSS, or JS files
2.  **Reload Extension**: Go to `chrome://extensions` and click the reload icon
3.  **Test**: Navigate to a blocked site to test challenge flow
4.  **Debug**: Use Chrome DevTools:
    -   **Service Worker**: Click "Inspect views: service worker" in extension details
    -   **Popup**: Right-click extension icon → "Inspect popup"
    -   **Block Page**: Open DevTools normally when on `block.html`

### Testing

**Prerequisites:**
-   Desktop app must be running (for rule polling)
-   At least one friction-mode rule configured

**Test Scenarios:**
1.  **Navigation Interception**: Navigate to blocked site, verify redirect to `block.html`
2.  **Math Challenge**: Complete math problem, verify grace period granted
3.  **Wait Challenge**: Wait for countdown, verify button enables
4.  **Typing Challenge**: Type confirmation phrase, verify exact match required
5.  **Grace Period**: After passing challenge, verify temporary access granted
6.  **Timer Display**: Check popup shows remaining grace period time
7.  **Grace Period Expiry**: Wait for expiry, verify blocking resumes

### Debugging Tips

-   **Connection Issues**: Check if desktop app is running and server is accessible at `http://127.0.0.1:17430/rules`
-   **Storage Inspection**: Use Chrome DevTools → Application → Storage → Local Storage to view grace period tokens
-   **Console Logs**: Enable verbose logging in `background.js` for troubleshooting
