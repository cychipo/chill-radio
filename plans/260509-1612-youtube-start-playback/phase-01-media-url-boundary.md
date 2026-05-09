# Phase 01: Media URL Boundary

## Context Links

- Plan: `plans/260509-1612-youtube-start-playback/plan.md`
- Current parser: `src/commands/play.ts`
- Current TikTok type: `src/types/tiktok.ts`
- Current tests: `tests/play-command.test.ts`

## Overview

Priority: High  
Status: Complete

Replace TikTok-only parsing with a shared media input parser that identifies supported platform and URL kind before extraction. Keep TikTok behavior unchanged while adding YouTube video, playlist, and livestream classification.

## Requirements

### Functional

- Accept `youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com`, `youtu.be`.
- Keep accepting `tiktok.com`, `www.tiktok.com`, `vm.tiktok.com`.
- Classify YouTube URLs:
  - `youtu.be/{id}` -> `video`.
  - `/watch?v={id}` -> `video` unless `list` is present.
  - `/watch?v={id}&list={id}` -> `playlist`.
  - `/playlist?list={id}` -> `playlist`.
  - `/live/{id}` -> `livestream`.
- Preserve TikTok classification: `video`, `playlist`, `profile`.
- Return clear errors for invalid URL, non-http URL, and unsupported platform.

### Non-functional

- No network calls in parsing.
- No new runtime dependency.
- Keep parser deterministic and easy to unit test.

## Architecture

Introduce a generic input type, likely in `src/types/media.ts` or a small new type file if it keeps files under 200 lines:

```ts
export type MediaPlatform = 'tiktok' | 'youtube';
export type MediaInputKind = 'video' | 'playlist' | 'profile' | 'livestream';
export type MediaInput = {
  url: string;
  platform: MediaPlatform;
  kind: MediaInputKind;
};
```

Rename or wrap `parseTikTokInput` into `parseMediaInput`. Keep a compatibility export only if needed by existing tests during refactor; prefer updating callers directly.

## Related Code Files

### Modify

- `src/commands/play.ts`
- `src/commands/start.ts`
- `src/types/media.ts`
- `tests/play-command.test.ts`

### Create only if needed

- `src/services/media-input.ts` if parser extraction keeps `play.ts` smaller and clearer.

## Implementation Steps

1. Add `MediaInput` platform/kind types.
2. Extract URL parser from `play.ts` into a reusable function.
3. Add host allowlists for TikTok and YouTube.
4. Implement YouTube path/search-param classification.
5. Update current TikTok parser tests to generic parser tests.
6. Keep error copy platform-neutral: e.g. `Supported platforms: TikTok and YouTube.`

## Todo List

- [ ] Define generic media input types.
- [ ] Implement YouTube host detection.
- [ ] Implement YouTube kind classification.
- [ ] Preserve TikTok behavior.
- [ ] Update parser tests.

## Success Criteria

- Parser accepts TikTok URLs exactly as before.
- Parser accepts YouTube video, playlist, and livestream URL shapes.
- Unsupported URLs fail before extractor execution.
- No source file grows past the project’s 200-line guidance without deliberate split.

## Risk Assessment

- `watch?v=*&list=*` can be interpreted as one video or playlist. For this plan, classify as playlist to support continuous playback.
- YouTube Shorts are not explicitly requested; they may classify as video if added cheaply, but do not overbuild around Shorts.

## Security Considerations

- Only parse URL using the standard `URL` API.
- Never execute parsed input.
- Keep protocol restriction to HTTP(S).

## Next Steps

Proceed to Phase 02 after parser tests describe all supported YouTube input kinds.
