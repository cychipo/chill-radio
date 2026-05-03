# Phase 02: Source Architecture

## Context Links

- Source requirements: `user_stories.md`
- Overview plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`

## Overview

Priority: High  
Status: Complete

Create focused modules that support extraction, playback, install paths, and terminal presentation without overbuilding playlist or keyboard controls yet.

## Requirements

### Functional

- Separate CLI command parsing from business logic.
- Provide services for media extraction and playback process creation.
- Provide utilities for resolving packaged binary paths.
- Provide consistent user-facing errors.

### Non-functional

- Keep files under 200 lines where reasonable.
- Use descriptive kebab-case filenames.
- Keep module boundaries small and testable.

## Architecture

Recommended structure:

```text
src/
├── cli.ts
├── commands/
│   └── play.ts
├── services/
│   ├── media-extractor.ts
│   └── audio-player.ts
├── platform/
│   ├── binary-paths.ts
│   └── platform-info.ts
├── ui/
│   ├── errors.ts
│   └── now-playing.ts
└── types/
    └── media.ts
```

Data flow:

```text
CLI play URL -> media-extractor -> media metadata + audio URL -> audio-player -> mpv child process
```

## Related Code Files

### Create

- `src/services/media-extractor.ts`
- `src/services/audio-player.ts`
- `src/platform/binary-paths.ts`
- `src/platform/platform-info.ts`
- `src/ui/errors.ts`
- `src/ui/now-playing.ts`
- `src/types/media.ts`

### Modify

- `src/commands/play.ts`

## Implementation Steps

1. Define `MediaInfo` type with title, uploader, duration seconds, stream URL, webpage URL.
2. Add `resolveBinaryPath(name)` utility for installed tools.
3. Add `extractMediaInfo(url)` interface; implementation can call `youtube-dl-exec` in Phase 04.
4. Add `playAudio(media)` interface; implementation can spawn `mpv` in Phase 04.
5. Add UI helpers for success and error output.
6. Wire `play` command to service interfaces once implementations exist.

## Todo List

- [ ] Define media types.
- [ ] Create platform utility interfaces.
- [ ] Create extractor service boundary.
- [ ] Create audio player service boundary.
- [ ] Create simple UI helpers.

## Success Criteria

- Source modules compile.
- `play` command imports only the service/UI boundaries it needs.
- No feature placeholders expose fake playback as real functionality.

## Risk Assessment

- Too much abstraction can slow MVP. Keep each module direct and small.
- Keyboard controls and playlist queue should wait until single-track playback works.

## Security Considerations

- Use `spawn`/library APIs with argument arrays, never shell interpolation.
- Treat metadata from external sites as untrusted terminal text.

## Next Steps

Proceed to Phase 03 binary installation design.
