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
npm run dev -- play <url>
npm run dev -- start
```

Tests avoid live TikTok/YouTube by default. Manual playback testing should use public URLs you are allowed to access and stream:

```bash
npm run dev -- play "https://www.tiktok.com/@creator/video/123"
npm run dev -- play "https://www.tiktok.com/@creator"
npm run dev -- play "https://www.tiktok.com/@creator/playlist/name-123"
npm run dev -- play "https://www.youtube.com/watch?v=abc123"
npm run dev -- play "https://www.youtube.com/playlist?list=PL123"
npm run dev -- play "https://www.youtube.com/live/abc123"
```

Manual interactive UI smoke test:

```bash
npm run dev -- start
```

Checklist:

- Paste public TikTok and YouTube URLs and confirm playback starts.
- Space toggles pause/resume.
- `n` or right arrow moves to the next queue item when available.
- `p` or left arrow restarts or moves to the previous item.
- `q` or Ctrl+C exits and restores the terminal.

For playback startup diagnostics, enable timing logs:

```bash
CHILL_RADIO_TIMING=1 npm run dev -- play "https://www.youtube.com/watch?v=abc123"
```

## Package layout

- `src/cli.ts`: CLI program setup.
- `src/commands/play.ts`: `play <url>` command boundary.
- `src/commands/start.ts`: interactive terminal player command.
- `src/services/media-extractor.ts`: TikTok `yt-dlp` metadata and stream queue extraction.
- `src/services/media-queue-player.ts`: sequential playback for extracted media queues.
- `src/services/audio-player.ts`: blocking `mpv` process startup for one-shot playback.
- `src/services/player-session.ts`: controllable `mpv` JSON IPC session for interactive playback.
- `src/services/interactive-queue-controller.ts`: queue navigation for start mode.
- `src/platform/`: platform and binary path resolution.
- `src/ui/`: terminal output formatting.
