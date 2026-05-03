# Phase 03: TikTok Queue Playback

## Context Links

- Existing command: `src/commands/play.ts`
- Existing player: `src/services/audio-player.ts`
- Existing now-playing UI: `src/ui/now-playing.ts`
- Overview: `plans/260503-1509-tiktok-basic-playback/plan.md`

## Overview

Priority: High  
Status: Complete

Play TikTok extraction results sequentially so a video URL plays one video, a user/channel URL plays videos from that page, and a playlist/collection URL plays its videos.

## Requirements

### Functional

- Accept a `MediaInfo[]` queue from extractor.
- For a single video URL, play the one extracted item.
- For a profile/channel URL, play extracted entries sequentially in extractor order.
- For a playlist/collection URL, play extracted entries sequentially in extractor order.
- Render now-playing details before each item starts.
- Stop the queue and return non-zero if `mpv` fails to start or playback returns a failure code.
- Return a clear error when the extracted queue is empty.

### Non-functional

- Keep queue behavior simple; no shuffle, repeat, skip, keyboard controls, or persistence.
- Do not pre-download media.
- Do not load more than the extractor returns for MVP; pagination/infinite scroll is future work unless `yt-dlp` handles it.

## Architecture

```text
play command
  -> extractTikTokMedia(input)
  -> playMediaQueue(mediaItems)
     -> for each media
        -> renderNowPlaying(media)
        -> playAudio(media)
```

Potential helper:

```ts
async function playMediaQueue(items: MediaInfo[]): Promise<void> {
  if (items.length === 0) throw new UserFacingError('No playable TikTok videos found.');

  for (const item of items) {
    console.log(renderNowPlaying(item));
    await playAudio(item);
  }
}
```

## Related Code Files

### Create

- `src/services/media-queue-player.ts` if queue logic makes `play.ts` too busy
- `tests/media-queue-player.test.ts` if queue helper is created and testable without spawning `mpv`

### Modify

- `src/commands/play.ts`
- `src/services/media-extractor.ts`
- `src/services/audio-player.ts` only if player API needs a small adjustment
- `tests/play-command.test.ts`

## Implementation Steps

1. Change command flow from single `MediaInfo` to `MediaInfo[]`.
2. Add a small queue playback helper if it keeps `play.ts` focused.
3. Render now-playing before every item.
4. Play each item sequentially with `await`.
5. Stop at first playback failure and surface the user-facing error.
6. Add deterministic unit tests for empty queue and sequential order using injected player/render functions if helper exists.
7. Keep playlist/profile pagination out of scope unless handled automatically by `yt-dlp` output.

## Todo List

- [ ] Update command flow to consume `MediaInfo[]`.
- [ ] Add queue playback helper if useful.
- [ ] Add empty queue error.
- [ ] Add sequential playback tests.
- [ ] Ensure one-video flow still works.

## Success Criteria

- Video URL plays exactly one item.
- Profile/channel URL plays all extracted playable entries sequentially.
- Playlist/collection URL plays all extracted playable entries sequentially.
- Empty extraction exits with a clear user-facing error.
- Queue logic does not add progress controls or playlist management beyond sequential playback.

## Risk Assessment

- TikTok profile/playlist extraction may return many entries. MVP should rely on `yt-dlp` output and avoid custom crawling.
- A failed item stops playback; skip-on-error can be a later UX decision.

## Security Considerations

- Do not write queue URLs to disk.
- Continue using `spawn` argument arrays for each item.

## Next Steps

Proceed to playback validation.
