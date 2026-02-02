# Mindful Block - Desktop Application

The core desktop application for Mindful Block, built with Tauri v2.

## Prerequisites

-   **Node.js**: v18 or later
-   **Rust**: Stable channel
-   **Package Manager**: `pnpm` (recommended) or `npm`

## Setup

1.  Install dependencies:
    ```bash
    pnpm install
    ```

## Development

To run the application in development mode with hot-reloading:

```bash
pnpm tauri dev
```

This command will start the frontend dev server (Vite) and the Tauri backend.

## Build

To build the application for production (creates an installer):

```bash
pnpm tauri build
```

The output binaries/installers will be located in `src-tauri/target/release/bundle`.

## Structure

-   **`src/`**: React Frontend code.
    -   **`components/`**: React UI components
        -   `BlockList.jsx` - Main rule management interface
        -   `Gamification.jsx` - Streak tracking and progress visualization
        -   `Settings.jsx` - App configuration screen
        -   `Dashboard.jsx` - Overview and statistics
        -   `Login.jsx` - Firebase authentication
        -   `FrictionModal.jsx` - Confirmation dialogs with typing challenge
        -   `Sidebar.jsx` - Navigation component
        -   `StateScreens.jsx` - Loading/error states
    -   **`services/`**: Service layer modules
        -   `GamificationService.js` - Streak and activity tracking
        -   `firebase.js` - Cloud sync and authentication
        -   `tauri.js` - IPC wrapper with mock mode
    -   **`hooks/`**: Custom React hooks
        -   `useBlockRules.js` - Rule management state
        -   Additional custom hooks for state management
    -   **`locales/`**: Internationalization files (i18n)
    -   `App.jsx` - Main application component
    -   `index.css` - Global styles (TailwindCSS)
    -   `main.jsx` - Application entry point
-   **`src-tauri/`**: Rust Backend code.
    -   `src/main.rs` - Tauri backend entry point
    -   Hosts file management
    -   Local HTTP server (port 17430) for extension communication
    -   System commands execution (DNS flush, etc.)
-   **`public/`**: Static assets
-   **Configuration files**: Vite, Tailwind, Tauri configs

## Features

### Core Blocking
-   **Dual-Mode Blocking**: Choose between Hard (hosts-based) and Friction (challenge-based) blocking
-   **Hosts File Management**: Automatic reading, writing, and backing up with admin privilege handling
-   **DNS Flushing**: Automatic cache clearing on Windows for immediate rule application

### Rule Management
-   **CRUD Operations**: Add, edit, delete, and toggle blocking rules
-   **Group Organization**: Organize rules into custom groups
-   **Batch Operations**: Select multiple rules for bulk toggle, delete, or group assignment
-   **CSV Import**: Import rules from external sources

### Gamification
-   **Streak Tracking**: Monitor consecutive days of successful focus sessions
-   **Digital Garden**: Visual representation of progress over time
-   **Calendar View**: Interactive calendar showing active days and usage patterns
-   **Statistics**: Insights into blocking effectiveness

### Cloud Sync
-   **Firebase Integration**: Sync rules, groups, and settings across devices
-   **Google Authentication**: Secure login via OAuth
-   **Automatic Sync**: Real-time synchronization of changes

### Settings
-   **Global Toggle**: Enable/disable all blocking rules with one switch
-   **Clean on Exit**: Automatically remove hosts file entries when closing the app
-   **Customizable Friction**: Configure challenge types (Math, Wait, Typing)
-   **Auto-start**: Launch application on system startup

## Architecture Notes

### React → Tauri IPC Communication

The frontend communicates with the Rust backend via Tauri commands:

```javascript
import { invoke } from '@tauri-apps/api/core';

// Example: Apply blocking rules
await invoke('apply_blocking_rules', { 
  rules: blockingRules 
});
```

The `src/services/tauri.js` wrapper provides:
- Abstraction over Tauri commands
- Mock mode for browser-based development
- Error handling and logging

### Mock Mode for Browser Development

When developing the frontend in a browser (without Tauri), the app automatically enters "Mock Mode":
- Simulates Tauri command responses
- Uses localStorage for persistence
- Allows UI development without Rust backend
- Detected via `window.__TAURI__` check

### Admin Privileges

The application requires Administrator/Root privileges to:
- Modify the system hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows)
- Execute system commands (e.g., `ipconfig /flushdns`)
- Ensure blocking rules take effect immediately

On startup, the app checks for elevation and prompts the user if needed.

