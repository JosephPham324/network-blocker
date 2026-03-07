# Mindful Block

**English** | [Tiếng Việt](README_vi.md)

Mindful Block is a **cross-platform digital focus ecosystem** — a combination of a Windows desktop app, an Android mobile app, and a browser extension — that helps users eliminate distractions by blocking websites, tracking focus sessions, and building positive habits through gamification.

---

## Features

### Core Functionality

- **Blocking Modes**:
  - **Hard Block**: Hosts-file-based blocking. No access allowed.
  - **Friction Block**: Requires completing a challenge before access. Types: Math, Wait, Typing.
- **Hosts File Management**: Automatically reads, writes, and backs up the Windows hosts file. Requires Administrator privileges.
- **DNS Flushing**: Automatically flushes the DNS cache to apply rules immediately.
- **System Tray**: Minimize to tray to keep sessions active in the background.
- **Browser Extension**: Intercepts navigation to blocked sites and displays friction challenges.

### Rule Management

- **Add/Remove Rules**: Easily add domains to your block list.
- **Groups**: Organize rules into custom groups.
- **Batch Operations**: Toggle, delete, or move multiple rules at once.
- **Import CSV**: Bulk import rules from a CSV file.
- **Cloud Sync**: Rules and settings sync across devices via Firebase Firestore.

### Gamification & Progress Tracking

- **Streak System**: Track consecutive focus days. Buy Streak Freezes to protect your streak.
- **Token Shop**:
  - **Site Pass**: Temporary 10-minute unblock for a domain.
  - **Group Pass**: Temporary 10-minute unblock for a group.
  - **Focus Boost**: Double token earnings for the next session.
- **Digital Garden**: Visual representation of your growth over time.
- **Calendar View**: Interactive calendar showing your active days.
- **Statistics Dashboard**: Insights about blocking effectiveness.

### Settings & Configuration

- **Global Toggle**: Enable/disable all blocking with one switch.
- **Clean on Exit**: Remove all blocking entries when the app closes.
- **Settings Persistence**: Preferences saved locally and synced to the cloud.

---

## Documentation

- [Product Idea & Concept](https://josephpham324.github.io/network-blocker/)
- [Detailed Requirements (SRS/SDD)](https://josephpham324.github.io/network-blocker/documents.html)
- [Tech Stack Blueprint](https://josephpham324.github.io/network-blocker/tech_stack_blueprint.html)
- [Tech Context](docs/tech-context.md)

---

## Technology Stack

### 🖥️ Desktop App (`apps/pc`)

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | TailwindCSS |
| Icons | Lucide React |
| System | Tauri v2 (Rust) |
| Auth | Firebase (Google OAuth) |
| Sync | Firebase Firestore |

### 📱 Android App (`apps/mobile`)

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Navigation | Expo Router (file-based) |
| Auth | Firebase Auth + Google Sign-In (`expo-auth-session`) |
| Sync | Firebase Firestore |
| Icons | Lucide React Native |

### 🔌 Browser Extension (`apps/extension`)

| Layer | Technology |
|---|---|
| Manifest | v3 |
| Stack | Vanilla JS, HTML, CSS |
| Sync | Polls local Tauri server at `http://127.0.0.1:17430/rules` |

### ☁️ Cloud & Backend

| Service | Technology |
|---|---|
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Functions | Firebase Functions (TypeScript) |

---

## Project Structure

```
network-blocker/             ← Monorepo root (pnpm workspaces)
├── apps/
│   ├── pc/                  ← Desktop app (Tauri + React)
│   │   ├── src/             ← React frontend
│   │   └── src-tauri/       ← Rust backend
│   ├── mobile/              ← Android app (Expo React Native) ✅
│   │   ├── app/             ← Expo Router screens
│   │   ├── context/         ← AuthContext (Firebase auth state)
│   │   ├── hooks/           ← useBlockRules, useAnalytics
│   │   └── services/        ← firebase.ts
│   └── extension/           ← Chrome/Edge browser extension
├── backend/
│   └── firebase/            ← Firebase Functions & Firestore rules
├── shared/                  ← Shared Zod schemas & utilities
└── docs/                    ← Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 & **pnpm** ≥ 9
- **Rust** (for Tauri desktop app)
- **Android Studio** (for React Native mobile dev)
- **Windows** (for desktop/hosts file features)

### Installation

```bash
# Clone & install all dependencies
git clone https://github.com/JosephPham324/network-blocker.git
cd network-blocker
pnpm install
```

### Run Desktop App

```bash
pnpm pc:dev
# or: cd apps/pc && pnpm tauri dev
```
> Requires Administrator privileges for hosts file modification.

### Run Android App

```bash
cd apps/mobile
npx expo start -c       # Development (Expo Go) — clear cache
# or for native build:
npx expo run:android    # Full native build (required for Google Sign-In)
```

### Run Browser Extension

Load `apps/extension/` as an unpacked extension in Chrome/Edge.

---

> **Note**: The desktop app requires running as Administrator on Windows to modify the `hosts` file.
