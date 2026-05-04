# User Guide

## Interactive TikTok player

```bash
chill-radio start
```

Use this mode when you want a terminal player screen. Paste a TikTok video, profile/channel, or playlist/collection URL when prompted.

Controls:

- Space: pause/resume.
- `n` or right arrow: next item.
- `p` or left arrow: previous item or restart current item.
- `q` or Ctrl+C: stop and exit.

The screen shows title, uploader, queue position, elapsed time, remaining time, total duration, and a progress bar.

## Play TikTok audio once

```bash
chill-radio play <tiktok-url>
```

Supported MVP inputs:

- TikTok video URL: plays one video.
- TikTok profile/channel URL: extracts returned videos and plays them sequentially.
- TikTok playlist/collection URL: extracts returned videos and plays them sequentially when `yt-dlp` supports that URL shape.

Examples:

```bash
chill-radio play "https://www.tiktok.com/@creator/video/123"
chill-radio play "https://www.tiktok.com/@creator"
chill-radio play "https://www.tiktok.com/@creator/playlist/name-123"
```

The command extracts lightweight audio streams, prints title/uploader/duration when available, then starts playback with `mpv`.

## Current limits

- TikTok only; YouTube and SoundCloud are future work.
- Interactive progress and keyboard controls are available in `chill-radio start`; `play` remains one-shot output.
- No cookies/authenticated TikTok flow yet.
- TikTok profile/playlist extraction depends on what `yt-dlp` returns.

## Troubleshooting

- `Please provide a valid TikTok URL.`: pass a full `http://` or `https://` TikTok URL.
- `TikTok is currently the only supported platform.`: YouTube/SoundCloud are not enabled yet.
- `No playable TikTok videos found.`: profile/playlist extraction returned no playable items.
- `Could not extract TikTok audio stream`: update dependencies or try another public TikTok URL.
- `Could not start mpv`: install `mpv` or provide a compatible binary under `vendor/bin/mpv`.
