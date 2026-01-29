# Mindful Block - Browser Extension

This is the browser extension component of **Mindful Block**. It works in tandem with the Desktop Application to provide "Friction" based blocking.

## How it Works

1.  **Communication**: The extension polls the desktop application's local server (`http://127.0.0.1:17430/rules`) to get the current list of blocked sites and active friction modes.
2.  **Interception**: When you navigate to a blocked site, the extension intercepts the request.
3.  **Challenge**: Instead of blocking access completely, it presents a challenge (Math, Wait, or Typing) based on your settings.
4.  **Grace Period**: If you pass the challenge, you are granted temporary access to the site (default 5 minutes).

## Installation

Since this extension is designed to work specifically with the local Mindful Block desktop app, it is installed via "Developer Mode".

1.  Open Chrome (or Edge/Brave) and go to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top-right corner).
3.  Click **Load unpacked**.
4.  Navigate to this folder: `[Project Root]/apps/extension`.
5.  Select the folder. The extension "Mindful Block" should appear in your list.

## Development

-   **Manifest**: `manifest.json` (V3)
-   **Background Script**: `background.js` (Handles navigation blocking logic)
-   **Content Scripts**: `content.js` (Injects UI into pages)
-   **Popup**: `popup.html` / `popup.js` (Simple status display)

The extension is built with Vanilla JavaScript, HTML, and CSS. No build step is required—just edit the files and reload the extension in `chrome://extensions` to see changes.
