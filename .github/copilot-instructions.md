# Project Guidelines

## Architecture & Tech Stack
- **Frontend:** Pure Vanilla HTML, CSS, and JavaScript. No build step, package manager, or bundlers are used.
- **Backend / Services:** Firebase Firestore (using Firebase Web SDK) is used primarily for email watchlist sign-ups and tracking data.
- **Localization:** Different languages are served via static HTML in dedicated directories (e.g., `de/`, `es/`, `pl/`, `sk/`), coordinated by a JavaScript router (`assets/lang.js`).
- **Hosting:** Intended for static hosting (e.g., Firebase Hosting, GitHub Pages).

## Build and Test
- **Running Locally:** Since there is no build step, simply serve the root directory using a local static HTTP server.
  - Python: `python3 -m http.server`
  - Node: `npx serve` or `npx http-server`
  - VS Code Live Server extension.

## Conventions
- Keep HTML, CSS, and JavaScript vanilla and minimal. Avoid introducing heavy frameworks or build tools unless explicitly requested.
- When modifying language-specific content, ensure parity across all supported language directories (`de/`, `es/`, `pl/`, `sk/`, and the default at the root).
