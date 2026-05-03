# Phase 04: Playback Validation

## Context Links

- Existing player: `src/services/audio-player.ts`
- Binary resolver: `src/platform/binary-paths.ts`
- Dev guide: `README.md`
- Overview: `plans/260503-1509-tiktok-basic-playback/plan.md`

## Overview

Priority: High  
Status: Complete

Make the TikTok playback path testable and manually verifiable without pretending live playback is covered by unit tests.

## Requirements

### Functional

- Start `mpv` with the extracted stream URL using argument arrays.
- Preserve clear startup failure when `mpv` is missing.
- Provide a repeatable manual validation checklist for a public TikTok video URL.
- Provide a repeatable manual validation checklist for a public TikTok user/channel URL.
- Provide a repeatable manual validation checklist for a public TikTok playlist/collection URL when one is available.
- Keep process behavior simple: play extracted items sequentially, wait for each `mpv` exit, then continue or return failure.

### Non-functional

- Do not add progress bar or keyboard controls.
- Do not download media to disk.
- Do not hide player startup failures.

## Architecture

```text
MediaInfo.streamUrl
  -> resolveBinaryPath('mpv')
  -> spawn(mpvPath, ['--no-video', '--really-quiet', streamUrl], { shell: false })
```

Manual validation should cover:

```bash
npm run dev -- --help
npm run dev -- play not-a-url
npm run dev -- play "https://www.tiktok.com/@.../video/..."
npm run dev -- play "https://www.tiktok.com/@..."
npm run dev -- play "https://www.tiktok.com/@.../playlist/..."
```

## Related Code Files

### Modify

- `src/services/audio-player.ts` if player error messages need refinement
- `README.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/DEV.md`

## Implementation Steps

1. Confirm `audio-player.ts` still uses `spawn` with `shell: false`.
2. Keep `mpv` missing error actionable.
3. Document how to install `mpv` for local manual testing without making it part of unit tests.
4. Add manual TikTok test checklist to README/docs.
5. If live manual testing is run during implementation, record result in the completion summary and journal.

## Todo List

- [ ] Verify player spawn arguments.
- [ ] Refine missing `mpv` error if needed.
- [ ] Add manual TikTok playback checklist.
- [ ] Record manual test result during cook.

## Success Criteria

- Player code remains shell-safe.
- Missing `mpv` fails with an actionable message.
- Docs tell developers exactly how to test TikTok playback before product release.

## Risk Assessment

- Manual live TikTok test depends on network, current `yt-dlp`, and regional availability.
- `mpv` install remains local environment responsibility until binary installer phase.

## Security Considerations

- Do not log private cookies or auth tokens.
- Do not store downloaded TikTok media.

## Next Steps

Proceed to tests and docs update.
