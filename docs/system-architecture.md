# System Architecture

`chill-radio` is a Node.js CLI package for streaming audio from media URLs in the terminal.

## Runtime flow

```text
CLI play URL
  -> validate URL
  -> extract metadata and audio stream with yt-dlp
  -> render now-playing text
  -> spawn mpv with the extracted audio URL
```

## Modules

```text
src/
├── cli.ts
├── commands/play.ts
├── services/media-extractor.ts
├── services/audio-player.ts
├── platform/binary-paths.ts
├── platform/platform-info.ts
├── ui/errors.ts
├── ui/now-playing.ts
└── types/media.ts
```

## Boundaries

- `commands/play.ts` validates CLI input and maps user-facing failures to exit codes.
- `services/media-extractor.ts` calls `youtube-dl-exec` with safe options and normalizes metadata.
- `services/audio-player.ts` starts `mpv` through `child_process.spawn` with argument arrays.
- `platform/binary-paths.ts` checks bundled binaries first and falls back to `PATH`.
- `ui/` contains formatting only.

## Current installation strategy

The package includes postinstall platform detection and runtime binary resolution. Bundled `mpv` downloading is intentionally deferred until release sources, licenses, archive layouts, and checksums are verified. Until then, runtime uses package-local binaries when present or `mpv` on `PATH`.
