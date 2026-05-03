# Project Changelog

## 2026-05-03

- Bootstrapped `chill-radio` as a Node.js 18+ TypeScript CLI package.
- Added `chill-radio play <url>` command with URL validation.
- Added real media extraction through `youtube-dl-exec`.
- Added `mpv` playback process startup through safe argument arrays.
- Added platform and package-local binary path resolution.
- Added deterministic tests for URL parsing, metadata normalization, binary paths, and now-playing output.
- Added install, development, usage, architecture, code standards, roadmap, and changelog docs.
- Restricted MVP playback to TikTok URLs first.
- Added TikTok video/profile/playlist URL classification.
- Added TikTok extraction queues and sequential queue playback.
- Added native `yt-dlp` postinstall download to avoid Python 3.10+ runtime failures.
- Added bundled macOS `mpv` postinstall download for zero-config playback on macOS.
- Fixed TikTok playback exit code 2 by letting `mpv` use the native `yt-dlp` hook with the original page URL instead of a direct CDN URL.
