# Phase 04: Playback MVP

## Context Links

- Epic 2 and Epic 3.1 in `user_stories.md`
- Overview plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`

## Overview

Priority: High  
Status: Complete

Implement the first real vertical slice: `chill-radio play <url>` extracts audio metadata and plays it through `mpv`.

## Requirements

### Functional

- Accept one video URL from supported platforms handled by `yt-dlp`.
- Extract best lightweight audio stream and basic metadata.
- Print now-playing details: title, uploader/channel, duration when available.
- Spawn `mpv` with the extracted stream URL.
- Report clear user-facing errors for invalid URLs, extraction failure, unavailable content, and player startup failure.

### Non-functional

- Avoid browser/WebView dependencies.
- Keep CPU/RAM low by streaming through `mpv`.
- Do not implement playlist or keyboard controls in this phase.

## Architecture

```text
play command
  -> extractMediaInfo(url)
  -> renderNowPlaying(media)
  -> playAudio(media.streamUrl)
  -> map errors to colored CLI output
```

## Related Code Files

### Modify

- `src/commands/play.ts`
- `src/services/media-extractor.ts`
- `src/services/audio-player.ts`
- `src/ui/errors.ts`
- `src/ui/now-playing.ts`

## Implementation Steps

1. Add URL parsing/validation in the CLI boundary.
2. Call `youtube-dl-exec` with safe arguments to fetch JSON metadata and audio URL.
3. Normalize metadata to `MediaInfo`.
4. Print now-playing card with `chalk`.
5. Spawn `mpv` using resolved binary path and argument arrays.
6. Map extractor/player errors to concise red messages.
7. Return correct process exit codes.

## Todo List

- [ ] Implement URL validation.
- [ ] Implement real metadata extraction.
- [ ] Implement `mpv` playback process.
- [ ] Add colored now-playing output.
- [ ] Add user-friendly error mapping.

## Success Criteria

- `chill-radio play <valid-url>` starts real audio playback on current platform.
- Invalid URL exits non-zero with readable message.
- Extraction/player failures do not crash with raw stack traces in normal mode.

## Risk Assessment

- Some platforms restrict stream extraction or require cookies/auth; out of MVP scope unless user asks.
- TikTok/SoundCloud behavior may change; `yt-dlp` update path is important.

## Security Considerations

- Never pass URL through shell strings.
- Escape or sanitize untrusted metadata before terminal output if needed.

## Next Steps

Proceed to Phase 05 for tests and docs after MVP works locally.
