# Phase 03: Play and Start Integration

## Context Links

- Plan: `plans/260509-1612-youtube-start-playback/plan.md`
- One-shot command: `src/commands/play.ts`
- Interactive command: `src/commands/start.ts`
- Queue player: `src/services/media-queue-player.ts`
- Interactive controller: `src/services/interactive-queue-controller.ts`
- Player session: `src/services/player-session.ts`

## Overview

Priority: High  
Status: Complete

Wire generic media parsing/extraction into both CLI entry points. Keep `start` UI behavior mostly unchanged: user pastes URL, loading screen resolves queue, player screen handles pause/next/previous/quit.

## Requirements

### Functional

- `chill-radio play <youtube-url>` works for video, playlist, livestream.
- `chill-radio start` prompt accepts YouTube URLs.
- Loading labels no longer say only TikTok.
- Command descriptions and argument help mention TikTok and YouTube.
- TikTok video fast path remains available for TikTok videos only.
- YouTube uses normal extraction path first; no custom fast path in this plan.

### Non-functional

- Avoid UI rewrite.
- Keep one-shot and interactive flows using same parser/extractor.
- Preserve queue navigation behavior.

## Architecture

```text
play command
  -> parseMediaInput(url)
  -> if platform=tiktok && kind=video: use existing fast path
  -> else extractMedia(input) -> playMediaQueue(queue)

start command
  -> readMediaUrl()
  -> parseMediaInput(url)
  -> extractMedia(input)
  -> InteractiveQueueController(queue, createPlayerSession)
```

Update UI copy only where platform-specific text is wrong:

- `TikTok URL>` -> `Media URL>` or `TikTok/YouTube URL>`.
- `Analyzing TikTok URL` -> `Analyzing media URL`.
- `Open the interactive TikTok terminal player.` -> `Open the interactive terminal player.`

## Related Code Files

### Modify

- `src/commands/play.ts`
- `src/commands/start.ts`
- `src/services/media-extractor.ts`
- `tests/play-command.test.ts`
- Potentially add/update start command tests if existing coverage is expanded.

## Implementation Steps

1. Update command descriptions and CLI argument descriptions.
2. Replace `parseTikTokInput` calls with `parseMediaInput`.
3. Replace `extractTikTokMedia` calls with `extractMedia`.
4. Keep `playTikTokVideoFast` guarded by `input.platform === 'tiktok' && input.kind === 'video'`.
5. Rename `readTikTokUrl` to `readMediaUrl`.
6. Update loading labels and prompt text.
7. Ensure `start` loops back with clear error message if YouTube extraction fails.

## Todo List

- [ ] Wire generic parser/extractor into `play`.
- [ ] Wire generic parser/extractor into `start`.
- [ ] Preserve TikTok video fast path.
- [ ] Update prompt/loading copy.
- [ ] Add command behavior tests for YouTube acceptance.

## Success Criteria

- `play` no longer rejects YouTube at URL boundary.
- `start` no longer displays TikTok-only copy for generic input.
- TikTok video fast path still exists and tests still cover fallback media creation.
- Existing queue controller/player session code does not need platform-specific branches.

## Risk Assessment

- A broad rename can churn tests. Keep the smallest rename set needed for clear boundaries.
- TikTok fast path imports may keep old names around. Prefer direct updates over compatibility shims unless a temporary wrapper reduces risk.

## Security Considerations

- Continue using argument arrays and existing player services.
- Do not add shell execution around `yt-dlp` or `mpv`.
- Do not log full extracted stream URLs in normal UI.

## Next Steps

Proceed to Phase 04 after integration builds and behavior tests cover both platforms.
