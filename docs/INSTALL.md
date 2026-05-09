# Install

`chill-radio` requires Node.js 18+.

```bash
npm install -g @tgiap-dev/chill-radio
```

## Binary setup

During `postinstall`, `chill-radio` tries to download a native `yt-dlp` release binary into `vendor/bin/yt-dlp/<platform-arch>/`. Runtime checks that bundled binary first, then falls back to `yt-dlp` on `PATH`.

On macOS x64/arm64, `postinstall` also downloads the official `mpv-player/mpv` release archive and copies the bundled executable to `vendor/bin/mpv/<platform-arch>/mpv`. Runtime checks bundled `mpv` first, then falls back to `mpv` on `PATH`.

On Linux and Windows x64/arm64, automatic `yt-dlp` setup is enabled, but bundled `mpv` download is not enabled yet. Install `mpv` with your OS package manager and make sure `mpv` is available on `PATH` before playback.

If automatic setup fails, `npm install` should still complete with warnings. Re-run `npm install -g @tgiap-dev/chill-radio` with network access, or install both `yt-dlp` and `mpv` on `PATH` before playback.

## Smoke check

```bash
chill-radio --help
chill-radio play not-a-url
```

The invalid URL command should print a short user-facing error, not a raw stack trace.
