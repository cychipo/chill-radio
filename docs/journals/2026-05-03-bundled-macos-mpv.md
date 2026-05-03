# 2026-05-03 Bundled macOS mpv

Implemented bundled macOS `mpv` setup so TikTok playback can run without requiring `brew install mpv`.

Changes:

- Added macOS `mpv-player/mpv` release download during `postinstall`.
- Extracted the release zip and nested tarball layout used by current macOS assets.
- Copied both the `mpv` executable and sibling `lib/` dylib directory into `vendor/bin/mpv/<platform-arch>/`.
- Kept Linux/Windows on PATH fallback until a verified portable source is selected.
- Updated runtime error messaging and install/architecture docs.

Validation:

- `node scripts/postinstall.js` installed `vendor/bin/mpv/darwin-arm64/mpv` with bundled libraries.
- Live TikTok playback reached now-playing output and kept running through bundled `mpv`; stopped manually to avoid playing the full track.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 5 files, 23 tests.
