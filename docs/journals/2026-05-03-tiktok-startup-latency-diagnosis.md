# 2026-05-03 TikTok Startup Latency Diagnosis

Diagnosed remaining slow startup after TikTok video fast path.

Findings:

- App code reaches `mpv` spawn in about 5ms with `CHILL_RADIO_TIMING=1`.
- Delay is not in CLI parsing or TypeScript app flow.
- `mpv` enters audio output quickly but default cache/read-ahead grows aggressively for this TikTok stream.
- Test run showed cache climbing from ~60s to hundreds of seconds.

Changes:

- Added `CHILL_RADIO_TIMING=1` timing diagnostics.
- Timing logs are disabled by default and written to stderr only when enabled.
- Added `CHILL_RADIO_TIMING=1` diagnostics and dev docs.
- Did not keep cache tuning because live smoke tests showed it can cause underruns or `mpv` exit code 2 on the same TikTok URL.

Validation:

- Baseline showed app spawned `mpv` in about 5ms, so delay was not in CLI code.
- Default `mpv` cache grew into hundreds of seconds for the test TikTok stream.
- Too-small 10s/no-pause cache reduced startup buffering but caused audio underruns.
- 30s cache tuning still failed live with TikTok CDN timeout and `mpv` exit code 2.
- Kept reliable playback arguments and only shipped timing diagnostics.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 6 files, 25 tests.
