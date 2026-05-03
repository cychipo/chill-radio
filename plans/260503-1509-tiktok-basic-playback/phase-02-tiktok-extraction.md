# Phase 02: TikTok Extraction

## Context Links

- Existing extractor: `src/services/media-extractor.ts`
- Media type: `src/types/media.ts`
- Error UI: `src/ui/errors.ts`
- Overview: `plans/260503-1509-tiktok-basic-playback/plan.md`

## Overview

Priority: High  
Status: Complete

Harden the extractor path for TikTok video/profile/playlist playback without adding YouTube/SoundCloud-specific behavior.

## Requirements

### Functional

- Use `youtube-dl-exec` to request JSON for TikTok video/profile/playlist inputs.
- For video input, normalize one playable `MediaInfo`.
- For profile/channel input, normalize returned entries into a playback queue.
- For playlist/collection input, normalize returned entries into a playback queue.
- Prefer lightweight audio with `format: 'bestaudio/best'`.
- Normalize title, uploader/channel, duration, stream URL, and webpage URL for each entry.
- Map common extraction failures to concise user-facing errors, including empty profile/playlist results.

### Non-functional

- No live TikTok calls in unit tests by default.
- Keep extractor service small and direct.

## Architecture

```text
extractTikTokMedia(input)
  -> youtubeDl(input.url, options)
  -> normalizeTikTokResult(raw, input)
  -> MediaInfo[]

video input
  -> one MediaInfo

profile/playlist input
  -> entries[] mapped to MediaInfo[]
```

Recommended option baseline:

```ts
{
  dumpSingleJson: true,
  format: 'bestaudio/best',
  noWarnings: true,
}
```

Do not use `noPlaylist: true` for profile/playlist inputs because it can prevent queue extraction. If needed, apply `noPlaylist: true` only for `kind: 'video'`.

If TikTok metadata returns audio URL in a different field during manual validation, extend normalization with the minimal observed field, then test it.

## Related Code Files

### Modify

- `src/services/media-extractor.ts`
- `tests/media-extractor.test.ts`
- `src/ui/errors.ts` if mapping needs a helper

## Implementation Steps

1. Add `extractTikTokMedia(input): Promise<MediaInfo[]>` rather than returning only one `MediaInfo`.
2. Review current extractor options and avoid `noPlaylist: true` for profile/playlist inputs.
3. Normalize single-video results into a one-item array.
4. Normalize `entries` arrays from profile/playlist results into a queue.
5. Filter or fail entries that do not expose a playable stream URL; prefer clear failure if all entries are unplayable.
6. Add error classification for missing stream, empty queue, unavailable/private content, and generic extractor failure.
7. Add normalization tests for TikTok video-like and playlist/profile-like metadata shapes.
8. Add tests for missing stream URL, empty entries, and fallback webpage URL.
9. Keep no-network tests as default.
10. Document opt-in manual live test commands rather than adding flaky tests.

## Todo List

- [ ] Add `MediaInfo[]` extraction API for TikTok.
- [ ] Confirm extractor options for video/profile/playlist inputs.
- [ ] Add TikTok video metadata fixtures in tests.
- [ ] Add TikTok profile/playlist entries fixtures in tests.
- [ ] Add empty queue and missing stream tests.
- [ ] Improve extractor error messages if needed.
- [ ] Keep live extraction manual only.

## Success Criteria

- Deterministic extractor tests pass.
- Video URL extraction returns a one-item queue.
- Profile/playlist URL extraction returns a multi-item queue when entries exist.
- Empty profile/playlist extraction produces a concise CLI error.
- TikTok extraction failure produces a concise CLI error.
- No fake playback or mocked success path is exposed as product behavior.

## Risk Assessment

- TikTok may require updated `yt-dlp`; avoid app-specific hacks before confirming root cause.
- Some TikTok URLs may resolve via redirects; let `yt-dlp` handle network redirects.

## Security Considerations

- Do not persist extracted stream URLs.
- Do not add cookies/auth support in this phase.

## Next Steps

Proceed to playback validation.
