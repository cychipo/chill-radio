# User Guide

## Interactive terminal player

```bash
chill-radio start
```

Use this mode when you want a terminal player screen. Paste a supported TikTok or YouTube URL when prompted.

Supported inputs:

- TikTok video, profile/channel, or playlist/collection URL.
- YouTube video URL.
- YouTube playlist URL.
- YouTube livestream URL.

Controls:

- Space: pause/resume.
- `n` or right arrow: next item.
- `p` or left arrow: previous item or restart current item.
- `q` or Ctrl+C: stop and exit.
- `r`: toggle repeat current track.
- `l`: toggle repeat queue/playlist.
- `s`: toggle stable shuffle order.

The screen shows title, uploader, queue position, playback mode, elapsed time, remaining time, total duration when available, and a progress bar. Livestreams may show elapsed time without a fixed total duration.

## Play audio once

```bash
chill-radio play <url>
```

Examples:

```bash
chill-radio play "https://www.tiktok.com/@creator/video/123"
chill-radio play "https://www.tiktok.com/@creator"
chill-radio play "https://www.tiktok.com/@creator/playlist/name-123"
chill-radio play "https://www.youtube.com/watch?v=abc123"
chill-radio play "https://www.youtube.com/playlist?list=PL123"
chill-radio play "https://www.youtube.com/live/abc123"
```

The command extracts lightweight audio streams, prints title/uploader/duration when available, then starts playback with `mpv`. A YouTube `watch` URL with a `list` parameter is treated as playlist playback.

## Current limits

- SoundCloud is future work.
- No search inside the terminal yet.
- No cookies/authenticated flow for private, age-restricted, paid, member-only, or region-locked content.
- Playlist/profile extraction depends on what `yt-dlp` returns.
- Interactive progress and keyboard controls are available in `chill-radio start`; `play` remains one-shot output.

## Troubleshooting

- `Please provide a valid media URL.`: pass a full `http://` or `https://` URL.
- `Supported platforms: TikTok and YouTube.`: the URL platform is not enabled yet.
- `No playable media found.`: the queue was empty.
- `No playable YouTube videos found.`: playlist extraction returned no playable items.
- `Could not extract YouTube audio stream`: update dependencies or try another public YouTube URL.
- `Could not start mpv`: install `mpv` or provide a compatible binary under `vendor/bin/mpv`.
