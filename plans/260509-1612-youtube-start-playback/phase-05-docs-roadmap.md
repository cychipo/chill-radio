# Phase 05: Docs and Roadmap

## Context Links

- Plan: `plans/260509-1612-youtube-start-playback/plan.md`
- README: `README.md`
- User guides: `docs/GUIDE.md`, `docs/GUIDE-VI.md`
- Developer docs: `docs/DEV.md`
- Architecture: `docs/system-architecture.md`
- Roadmap: `docs/development-roadmap.md`
- Changelog: `docs/project-changelog.md`

## Overview

Priority: Medium  
Status: Complete

Update user-facing and developer docs after implementation changes behavior. Docs should clearly state supported YouTube URL types, limitations, and validation checklist.

## Requirements

### Functional

- README current state mentions TikTok + YouTube support.
- Guide docs explain `start` can accept TikTok or YouTube URLs.
- Document YouTube video, playlist, and livestream examples.
- Architecture doc changes TikTok-only boundaries to generic media boundaries.
- Changelog records YouTube playback support.
- Roadmap moves YouTube expansion from future item to implemented/in-progress, depending on final implementation state.

### Non-functional

- Keep docs concise.
- Do not include real private URLs or extracted stream URLs.
- Keep Vietnamese and English guides aligned where both exist.

## Architecture

Docs should mirror actual code boundaries after implementation:

```text
parse media URL -> platform/kind -> extract media queue -> play via mpv
```

Avoid claiming SoundCloud or arbitrary `yt-dlp` site support until implemented and tested.

## Related Code Files

### Modify

- `README.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/DEV.md` if dev validation steps change.
- `docs/system-architecture.md`
- `docs/development-roadmap.md`
- `docs/project-changelog.md`

## Implementation Steps

1. Update README MVP section and current flow.
2. Add YouTube examples for `play` and `start`.
3. Add known limitations: no cookies/auth, no search, no guaranteed huge playlist performance.
4. Update architecture module responsibility text from TikTok-only to generic media + platform-specific parser/extractor.
5. Update changelog with date 2026-05-09.
6. Update roadmap status for YouTube expansion.
7. Verify docs do not exceed local `docs.maxLoc` guidance where practical.

## Todo List

- [ ] Update README.
- [ ] Update English guide.
- [ ] Update Vietnamese guide.
- [ ] Update architecture and developer docs.
- [ ] Update roadmap and changelog.

## Success Criteria

- Docs match implemented CLI behavior.
- Docs list YouTube video, playlist, livestream as supported.
- Docs still state TikTok support accurately.
- Docs do not imply SoundCloud support.

## Risk Assessment

- Docs can overpromise platform reliability. Keep wording honest: public URLs that `yt-dlp` can resolve, not all YouTube content.
- If manual livestream smoke test cannot be performed, document it as pending instead of claiming verified.

## Security Considerations

- Do not include sensitive test URLs or cookies.
- Keep guidance against committing tokens/binaries.

## Next Steps

After docs update, mark implementation plan phases complete as work is verified and ask the user whether to commit.
