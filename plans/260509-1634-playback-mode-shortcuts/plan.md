---
name: playback-mode-shortcuts
status: completed
priority: high
created: 2026-05-09
blockedBy: []
blocks: []
source: user request
---

# Playback Mode Shortcuts

## Overview

Add interactive playback modes to `chill-radio start` for both TikTok and YouTube queues: repeat current item, repeat queue/playlist, and shuffle. Use shortcuts chosen by user: `R` repeat current song, `L` repeat queue/playlist, `S` shuffle. Shuffle should create a stable shuffled order so next/previous remain predictable during the session.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| Phase 01 | Complete | Extend queue controller state | repeat/shuffle state and stable playback order |
| Phase 02 | Complete | Wire keyboard shortcuts and UI | R/L/S controls and mode display |
| Phase 03 | Complete | Tests and docs | controller/UI tests and guide updates |

## Scope

### In scope

- `R`: toggle repeat current item.
- `L`: toggle repeat queue/playlist.
- `S`: toggle shuffle order.
- Shuffle works for any extracted queue, TikTok or YouTube.
- Next/previous follow stable shuffled order when shuffle is enabled.
- End-of-track auto-advance respects repeat current and repeat queue.
- Repeat current and repeat queue are mutually exclusive.

### Out of scope

- Persisting playback mode across sessions.
- Seeded/user-configurable shuffle.
- CLI flags for playback modes.

## Success Criteria

- UI shows active repeat/shuffle modes.
- R/L/S work in `start` mode.
- Unit tests cover repeat current, repeat queue, shuffle order, and keyboard wiring.
- `npm run typecheck`, `npm run build`, and `npm test` pass.
