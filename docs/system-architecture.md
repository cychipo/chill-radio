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

CLI start
  -> render interactive TikTok URL prompt
  -> validate and extract TikTok queue
  -> spawn mpv with JSON IPC enabled
  -> render progress and controls
  -> send pause/next/previous/quit actions through queue controller and mpv IPC
```

## Modules

```text
src/
├── cli.ts
├── commands/play.ts
├── commands/start.ts
├── services/media-extractor.ts
├── services/media-queue-player.ts
├── services/audio-player.ts
├── services/player-session.ts
├── services/interactive-queue-controller.ts
├── platform/binary-paths.ts
├── platform/platform-info.ts
├── ui/errors.ts
├── ui/now-playing.ts
└── types/media.ts
```

## Boundaries

- `commands/play.ts` validates TikTok CLI input, classifies video/profile/playlist URLs, and maps user-facing failures to exit codes.
- `commands/start.ts` runs the interactive TTY prompt/player loop.
- `services/media-extractor.ts` calls `youtube-dl-exec` with safe options and normalizes TikTok results into a media queue.
- `services/media-queue-player.ts` renders and plays extracted media items sequentially for one-shot playback.
- `services/audio-player.ts` starts blocking `mpv` playback through `child_process.spawn` with argument arrays.
- `services/player-session.ts` starts controllable `mpv` playback with JSON IPC for interactive mode.
- `services/interactive-queue-controller.ts` owns queue index, next/previous behavior, and session switching.
- `platform/binary-paths.ts` checks bundled binaries first and falls back to `PATH`.
- `ui/` contains formatting only.

## Current installation strategy

The package includes postinstall platform detection and runtime binary resolution. `postinstall` downloads native `yt-dlp` for supported platforms and bundled official `mpv-player/mpv` archives for macOS x64/arm64. Linux and Windows currently use the same runtime resolver but rely on `mpv` being available on `PATH` unless a package-local binary is provided.
