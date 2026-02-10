# Mindful Block

**English** | [Tiếng Việt](README_vi.md)

Mindful Block is a desktop application designed to help users maintain focus by blocking distracting websites. It works by modifying the system's `hosts` file to redirect specified domains to localhost, effectively preventing access.

## Features

### Core Functionality

- **Blocking Modes**:
  - **Hard Block**: Traditional hosts-based blocking. No access allowed.
  - **Friction Block**: Requires completing a challenge to access content. Types:
    - **Math Challenge**: Solve a multiplication problem.
    - **Wait**: Pause for 15 seconds.
    - **Typing**: Type a specific confirmation phrase (e.g., "I choose to be distracted").
- **Hosts File Management**: Automatically handles reading, writing, and backing up the hosts file. Requires Administrator privileges.
- **DNS Flushing**: Automatically flushes the DNS cache on Windows to ensure blocking rules take effect immediately.
- **System Tray Support**: Minimize the application to the system tray to keep focus sessions active in the background. Features a context menu for quick access or full exit.
- **Browser Extension**: Essential for "Friction Mode". Intercepts navigation to blocked sites and displays the challenge interface.

### Rule Management

- **Add/Remove Rules**: easily add domains to your block list.
- **Groups**: Organize blocking rules into custom groups.
- **Batch Operations**: Select multiple rules to toggle, delete, or move them to groups in bulk.
- **Import Rules**: Import blocking rules from external sources (CSV support).
- **Cloud Sync**: Syncs your blocking rules and groups across devices using Firebase Authentication (Google Login).

### Gamification & Progress Tracking

- **Streak System**: Track consecutive days of successful focus sessions. Purchase **Streak Freezes** to protect your progress.
- **Token Shop**: Earn tokens through focus sessions and spend them on:
  - **Site Passes**: Temporary 10-minute unblock for a specific domain.
  - **Group Passes**: Temporary 10-minute unblock for an entire group.
  - **Focus Boosts**: Double your token earnings for the next session.
- **Digital Garden**: Visual representation of your progress and growth over time.
- **Calendar View**: Interactive calendar showing your active days and patterns.
- **Statistics Dashboard**: View insights about your blocking effectiveness and usage patterns.

### Settings & Configuration

- **Global Toggle**: Quickly enable or disable all blocking rules with a single switch.
- **Clean on Exit**: Option to automatically remove all blocking entries from the hosts file when the application is closed.
- **Settings Persistence**: All configuration preferences are saved locally and synced to the cloud.
- **Customizable Friction Challenges**: Configure which types of challenges (Math, Wait, Typing) are used for friction mode.

## Documentation

- [Product Idea & Concept](https://josephpham324.github.io/network-blocker/)
- [Detailed Requirements (SRS/SDD)](https://josephpham324.github.io/network-blocker/documents.html)
- [Tech Stack Blueprint](https://josephpham324.github.io/network-blocker/tech_stack_blueprint.html)
- [Tech Context](docs/tech-context.md)

## Technology Stack

### Frontend (Desktop App)

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend (System Integration)

- **Framework**: [Tauri v2](https://tauri.app/) (Rust)
- **Plugins**:
  - `tauri-plugin-shell`: For running system commands (e.g., `ipconfig`).
  - `tauri-plugin-autostart`: For launching the app on system startup.
  - `tauri-plugin-oauth`: For handling OAuth flows.
  - `is_elevated`: To check for necessary admin rights.

### Cloud & Auth

- **Firebase**: Authentication and Firestore for data persistence and syncing.

## Project Structure

This project is a monorepo managed with **pnpm**:

- **`apps/pc`**: The main desktop application (Tauri + React).
  - `src/components/`: UI components (BlockList, Gamification, Settings, etc.)
  - `src/services/`: Service layer (GamificationService, Firebase, Tauri IPC)
  - `src/hooks/`: Custom React hooks for state management
  - `src-tauri/`: Rust backend for system integration
- **`apps/extension`**: Browser extension (Chrome/Edge/Brave) for friction mode.
- **`apps/mobile`**: Mobile application (Flutter) - 🚧 In Development.
- **`apps/web`**: Web-based interface (if applicable).
- **`backend`**: Backend services (Firebase Functions, Firestore rules).
- **`shared`**: Shared schemas, utilities, and constants used across packages.
- **`docs`**: Project documentation (SRS, SDD, tech context).

## Getting Started

### Prerequisites

- **Node.js** & **pnpm**
- **Rust** (for Tauri backend)
- **Microsoft Visual Studio C++ Build Tools** (on Windows)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the desktop app in development mode:
    ```bash
    cd apps/pc
    pnpm tauri dev
    ```

> **Note**: The application requires Administrator privileges to modify the `hosts` file. Ensure you run your terminal or the application as Administrator.
