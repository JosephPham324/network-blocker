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

-   `src/`: React Frontend code.
-   `src-tauri/`: Rust Backend code.
-   `src/locales/`: Internationalization files.
-   `src/components/`: React components.
