# Prompt Library

Prompt Library is a fast, offline-first macOS desktop app for capturing, organizing, and reusing prompts. It runs fully locally with a SQLite database stored in your macOS app data directory.

## Tech
- Tauri 2 + Next.js + TypeScript + Tailwind
- SQLite via `rusqlite` (bundled)

## Prerequisites
- Node.js 18+
- Rust (stable) via `rustup`
- Xcode Command Line Tools

## Install
```bash
npm install
```

## Dev Run (hot reload)
```bash
npm run dev
```

This will launch the Tauri shell and a Next.js dev server.

## Build macOS App Artifact
```bash
npm run build
```

The packaged macOS app will be in `src-tauri/target/release/bundle`.

## Data Storage Location
Prompt data is stored in your macOS app data directory. The exact path is shown in Settings. It is typically similar to:
```
~/Library/Application Support/Prompt Library/prompt-library.db
```

You can open the data folder from the Settings page.

## Import / Export
- Export: Settings → Export JSON
- Import: Settings → Import JSON (merges by `id`, creates if missing)

The JSON format matches the internal prompt structure.

## Signed/Notarized Build Guidance (manual)
1. Create an Apple Developer ID certificate and install it in Keychain Access.
2. Set `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID` environment variables.
3. Run `npm run build` and sign the generated `.app` bundle.
4. Notarize the signed app using `xcrun notarytool submit`.
5. Staple the notarization ticket using `xcrun stapler staple`.

Refer to Apple’s official notarization documentation for current commands and requirements.

## Future Upgrades (not implemented)
- Browser clipper for one-click capture
- Email/newsletter ingestion
- AI-powered tagging and prompt summaries
