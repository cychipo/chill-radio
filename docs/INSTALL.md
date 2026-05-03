# Install

`chill-radio` requires Node.js 18+.

```bash
npm install -g chill-radio
```

Current setup downloads the native `yt-dlp` release binary into `vendor/bin/yt-dlp/<platform-arch>/` during `postinstall`, then uses `youtube-dl-exec` with that binary. This avoids depending on macOS system Python 3.9, which is too old for current `yt-dlp`.

On macOS x64/arm64, `postinstall` also downloads the official `mpv-player/mpv` release archive and copies the bundled executable to `vendor/bin/mpv/<platform-arch>/mpv`. Runtime looks for `mpv` in `vendor/bin` first, then falls back to `mpv` on `PATH`.

Supported runtime targets are macOS, Linux, and Windows on x64 or arm64. Bundled `mpv` download is currently enabled only for macOS because a verified portable Linux source has not been selected yet.

If native `yt-dlp` or bundled macOS `mpv` download fails during install, re-run `npm install` with network access. On Linux/Windows, install `mpv` on `PATH` before playback.
