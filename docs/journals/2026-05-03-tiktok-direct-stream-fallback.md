# TikTok Direct Stream Fallback

## Context

TikTok video playback was reliable through `mpv`'s `yt-dlp` hook, but startup could be slow because `mpv` resolves the original page before playback. Direct CDN playback can start faster when TikTok accepts the request context, but it may fail with CDN 403 or network timeout.

## What happened

- Added `httpHeaders` to normalized media metadata from `yt-dlp`.
- Added direct `mpv` playback args with repeated safe `--http-header-fields-append` values.
- Added fallback from direct stream playback to the reliable original page URL + native `yt-dlp` hook.
- Captured both stdout and stderr for the direct attempt so 403 messages are detected even when `mpv`/ffmpeg writes them outside stderr.
- Verified typecheck, build, unit tests, and a live TikTok smoke test where direct playback timed out and fallback playback started successfully.

## Decision

Keep profile and playlist playback on the hook/queue path. Use direct stream fallback only for single TikTok videos because it preserves reliability while testing the lower-latency path.

## Next

If startup remains too slow, investigate TikTok-specific extractor latency or an opt-in cookie/browser session flow rather than weakening the reliable fallback path.
