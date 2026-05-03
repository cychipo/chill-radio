# System Architecture

`chill-radio` is a Node.js CLI package for streaming audio from media URLs in the terminal.

## Runtime flow

```text
CLI play TikTok URL
  -> validate TikTok URL
  -> classify video/profile/playlist input
  -> extract one or more media items with yt-dlp
  -> for each media item
     -> render now-playing text
     -> spawn mpv with the extracted audio URL
```

## Modules

```text
src/
├── cli.ts
├── commands/play.ts
├── services/media-extractor.ts
├── services/media-queue-player.ts
├── services/audio-player.ts
├── platform/binary-paths.ts
├── platform/platform-info.ts
├── ui/errors.ts
├── ui/now-playing.ts
└── types/media.ts
```

## Boundaries

- `commands/play.ts` validates TikTok CLI input, classifies video/profile/playlist URLs, and maps user-facing failures to exit codes.
- `services/media-extractor.ts` calls `youtube-dl-exec` with safe options and normalizes TikTok results into a media queue.
- `services/media-queue-player.ts` renders and plays extracted media items sequentially.
- `services/audio-player.ts` starts `mpv` through `child_process.spawn` with argument arrays.
- `platform/binary-paths.ts` checks bundled binaries first and falls back to `PATH`.
- `ui/` contains formatting only.

## Current installation strategy

The package includes postinstall platform detection and runtime binary resolution. `postinstall` downloads native `yt-dlp` for supported platforms and bundled official `mpv-player/mpv` archives for macOS x64/arm64. Linux and Windows currently use the same runtime resolver but rely on `mpv` being available on `PATH` unless a package-local binary is provided.
