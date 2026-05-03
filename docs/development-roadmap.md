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

Status: complete for code path

- URL validation.
- `yt-dlp` metadata and stream extraction.
- Now-playing output.
- `mpv` playback process.

## Phase 5: Tests and docs

Status: complete

- Deterministic unit tests.
- Install, development, user guide, architecture, and standards docs.

## Future phases

- Playlist playback.
- Progress bar.
- Keyboard controls.
- Verified bundled binary download flow.
