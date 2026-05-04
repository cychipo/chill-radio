# Phase 04: Queue Navigation

## Context Links

- `src/services/media-extractor.ts`
- `src/services/media-queue-player.ts`
- `src/types/media.ts`
- `tests/media-queue-player.test.ts`

## Overview

Priority: medium  
Status: planned

Support next/previous navigation for queues loaded from TikTok profile/playlist URLs and single-item behavior for TikTok video URLs.

## Key Insights

- Existing queue playback is sequential and blocking.
- Interactive mode needs a queue controller that owns current index and starts/stops sessions.
- Previous should restart the current item if elapsed time is above a small threshold, or go to previous item if near the beginning.

## Requirements

### Functional

- Convert TikTok input into `MediaInfo[]` queue through existing extractor.
- Keep `currentIndex` in an interactive queue controller.
- `next()` stops current session and starts next item if available.
- `previous()` starts previous item or restarts current item based on elapsed threshold.
- Auto-advance when `mpv` exits normally at end of item.
- Show end-of-queue state and return to URL prompt or wait for user action.

### Non-functional

- No N+1 live extraction after queue is loaded.
- Do not preload all stream bytes; only metadata queue from `yt-dlp`.
- Keep queue controller testable with fake session factory.

## Architecture

```text
InteractiveQueueController
  queue: MediaInfo[]
  currentIndex: number
  currentSession: PlayerSession | null

  start(index)
  next()
  previous()
  stop()
  getState()
```

## Related Code Files

### Modify

- `src/commands/start.ts`
- `src/services/media-queue-player.ts` only if shared abstractions are useful

### Create

- `src/services/interactive-queue-controller.ts`
- `tests/interactive-queue-controller.test.ts`

## Implementation Steps

1. Add queue loading helper that calls existing `extractTikTokMedia()`.
2. Implement queue controller with injected session factory for tests.
3. Wire `next` and `previous` actions from keyboard handler.
4. Handle normal session exit by auto-advancing.
5. Handle user-initiated stop without auto-advance loops.
6. Return to URL prompt after queue ends.

## Todo List

- [ ] Add interactive queue controller.
- [ ] Add fake-session unit tests for next/previous/end behavior.
- [ ] Wire controller into start command.
- [ ] Add end-of-queue screen/prompt behavior.

## Success Criteria

- Single video queue shows `1/1`; next at end does not crash.
- Profile/playlist queue can move next and previous.
- Track end auto-advances to the next item.
- No orphaned session remains after switching tracks.

## Risk Assessment

- TikTok profile queues can be large; if this becomes slow, add a future limit option rather than complicating MVP.

## Security Considerations

- Queue metadata remains untrusted terminal text.
- Do not store playback history.

## Next Steps

Phase 05 validates behavior, docs, and manual test process.
