# Phase 02: Install and Binary Readiness

## Context Links

- Plan: `plans/260509-1654-npm-public-package-release/plan.md`
- Setup plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`
- Postinstall: `scripts/postinstall.js`, `scripts/postinstall.ts`
- Binary resolver: `src/platform/binary-paths.ts`
- Install docs: `docs/INSTALL.md`

## Overview

Priority: High  
Status: Complete

Make install behavior safe for public npm users. Binary setup should improve zero-config experience where supported, but npm install must not hard-fail if GitHub download, platform support, or mpv availability is missing.

## Requirements

### Functional

- Confirm postinstall catches download errors and exits successfully.
- Confirm native `yt-dlp` path is resolved before Python fallback.
- Confirm macOS bundled mpv behavior and Linux/Windows PATH fallback are documented.
- Ensure no downloaded `vendor/bin` binaries are committed or packed by default.
- Ensure install warnings are actionable and mention `mpv` PATH fallback.
- Reconcile setup plan Phase 03 status: complete only if publish scope accepts macOS bundled mpv + Linux/Windows PATH fallback; otherwise keep partial and document.

### Non-functional

- Avoid large package tarballs.
- Avoid adding new dependencies unless strictly needed for install reliability.
- Keep postinstall network calls limited and failure-tolerant.

## Related Files

### Modify

- `scripts/postinstall.js`
- `scripts/postinstall.ts` if source script is maintained separately.
- `src/platform/binary-paths.ts` only if runtime lookup has publish-specific issue.
- `docs/INSTALL.md`
- `plans/260503-1450-setup-chill-radio-codebase/plan.md` if phase status should be updated.

## Implementation Steps

1. Inspect postinstall JS and TS source consistency.
2. Run postinstall in a clean-ish local environment if safe, or review idempotency if binaries already exist.
3. Confirm postinstall does not throw uncaught errors after catch block.
4. Confirm package `files` includes scripts but excludes `vendor/bin` downloaded binaries unless intentionally included.
5. Add clearer install fallback docs for Linux/Windows mpv.
6. Add release checklist item for macOS install smoke and PATH fallback smoke.

## Todo List

- [x] Review postinstall failure behavior.
- [x] Review JS/TS postinstall drift.
- [x] Verify package excludes local vendor binaries.
- [x] Update install docs.
- [x] Update setup plan binary phase status if appropriate.

## Success Criteria

- Public `npm install -g @tgiap-dev/chill-radio` should complete even when automatic binary setup fails.
- Users see clear next steps for missing `mpv` or `yt-dlp`.
- Package tarball does not include local binary downloads.

## Risk Assessment

- GitHub release asset URLs/layout can change.
- mpv bundled macOS archives can be large or structurally different.
- Linux/Windows users may expect zero-config mpv; docs must avoid overpromising.

## Security Considerations

- Do not execute downloaded files during install; only download/chmod.
- Do not download from unreviewed mirrors.
- Do not suppress errors silently; warn with actionable fallback.

## Next Steps

Proceed to Phase 03 when install behavior is safe enough for public users.
