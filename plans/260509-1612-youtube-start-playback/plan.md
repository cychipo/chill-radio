---
name: youtube-start-playback
status: completed
priority: high
created: 2026-05-09
blockedBy: []
blocks: []
source: user_stories.md
---

# YouTube Start Playback

## Overview

Extend `chill-radio` beyond TikTok so users can paste YouTube video, playlist, and livestream URLs into `chill-radio start` and hear audio through the same lightweight `yt-dlp` + `mpv` path. Keep the current TikTok behavior working, avoid a UI rewrite, and reuse the existing queue controller/player session.

The core change is to replace TikTok-only URL and extraction boundaries with a small platform-aware media input layer. YouTube support should include normal videos, `youtube.com/live/*` livestream pages, `watch?v=*` live/video pages, playlist URLs, and `watch?v=*&list=*` playlist contexts.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| [Phase 01](./phase-01-media-url-boundary.md) | Complete | Replace TikTok-only input parsing with platform-aware media URL parsing | Shared parser for TikTok + YouTube video/playlist/livestream inputs |
| [Phase 02](./phase-02-youtube-extraction.md) | Complete | Generalize extraction and normalization for YouTube results | `extractMedia` service handles TikTok and YouTube queues safely |
| [Phase 03](./phase-03-play-start-integration.md) | Complete | Wire YouTube support into `play` and `start` without UI rewrite | `chill-radio start` prompt accepts YouTube; `play` accepts YouTube video/playlist/live |
| [Phase 04](./phase-04-tests-validation.md) | Complete | Add deterministic coverage and manual live smoke protocol | Unit tests for parser, normalization, command wiring, playlist/live edge cases |
| [Phase 05](./phase-05-docs-roadmap.md) | Complete | Update user/developer docs to match new behavior | README, guides, architecture, changelog, roadmap updates |

## Dependencies

- Completed start command plan: `plans/260504-0843-start-command-terminal-ui/plan.md`.
- Existing queue/session modules: `src/services/interactive-queue-controller.ts`, `src/services/player-session.ts`, `src/ui/player-screen.ts`.
- Existing extractor module: `src/services/media-extractor.ts`.
- `yt-dlp` binary resolution through `src/platform/binary-paths.ts`.
- `mpv` available through bundled macOS binary or PATH fallback.

## Scope

### In scope

- YouTube video URL playback in `chill-radio start` and `chill-radio play <url>`.
- YouTube playlist URL playback as a queue.
- YouTube `watch` URL with a `list` parameter should behave as playlist by default when playlist context exists.
- YouTube livestream URL playback, including unknown duration/progress handling.
- Preserve TikTok video/profile/playlist behavior.
- Deterministic tests with fake extractor output; no live network calls in unit tests.
- Manual smoke checklist for public YouTube video, playlist, and livestream URLs.

### Out of scope

- YouTube search inside the terminal.
- YouTube channel/user feed playback unless it naturally works through the generic extractor and is documented as unsupported/experimental.
- Cookies/auth flow for age-restricted, private, paid, member-only, or region-locked content.
- Downloading or caching media files.
- SoundCloud support.
- Full-screen TUI rewrite or new terminal UI dependency.

## Architecture Direction

```text
CLI play/start
  -> parseMediaInput(url)
     -> platform: tiktok | youtube
     -> kind: video | playlist | livestream | profile
  -> extractMedia(input)
     -> yt-dlp dump JSON with safe options
     -> normalize single result or entries[] into MediaInfo[]
  -> one-shot playMediaQueue OR interactive InteractiveQueueController
  -> mpv playback with argument arrays and shell: false
```

Keep platform-specific differences at the boundary:

- TikTok video fast path can stay TikTok-only if it still improves latency.
- YouTube should initially use the normal extractor path for reliable metadata and livestream handling.
- UI should display existing title/uploader/duration fields; livestreams may omit duration and show elapsed-only progress.

## Success Criteria

- `npm run dev -- start` accepts a YouTube video URL and starts audio playback.
- `npm run dev -- start` accepts a YouTube playlist URL and builds a queue with next/previous navigation.
- `npm run dev -- start` accepts a YouTube livestream URL and plays audio without requiring a finite duration.
- `npm run dev -- play <youtube-video-url>` and playlist/live equivalents work through the same extractor/queue path.
- TikTok tests and existing TikTok manual behavior still pass.
- Invalid/non-media URLs fail with a clear platform support message, not a TikTok-only message.
- `npm run typecheck`, `npm run build`, and `npm test` pass.
- Docs explain supported YouTube URL types and known unsupported cases.

## Risk Assessment

- YouTube playlist extraction can be slow or large; keep behavior simple, document loading state, and do not add custom pagination until needed.
- `watch?v=*&list=*` may surprise users who expect one video; default to playlist because the user explicitly requested playlist support, and document this behavior.
- Livestreams may have no duration, stale streams, geo/auth restrictions, or long-running playback; UI must tolerate missing duration.
- `yt-dlp` YouTube behavior changes often; keep live checks manual and unit tests deterministic.
- Current setup plan still has partial cross-platform `mpv` installer verification; YouTube support should not depend on solving Linux/Windows bundling in this plan.

## Security Considerations

- Treat all pasted URLs and metadata as untrusted input.
- Never pass user input through shell strings; keep `spawn` argument arrays and `shell: false`.
- Do not store cookies, tokens, stream URLs, playlists, or playback history.
- Keep playlist handling bounded to sequential extraction/playback; do not add background crawling or downloads.

## Cook Command

```bash
/cook /Users/tgiap.dev/devs/chill-radio/plans/260509-1612-youtube-start-playback
```
