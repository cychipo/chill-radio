# Install

`chill-radio` requires Node.js 18+.

```bash
npm install -g chill-radio
```

Current setup uses `youtube-dl-exec` for `yt-dlp` and looks for `mpv` in `vendor/bin` first, then falls back to `mpv` on `PATH`. If playback fails to start, install `mpv` for your platform and re-run the command.

Supported runtime targets are macOS, Linux, and Windows on x64 or arm64. Automatic bundled `mpv` downloads are not enabled yet because the release source and checksum policy must be finalized before publishing.
