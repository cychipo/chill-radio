# 2026-05-03 TikTok mpv Exit Code 2 Fix

Fixed TikTok playback failing after now-playing output with `Playback failed with exit code 2`.

Root cause:

- `yt-dlp` extraction returned a direct TikTok CDN URL.
- `mpv`/ffmpeg opened that URL without the full request flow TikTok expects and received HTTP 403.
- Passing headers was not enough; `mpv` played successfully when using its `ytdl_hook` against the original TikTok page URL with the native `yt-dlp` binary.

Changes:

- `audio-player.ts` now resolves both bundled `mpv` and native `yt-dlp`.
- Playback passes `--script-opts=ytdl_hook-ytdl_path=<native yt-dlp>` to `mpv`.
- Playback gives `mpv` the original `webpageUrl` instead of the direct CDN `streamUrl`.
- Added regression coverage for `buildMpvArgs`.

Validation:

- Reproduced hidden `mpv` error as HTTP 403 and exit code 2.
- Verified `mpv` plays the same TikTok URL through native `yt-dlp` hook.
- Retried the reported `npm run dev -- play ...` command; it stayed running after now-playing instead of exiting with code 2.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 6 files, 24 tests.
