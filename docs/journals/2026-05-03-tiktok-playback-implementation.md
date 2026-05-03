# 2026-05-03 TikTok Playback Implementation

Implemented TikTok-first playback scope from `plans/260503-1509-tiktok-basic-playback/`.

Key changes:

- `play` command now accepts TikTok URLs only and rejects other platforms clearly.
- TikTok URL paths are classified as video, profile, or playlist.
- Extractor returns `MediaInfo[]` queues for video/profile/playlist results.
- Added sequential queue playback with now-playing output before each item.
- Updated tests for TikTok input classification, extraction queue normalization, and queue playback.
- Updated README and docs for TikTok video/profile/playlist MVP.

Validation:

- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 5 files, 21 tests.
- `npm run dev -- --help` passed.
- `npm run dev -- play not-a-url` returned clear invalid TikTok URL error.
- `npm run dev -- play "https://youtube.com/watch?v=1"` returned TikTok-only error.

Unresolved:

- Live TikTok playback was not run because no public TikTok video/profile/playlist URLs were provided in-session.
- `mpv` availability and TikTok regional/auth restrictions still need manual environment validation.
