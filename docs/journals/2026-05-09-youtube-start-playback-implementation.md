---
title: YouTube Start Playback Implementation
created: 2026-05-09
type: implementation
---

# YouTube Start Playback Implementation

## Context

Implemented the approved plan at `plans/260509-1612-youtube-start-playback/plan.md` so `chill-radio play` and `chill-radio start` can accept YouTube video, playlist, and livestream URLs in addition to existing TikTok URLs.

## What happened

- Added generic media input parsing for TikTok and YouTube.
- Generalized extraction and normalization around `MediaInput`.
- Wired YouTube support into `play` and `start` while keeping TikTok video fast path.
- Updated terminal copy from TikTok-only to TikTok/YouTube support.
- Updated parser/extractor/queue tests and docs.
- Marked the YouTube playback plan and phase files complete.

## Validation

- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 10 files, 53 tests.

## Decisions

- `watch?v=*&list=*` is treated as playlist playback.
- YouTube uses the normal extractor path first; no YouTube-specific fast path yet.
- Livestreams can omit duration and still normalize/play.

## Unresolved questions

- Manual live smoke test still needs real public YouTube video/playlist/livestream URLs in a TTY environment.
