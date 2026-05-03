# Development

## Requirements

- Node.js 18+
- npm
- `mpv` installed locally for manual playback testing

## Commands

```bash
npm install
npm run typecheck
npm run build
npm test
npm run dev -- play <url>
```

Tests avoid live media platforms by default. Manual playback testing should use a URL you are allowed to access and stream.

## Package layout

- `src/cli.ts`: CLI program setup.
- `src/commands/play.ts`: `play <url>` command boundary.
- `src/services/media-extractor.ts`: `yt-dlp` metadata and stream extraction.
- `src/services/audio-player.ts`: `mpv` process startup.
- `src/platform/`: platform and binary path resolution.
- `src/ui/`: terminal output formatting.
