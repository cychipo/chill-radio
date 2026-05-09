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

Status: scoped for first npm release

- Platform detection and runtime binary resolution exist.
- Native `yt-dlp` postinstall setup is enabled for supported macOS/Linux/Windows x64/arm64 targets.
- Bundled `mpv` postinstall setup is enabled for macOS x64/arm64.
- Linux/Windows `mpv` remains a documented PATH fallback until a portable source/checksum policy is finalized.

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

## Phase 6: NPM public release readiness

Status: ready for first automated publish setup

- MIT license and public npm package metadata are configured.
- `bin` points to the verified build output at `dist/src/cli.js`.
- Package tarball validation excludes tests, plans, `.claude`, `vendor`, and local secrets.
- GitHub Actions can auto-bump patch versions, publish to npm, and create GitHub Releases on non-bot pushes to `main`.
- First automated publish remains gated on `NPM_TOKEN`, npm `@tgiap-dev` scope verification, and branch protection allowing the bot release commit.

## Future phases

- SoundCloud playback.
- YouTube channel/user feed support if needed beyond playlist/video/livestream URLs.
- Verified bundled binary download flow.
