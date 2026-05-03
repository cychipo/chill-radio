# 2026-05-03 Native yt-dlp Fix

Fixed TikTok extraction failing before playback because bundled `yt-dlp` was executed with macOS system Python 3.9.

Root cause:

- `youtube-dl-exec` default bundled `yt-dlp` path required Python 3.10+.
- Current environment had `/usr/bin/python3` 3.9.6 and no Python 3.10+ on PATH.
- Extraction failed before any TikTok metadata could be returned.

Changes:

- Added native `yt-dlp` binary path resolution under `vendor/bin/yt-dlp/<platform-arch>/`.
- Updated extractor to call `youtube-dl-exec.create()` with resolved native binary.
- Updated `postinstall` to download the latest native `yt-dlp` release asset for macOS/Linux/Windows x64/arm64.
- Added actionable error mapping for Python-version fallback failures.
- Updated install docs and README dev notes.
- Added regression coverage for native binary path and Python 3.10+ error mapping.

Validation:

- `node scripts/postinstall.js` downloaded `vendor/bin/yt-dlp/darwin-arm64/yt-dlp_macos`.
- Original TikTok video command reached metadata extraction and now-playing output.
- The remaining failure is `mpv` missing on PATH, not `yt-dlp`/Python.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 5 files, 23 tests.

Unresolved:

- Install `mpv` or implement portable `mpv` download to complete live playback on this machine.
