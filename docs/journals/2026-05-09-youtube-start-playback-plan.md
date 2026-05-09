---
title: YouTube Start Playback Plan
created: 2026-05-09
type: planning
---

# YouTube Start Playback Plan

## Context

User asked to plan support for pasting YouTube links into `chill-radio start`, covering video, playlist, and livestream audio playback. Current product already supports TikTok in `start`.

## What happened

Created implementation plan at:

```text
plans/260509-1612-youtube-start-playback/plan.md
```

Plan phases:

1. Media URL boundary for TikTok + YouTube.
2. Generic YouTube extraction and normalization.
3. `play` and `start` integration.
4. Deterministic tests plus manual live validation.
5. Docs, roadmap, and changelog updates.

## Decisions

- Keep existing TikTok behavior and TikTok video fast path.
- Add YouTube through generic parser/extractor path first; no custom YouTube fast path yet.
- Treat `watch?v=*&list=*` as playlist by default.
- Support livestreams with missing duration in UI/progress handling.
- Do not implement search, cookies/auth, SoundCloud, or media caching in this scope.

## Impact

No runtime code implemented yet. The plan is ready for `/cook /Users/tgiap.dev/devs/chill-radio/plans/260509-1612-youtube-start-playback`.

## Unresolved questions

- Manual livestream smoke test needs a public live URL during implementation.
