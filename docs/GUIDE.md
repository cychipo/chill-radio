# User Guide

## Play TikTok audio

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
- No progress bar or keyboard controls yet.
- No cookies/authenticated TikTok flow yet.
- TikTok profile/playlist extraction depends on what `yt-dlp` returns.

## Troubleshooting

- `Please provide a valid TikTok URL.`: pass a full `http://` or `https://` TikTok URL.
- `TikTok is currently the only supported platform.`: YouTube/SoundCloud are not enabled yet.
- `No playable TikTok videos found.`: profile/playlist extraction returned no playable items.
- `Could not extract TikTok audio stream`: update dependencies or try another public TikTok URL.
- `Could not start mpv`: install `mpv` or provide a compatible binary under `vendor/bin/mpv`.
