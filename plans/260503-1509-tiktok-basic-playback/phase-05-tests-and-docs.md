# Phase 05: Tests and Docs

## Context Links

- Existing tests: `tests/`
- README: `README.md`
- Docs: `docs/`
- Overview: `plans/260503-1509-tiktok-basic-playback/plan.md`

## Overview

Priority: Medium  
Status: Complete

Update deterministic coverage and documentation so the codebase clearly presents TikTok as the first supported playback platform.

## Requirements

### Functional

- Unit tests for TikTok URL allowlist.
- Unit tests for TikTok video/profile/playlist classification.
- Unit tests for non-TikTok rejection.
- Unit tests for TikTok-like single-video metadata normalization.
- Unit tests for TikTok-like profile/playlist entries normalization.
- Unit tests for queue playback behavior if a queue helper is created.
- Docs that describe TikTok-only MVP for video/profile/playlist URLs and future YouTube/SoundCloud scope.

### Non-functional

- No default live network tests.
- Keep docs concise and accurate to implemented behavior.
- Do not claim cross-platform playlists, progress bar, keyboard controls, YouTube, or SoundCloud are implemented.

## Architecture

Recommended test additions:

```text
tests/play-command.test.ts        # TikTok URL validation + input kind classification
tests/media-extractor.test.ts     # TikTok video/profile/playlist metadata normalization
tests/media-queue-player.test.ts  # Sequential queue behavior if helper is created
tests/now-playing.test.ts         # Keep existing display coverage
tests/binary-paths.test.ts        # Keep existing path coverage
```

Recommended docs updates:

```text
README.md
README dev/test section
docs/GUIDE.md
docs/GUIDE-VI.md
docs/DEV.md
docs/system-architecture.md
docs/development-roadmap.md
docs/project-changelog.md
```

## Related Code Files

### Modify

- `tests/play-command.test.ts`
- `tests/media-extractor.test.ts`
- `README.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/DEV.md`
- `docs/system-architecture.md`
- `docs/development-roadmap.md`
- `docs/project-changelog.md`

## Implementation Steps

1. Update tests for TikTok-only command behavior.
2. Update tests for video/profile/playlist classification and extraction normalization.
3. Update queue tests if a queue helper is created.
4. Update docs to replace generic media URL examples with TikTok video/profile/playlist examples.
5. Add future support note for YouTube/SoundCloud.
6. Run `npm run typecheck`.
7. Run `npm run build`.
8. Run `npm test`.
9. Run source CLI smoke tests.
10. Run live TikTok manual tests for video/profile/playlist if public URLs are available and environment has `mpv`.

## Todo List

- [ ] Update command tests.
- [ ] Update input-kind classification tests.
- [ ] Update extractor tests for video/profile/playlist.
- [ ] Update queue playback tests if helper is created.
- [ ] Update README/docs.
- [ ] Run typecheck/build/tests.
- [ ] Run CLI smoke tests.
- [ ] Record live manual test result or blocker for video/profile/playlist.

## Success Criteria

- `npm run typecheck` passes.
- `npm run build` passes.
- `npm test` passes.
- `npm run dev -- play not-a-url` returns invalid URL error.
- `npm run dev -- play <non-tiktok-url>` returns TikTok-only error.
- Tests cover TikTok video/profile/playlist URL behavior.
- Docs match TikTok-first video/profile/playlist implemented scope.

## Risk Assessment

- Docs can drift by mentioning future platforms as current support. Keep language explicit: TikTok first, YouTube/SoundCloud later.

## Security Considerations

- Do not add real TikTok URLs that may reveal private user content to committed tests.
- Do not commit playback logs containing transient stream URLs.

## Next Steps

After this plan is cooked, create separate plans for YouTube and SoundCloud support only after TikTok path is stable.
