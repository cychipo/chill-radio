# Phase 02: YouTube Extraction

## Context Links

- Plan: `plans/260509-1612-youtube-start-playback/plan.md`
- Current extractor: `src/services/media-extractor.ts`
- Media type: `src/types/media.ts`
- Extractor tests: `tests/media-extractor.test.ts`

## Overview

Priority: High  
Status: Complete

Generalize the TikTok extractor into a platform-aware media extractor that can normalize YouTube video, playlist, and livestream `yt-dlp` JSON into the existing `MediaInfo[]` queue.

## Requirements

### Functional

- Accept generic `MediaInput` from Phase 01.
- Use `yt-dlp --dump-single-json` and `bestaudio/best` for YouTube.
- Use `noPlaylist: true` only when the input is a single video or livestream.
- Allow playlist extraction when input kind is `playlist`.
- Normalize top-level single media and `entries[]` playlist results into `MediaInfo[]`.
- For livestreams, allow missing duration and preserve stream URL + webpage URL.
- Emit user-facing empty queue messages that name the platform.

### Non-functional

- Preserve current TikTok direct-stream metadata behavior.
- Keep tests deterministic with fabricated `yt-dlp` JSON objects.
- Do not add caching or background prefetching.

## Architecture

Refactor current names from TikTok-specific to generic while retaining platform-specific error text where useful:

```text
extractMedia(input: MediaInput)
  -> create yt-dlp using resolveBinaryPath('yt-dlp')
  -> build extractor options from input.kind
  -> normalizeMediaResult(raw, input)
     -> normalizeMediaInfo(raw, fallbackUrl, platform)
     -> normalize entries[] into queue
```

Possible naming:

- `extractMedia(input: MediaInput): Promise<MediaInfo[]>`
- `normalizeMediaResult(raw, input): MediaInfo[]`
- `normalizeMediaInfo(raw, fallbackUrl, defaultTitle): MediaInfo`
- `mapExtractorError(error, platform): UserFacingError`

Keep existing `extractTikTokMedia` as a thin wrapper only if it avoids a large one-step refactor; remove it in Phase 03 if no callers remain.

## Related Code Files

### Modify

- `src/services/media-extractor.ts`
- `src/types/media.ts`
- `tests/media-extractor.test.ts`

## Implementation Steps

1. Change extractor input type from `TikTokInput` to generic `MediaInput`.
2. Replace TikTok-only normalization function names with generic names.
3. Add platform-aware default title, e.g. `Untitled YouTube media`.
4. Add playlist empty message: `No playable YouTube videos found.`
5. Ensure `http_headers` are still preserved for `mpv` playback.
6. Add tests for YouTube single video, playlist entries, livestream missing duration, and empty playlist.
7. Keep Python/native binary error mapping unchanged because it is platform-independent.

## Todo List

- [ ] Generalize extractor input type.
- [ ] Generalize normalization names and messages.
- [ ] Add YouTube result fixtures in tests.
- [ ] Verify livestream missing duration normalization.
- [ ] Keep TikTok normalization tests passing.

## Success Criteria

- YouTube video JSON normalizes to one `MediaInfo`.
- YouTube playlist JSON normalizes to ordered queue entries.
- YouTube livestream JSON with no duration still normalizes.
- Empty/unplayable YouTube playlist gives a clear user-facing error.
- Existing TikTok extractor tests still pass.

## Risk Assessment

- Large YouTube playlists may take time to resolve. Do not implement pagination until users report it; the current loading screen is enough for first support.
- Some playlist entries may be unavailable/private. Preserve current behavior: skip unplayable entries and error only if none are playable.

## Security Considerations

- No shell strings; `youtube-dl-exec` receives structured options.
- Treat `http_headers` from extractor as untrusted data but pass as headers only to `mpv` through argument arrays.
- Do not persist extracted stream URLs.

## Next Steps

Proceed to Phase 03 after generic extraction tests pass.
