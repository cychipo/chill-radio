---
name: tiktok-basic-playback
status: completed
priority: high
created: 2026-05-03
blockedBy: []
blocks: []
source: user_stories.md
---

# TikTok Basic Playback

## Overview

Implement and harden the first user-facing playback path for TikTok only: `chill-radio play <tiktok-url>` should validate TikTok URLs, detect whether the URL is a single video, user/channel feed, or playlist/collection, extract playable audio streams with `yt-dlp`, show now-playing metadata, and play through `mpv` with clear errors.

The current codebase already has a generic single-track playback scaffold. This plan narrows platform support to TikTok before expanding to YouTube or SoundCloud, but it must cover TikTok video links, TikTok user/channel links, and TikTok playlist/collection links for the basic product flow.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| [Phase 01](./phase-01-tiktok-url-boundary.md) | Complete | Restrict MVP input to TikTok URLs and classify input kind | TikTok domain/path validation and tests |
| [Phase 02](./phase-02-tiktok-extraction.md) | Complete | Extract TikTok video(s) from video/profile/playlist URLs | TikTok-focused extractor options, metadata normalization, errors |
| [Phase 03](./phase-03-tiktok-queue-playback.md) | Complete | Play one or many TikTok videos sequentially | queue playback service and CLI wiring |
| [Phase 04](./phase-04-playback-validation.md) | Complete | Validate real playback behavior | mpv startup checks, dev smoke commands, manual test protocol |
| [Phase 05](./phase-05-tests-and-docs.md) | Complete | Update coverage and docs | deterministic tests and TikTok-only docs |

## Dependencies

- Existing setup plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`.
- Runtime: Node.js 18+.
- CLI: `commander`.
- Extractor: `youtube-dl-exec` / `yt-dlp`.
- Player: `mpv` through `child_process.spawn`.
- Local `mpv` on PATH or compatible binary under `vendor/bin/mpv`.

## Scope

### In scope

- TikTok single-video URL playback.
- TikTok user/channel/profile URL playback by extracting and playing videos sequentially.
- TikTok playlist/collection URL playback by extracting and playing videos sequentially when supported by `yt-dlp`.
- TikTok URL allowlist and input-kind classification at CLI boundary.
- Best audio stream extraction through `yt-dlp`.
- User-friendly errors for invalid URL, non-TikTok URL, empty profile/playlist result, extraction failure, missing stream, and player startup failure.
- Deterministic tests that do not call live TikTok by default.
- Manual live test checklist for one public TikTok video URL, one public profile URL, and one public playlist/collection URL if available.

### Out of scope

- YouTube support.
- SoundCloud support.
- Cross-platform playlist/profile/channel playback outside TikTok.
- Cookies/authenticated TikTok content.
- Progress bar and keyboard controls.
- Automatic portable `mpv` download.

## Success Criteria

- `npm run dev -- play <valid-tiktok-video-url>` reaches real extraction and starts `mpv` when platform/network allow it.
- `npm run dev -- play <valid-tiktok-profile-url>` extracts videos and plays them sequentially when `yt-dlp` returns entries.
- `npm run dev -- play <valid-tiktok-playlist-url>` extracts videos and plays them sequentially when `yt-dlp` supports that URL shape.
- `npm run dev -- play <youtube-or-soundcloud-url>` exits non-zero with a clear TikTok-only message.
- Invalid URLs still fail before extractor execution.
- Empty profile/playlist extraction exits with a clear message.
- Unit tests pass without live network calls.
- `npm run typecheck`, `npm run build`, and `npm test` pass.
- README/docs state current MVP supports TikTok video/profile/playlist first, not YouTube/SoundCloud yet.

## Risk Assessment

- TikTok extraction can change without warning; keep live tests manual and document expected flakiness.
- Some TikTok URLs may redirect or require region/auth/cookies; do not overbuild auth for MVP.
- `mpv` availability is still environment-dependent until portable binary install is implemented.

## Security Considerations

- Never pass URLs through shell strings.
- Keep `spawn` with `shell: false` and argument arrays.
- Treat TikTok metadata as untrusted terminal text.
- Do not store cookies, tokens, downloaded media, or extracted stream URLs in committed files.

## Cook Command

```bash
/cook /Users/tgiap.dev/devs/chill-radio/plans/260503-1509-tiktok-basic-playback
```
