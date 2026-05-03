# Phase 03: Binary Installation

## Context Links

- Epic 1 in `user_stories.md`
- Overview plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`

## Overview

Priority: High  
Status: Partial

Prepare zero-config installation for `mpv` and `yt-dlp` while keeping the implementation safe, cross-platform, and maintainable.

## Requirements

### Functional

- Detect OS and CPU architecture during postinstall.
- Download or install the correct `mpv` binary asset.
- Ensure `yt-dlp` is available through `youtube-dl-exec` or a managed binary update path.
- Save binaries in a package-local cache path ignored by git.
- Make runtime code resolve those binaries reliably.

### Non-functional

- Do not require users to manually install external software for the intended platforms.
- Fail with clear install/runtime instructions if a platform is unsupported.
- Avoid admin permissions.

## Architecture

Recommended install structure:

```text
scripts/
└── postinstall.ts
vendor/
└── bin/
    ├── mpv/<platform>/...
    └── yt-dlp/...
```

Runtime resolution:

```text
platform-info -> binary-paths -> audio-player/media-extractor
```

## Related Code Files

### Create

- `scripts/postinstall.ts`
- `src/platform/binary-paths.ts`
- `src/platform/platform-info.ts`

### Modify

- `package.json` postinstall script
- `.gitignore`

## Implementation Steps

1. Research reliable official/maintained download sources for `mpv` by platform.
2. Decide whether to use `youtube-dl-exec` built-in binary management or explicit `yt-dlp` download.
3. Implement platform detection for macOS, Linux, Windows, and common architectures.
4. Download assets with checksum verification if source publishes checksums.
5. Extract archives into `vendor/bin`.
6. Mark binaries executable on Unix platforms.
7. Add clear failure messages for unsupported platform or network failure.

## Todo List

- [ ] Confirm binary source URLs and license compatibility.
- [ ] Implement platform detection.
- [ ] Implement asset download/extract.
- [ ] Add runtime binary path resolution.
- [ ] Verify install on current macOS environment.

## Success Criteria

- Fresh install prepares required binaries on supported platform.
- Runtime can locate `mpv` and `yt-dlp` without PATH dependency.
- Unsupported platforms fail with actionable text, not stack traces.

## Risk Assessment

- `mpv` portable distribution differs strongly by OS.
- Postinstall network downloads can fail behind corporate proxies.
- Binary licensing and redistribution terms must be verified before publishing.

## Security Considerations

- Prefer HTTPS official sources.
- Verify checksums where possible.
- Never execute downloaded archives before extraction/validation.

## Next Steps

Proceed to Phase 04 once binary path resolution is stable.
