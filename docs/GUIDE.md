# User Guide

## Play a track

```bash
chill-radio play <url>
```

The URL can be any single media item supported by `yt-dlp`, such as a YouTube, SoundCloud, or TikTok URL. The command extracts a lightweight audio stream, prints the title/uploader/duration when available, then starts playback with `mpv`.

## Current limits

- Single-track playback only.
- No playlist queue yet.
- No progress bar or keyboard controls yet.
- Some platforms may require authentication, cookies, or may block extraction; those flows are outside the MVP.

## Troubleshooting

- `Please provide a valid media URL.`: pass a full `http://` or `https://` URL.
- `Could not extract audio stream`: update dependencies or try a different supported URL.
- `Could not start mpv`: install `mpv` or provide a compatible binary under `vendor/bin/mpv`.
