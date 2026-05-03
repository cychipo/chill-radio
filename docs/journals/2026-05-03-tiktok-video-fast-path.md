# 2026-05-03 TikTok Video Fast Path

Reduced startup latency for single TikTok video playback.

Root cause:

- Video URLs were pre-extracted with native `yt-dlp` to show metadata.
- Playback then passed the original page URL to `mpv`, which ran `yt-dlp` again through `ytdl_hook`.
- This double extraction delayed audio start.

Changes:

- `play` command now routes TikTok video URLs through a fast path.
- Fast path constructs minimal media from the original URL and starts `mpv` directly.
- Profile and playlist URLs still use extraction first to build queues.
- Added regression coverage for minimal fast-path media creation.

Validation:

- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 6 files, 25 tests.
- Live TikTok video command printed minimal now-playing output immediately and stayed running; stopped manually to avoid playing full track.
