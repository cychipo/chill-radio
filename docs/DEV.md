# Development

## Requirements

- Node.js 18+
- npm
- Bundled macOS `mpv` from `npm install`, or `mpv` installed on `PATH` for Linux/Windows manual playback testing

## Commands

```bash
npm install
npm run typecheck
npm run build
npm test
npm run dev -- play <tiktok-url>
```

Tests avoid live TikTok by default. Manual playback testing should use public TikTok URLs you are allowed to access and stream:

```bash
npm run dev -- play "https://www.tiktok.com/@creator/video/123"
npm run dev -- play "https://www.tiktok.com/@creator"
npm run dev -- play "https://www.tiktok.com/@creator/playlist/name-123"
```

For playback startup diagnostics, enable timing logs:

```bash
CHILL_RADIO_TIMING=1 npm run dev -- play "https://www.tiktok.com/@creator/video/123"
```

## Package layout

- `src/cli.ts`: CLI program setup.
- `src/commands/play.ts`: `play <url>` command boundary.
- `src/services/media-extractor.ts`: TikTok `yt-dlp` metadata and stream queue extraction.
- `src/services/media-queue-player.ts`: sequential playback for extracted media queues.
- `src/services/audio-player.ts`: `mpv` process startup.
- `src/platform/`: platform and binary path resolution.
- `src/ui/`: terminal output formatting.
