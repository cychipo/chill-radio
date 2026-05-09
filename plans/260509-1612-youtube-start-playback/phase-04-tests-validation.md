# Phase 04: Tests and Validation

## Context Links

- Plan: `plans/260509-1612-youtube-start-playback/plan.md`
- Test command: `npm test`
- Type/build commands: `npm run typecheck`, `npm run build`
- Current parser tests: `tests/play-command.test.ts`
- Current extractor tests: `tests/media-extractor.test.ts`

## Overview

Priority: High  
Status: Complete

Add deterministic tests for YouTube parser/extractor behavior and define manual live smoke tests for real `yt-dlp` + `mpv` playback. Unit tests must not rely on live YouTube URLs.

## Requirements

### Functional

- Parser tests cover YouTube video, playlist, `watch+list`, livestream, short URL, invalid URL, unsupported platform.
- Extractor normalization tests cover YouTube single result, playlist entries, skipped unplayable entries, empty playlist, livestream without duration.
- Command-level tests cover YouTube no longer fails with TikTok-only error.
- Existing TikTok tests remain meaningful after generic rename.
- Manual validation includes one video, one playlist, one livestream.

### Non-functional

- Tests remain deterministic and fast.
- No network calls in Vitest suite.
- Build/typecheck must pass after implementation.

## Architecture

Keep unit tests focused on pure functions:

```text
parseMediaInput(url) -> MediaInput
normalizeMediaResult(raw, input) -> MediaInfo[]
createFastTikTokVideoMedia(input) -> MediaInfo
```

Manual live test belongs in docs/checklist, not automated CI.

## Related Code Files

### Modify

- `tests/play-command.test.ts`
- `tests/media-extractor.test.ts`
- Add tests for `src/commands/start.ts` only if prompt copy/parser integration is testable without TTY complexity.

## Implementation Steps

1. Update parser test names from TikTok-only to generic media input.
2. Add YouTube host and path cases.
3. Update extractor test imports to generic normalization names.
4. Add YouTube normalization fixtures.
5. Run `npm run typecheck`.
6. Run `npm run build`.
7. Run `npm test`.
8. Manually smoke test in a real terminal:
   - `npm run dev -- play "<public-youtube-video-url>"`
   - `npm run dev -- play "<public-youtube-playlist-url>"`
   - `npm run dev -- play "<public-youtube-livestream-url>"`
   - `npm run dev -- start`, paste the same URL types.

## Todo List

- [ ] Add parser unit tests.
- [ ] Add extractor normalization tests.
- [ ] Update stale TikTok-only assertions.
- [ ] Run typecheck/build/test.
- [ ] Perform manual live smoke tests when network/media environment is available.

## Success Criteria

- Test suite passes without network.
- TypeScript compiles.
- Manual video playback starts with `mpv`.
- Manual playlist playback builds a queue and next/previous works in `start`.
- Manual livestream playback tolerates missing duration.

## Risk Assessment

- Live YouTube URLs can fail due to region/auth or stream expiry. Use public, non-age-restricted samples and document failures as environmental unless extractor fails for multiple normal public URLs.
- `start` mode needs TTY, so automated coverage should avoid brittle pseudo-terminal tests unless already supported.

## Security Considerations

- Do not commit real cookies, tokens, or private URLs used during manual testing.
- Do not store extracted stream URLs in test snapshots or docs.

## Next Steps

Proceed to Phase 05 after validation commands pass and manual smoke results are recorded in docs/changelog if implementation proceeds.
