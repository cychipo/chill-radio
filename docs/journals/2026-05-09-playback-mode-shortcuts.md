---
title: Playback Mode Shortcuts
created: 2026-05-09
type: implementation
---

# Playback Mode Shortcuts

## Context

Added interactive playback mode controls to `chill-radio start` after YouTube queue support. User chose `R/L/S` shortcuts and stable shuffle order.

## What happened

- Added repeat mode state to `InteractiveQueueController`.
- `R` toggles repeat current track.
- `L` toggles repeat queue/playlist.
- `S` toggles stable shuffle order.
- Shuffle works on extracted queues regardless of TikTok or YouTube source.
- Player screen now displays active mode and new shortcuts.
- Updated docs, changelog, roadmap, and plan status.

## Validation

- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 10 files, 57 tests.

## Unresolved questions

- Manual TTY/audio smoke test still needed for real keypress behavior.
