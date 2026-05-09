# Development Roadmap

## Phase 1: Package foundation

Status: complete

- Node.js package metadata.
- TypeScript build config.
- CLI entrypoint and `play <url>` command registration.

## Phase 2: Source architecture

Status: complete

- Separate modules for CLI, extraction, playback, platform utilities, UI, and shared media types.

## Phase 3: Binary installation

Status: partial

- Platform detection and runtime binary resolution exist.
- Automatic `mpv` download remains pending until source and checksum policy are finalized.

## Phase 4: Playback MVP

Status: complete for TikTok and YouTube code paths

- TikTok URL validation and video/profile/playlist classification.
- YouTube URL validation and video/playlist/livestream classification.
- `yt-dlp` metadata and stream queue extraction.
- Sequential playback for extracted TikTok/YouTube queues.
- Repeat track, repeat queue, and shuffle controls in interactive playback.
- Now-playing output before each item.
- `mpv` playback process.

## Phase 5: Tests and docs

Status: complete

- Deterministic unit tests.
- Install, development, user guide, architecture, and standards docs.

## Future phases

- SoundCloud playback.
- YouTube channel/user feed support if needed beyond playlist/video/livestream URLs.
- Verified bundled binary download flow.
