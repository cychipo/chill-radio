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
- Reduced single TikTok video startup latency by skipping pre-extraction and sending the page URL directly to `mpv`.
- Added optional playback timing diagnostics to isolate TikTok startup delay without changing normal output.
- Added direct TikTok stream playback attempt with preserved `yt-dlp` HTTP headers and fallback to the reliable `mpv`/native `yt-dlp` hook.
- Added clear direct-stream fallback messages for TikTok CDN 403 blocks, timeouts, signals, and non-zero `mpv` exits.
