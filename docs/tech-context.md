# Technology Context

## Tech Stack Overview

### Desktop Application (`apps/pc`)
-   **Frontend Framework**: React 18 + Vite
-   **Language**: Javascript/JSX
-   **Styling**: TailwindCSS
-   **State Management**: React Hooks + Custom Hooks (`useBlockRules`, `useSettings`)
-   **Backend Framework**: [Tauri v2](https://tauri.app/) (Rust)
-   **Inter-Process Communication (IPC)**: Tauri Commands (`invoke`)
    -   Wrapper: `src/services/tauri.js` (Handles Mock vs. Real Tauri env)

#### Frontend Components
-   **`BlockList.jsx`**: Rule management UI with group support, batch operations, CSV import
-   **`Gamification.jsx`**: Comprehensive focus assistant UI featuring streak tracking, digital garden, calendar visualization, and a token-based shop with selection modals.
-   **`Settings.jsx`**: App configuration (global toggle, clean on exit, friction preferences)
-   **`Dashboard.jsx`**: Overview with statistics and quick actions
-   **`Login.jsx`**: Firebase Google authentication interface
-   **`FrictionModal.jsx`**: Typing-challenge modal for confirming critical actions
-   **`Sidebar.jsx`**: Navigation between app sections
-   **`StateScreens.jsx`**: Loading and error state displays

-   **Key Features**:
    -   **Administrative Friction**: "Safe Guards" preventing accidental changes (requires typing confirmation).
    -   **Block List Management**: Import/Export CSV support.
    -   **Advanced Gamification**: Token economy, temporary unblock passes (Site/Group), and streak protection mechanics.
    -   **System Tray Integration**: Custom tray icon with context menu and minimize-to-tray behavior.

### Backend Logic (`apps/pc/src-tauri`)
-   **Language**: Rust
-   **Key Crates**:
    -   `tiny_http`: Runs a lightweight local server on port `17430`.
    -   `is_elevated`: Checks for Admin/Root privileges.
    -   `tauri-plugin-shell`: Executes system commands (e.g., `ipconfig`).
    -   `tauri-plugin-autostart`: Manages start-on-boot logic.
-   **Key Commands**:
    -   `apply_blocking_rules`: Writes to hosts file & updates internal server cache.
    -   `check_admin_privileges`: Verifies elevation.
    -   `start_server`: Initializes OAuth flow listener.

### Services Layer (`apps/pc/src/services`)
-   **`GamificationService.js`**: 
    -   Manages streak calculation, persistence, and protection (Freeze Charges).
    -   Tracks daily activity and focus session results.
    -   Handles token transactions and "Buff" (temporary unblock) lifecycle management.
    -   Provides statistics and inventory data for the gamification UI.
-   **`firebase.js`**: 
    -   Firebase SDK initialization
    -   Cloud sync operations for rules and settings
    -   Authentication flow helpers
-   **`tauri.js`**: 
    -   IPC wrapper for Tauri commands
    -   Mock mode fallback for browser development
    -   Error handling for command invocations

### Mobile Application (`apps/mobile`)
-   **Status**: ✅ **Active Development**
-   **Framework**: React Native via [Expo](https://expo.dev/) (SDK 54)
-   **Navigation**: Expo Router v6 (file-based, similar to Next.js)
-   **Language**: TypeScript
-   **Key Libraries**:
    -   `firebase` — Firestore + Auth with `AsyncStorage` persistence
    -   `expo-auth-session` — Google OAuth (with auth.expo.io proxy for Expo Go)
    -   `lucide-react-native` — Icons
    -   `@react-navigation/bottom-tabs` — Tab navigation
-   **Screens** (under `app/`):
    -   `login.tsx` — Email/Password + Google Sign-In
    -   `(tabs)/index.tsx` — Dashboard with live stats from Firestore
    -   `(tabs)/blocklist.tsx` — Real-time rule list with toggle switches
    -   `(tabs)/gamification.tsx` — Focus timer (Pomodoro), digital garden, token shop
    -   `(tabs)/settings.tsx` — Preferences, master block toggle, logout
-   **Auth**: `context/AuthContext.tsx` wraps the app with Firebase `onAuthStateChanged`
-   **Data Hooks**: `hooks/useBlockRules.ts`, `hooks/useAnalytics.ts` — adapted from PC app's hooks, Tauri/Rust calls removed
-   **Metro Config**: Custom `metro.config.js` to handle pnpm monorepo symlinks and Firebase CJS bundles
-   **Run Dev**: `cd apps/mobile && npx expo start -c` (Expo Go)
-   **Native Build**: `npx expo run:android` (required for Google Sign-In on real device)

### Browser Extension (`apps/extension`)
-   **Manifest**: Version 3
-   **Stack**: Vanilla JS, HTML, CSS
-   **Key Features**:
    -   **Real-time Sync**: Polls desktop app's local server for rule updates
    -   **Grace Period Display**: Shows remaining time in extension popup
    -   **Three Challenge Types**: Math problems, wait timers, typing confirmations
-   **Mechanism**:
    -   **Polling**: Fetches active rules from the desktop app's local server (`http://127.0.0.1:17430/rules`).
    -   **Interception**: `chrome.webNavigation.onBeforeNavigate` & `chrome.tabs.update` for navigation blocking.
    -   **Storage**: `chrome.storage.local` for temporary whitelist tokens (Grace Period with expiration).
    -   **Friction UI**: Custom block page (`block.html`) with challenge overlays.
    -   **Popup**: Displays active rules count and remaining grace period time.

### Cloud & Database
-   **Platform**: Firebase
-   **Auth**: Google Auth (via `tauri-plugin-oauth` on desktop).
-   **Database**: Firestore (NoSQL).
-   **Functions**: TypeScript (in `backend/firebase`).

### Shared (`shared`)
-   **Schemas**: Zod definitions for consistent data validation.
    -   `BlockRule`: { domain, isActive, mode, ... }
    -   `RuleGroup`: { id, name, rules, ... }

## Development Environment
-   **Package Manager**: `pnpm` (Monorepo Workspaces).
-   **Build Pipeline**: `turbo` (Task runner).
-   **OS Requirement**: Windows (Primary target for Hosts file manipulation), though code supports Unix paths.

## Critical Workflows

### 1. Hosts File Update (Hard Mode)
The app reads the existing hosts file, preserves content outside its designated block (`# MINDFULBLOCK_START`), and rewrites the block with `127.0.0.1` mappings for all active "hard" mode rules.

### 2. Friction Mode Synchronization
1.  **Rust**: Stores active friction rules in `Arc<Mutex<Vec<String>>>`.
2.  **Rust Server**: Exposes these rules at `GET /rules`.
3.  **Extension**: Fetches this JSON list.
4.  **Extension**: Matches current URL against list. If match:
    -   Redirects to internal `block.html`.
