# Phase 04: Docs Release Checklist

## Context Links

- Plan: `plans/260509-1654-npm-public-package-release/plan.md`
- README: `README.md`
- Install guide: `docs/INSTALL.md`
- Dev guide: `docs/DEV.md`
- Changelog: `docs/project-changelog.md`
- Roadmap: `docs/development-roadmap.md`

## Overview

Priority: Medium  
Status: Complete

Update public-facing docs so npm users understand install, supported platforms, known limitations, and how to validate playback.

## Requirements

### Functional

- README quick start should use `npm install -g @tgiap-dev/chill-radio`.
- README smoke commands should use `<url>` and include TikTok/YouTube examples, not stale TikTok-only placeholders.
- INSTALL should explain automatic `yt-dlp`, macOS `mpv`, and Linux/Windows `mpv` PATH fallback clearly.
- DEV should include release validation commands.
- Changelog should add npm publish prep entry.
- Roadmap should mark publish readiness work as current or completed after implementation.
- Add manual publish checklist either in docs or plan runbook.

### Non-functional

- Keep README concise enough for npm page.
- Avoid private/local absolute paths in public docs.
- Do not promise true zero-config on unsupported platforms unless validated.

## Related Files

### Modify

- `README.md`
- `docs/INSTALL.md`
- `docs/DEV.md`
- `docs/project-changelog.md`
- `docs/development-roadmap.md`

## Implementation Steps

1. Update README intro/current status to reflect npm package public install.
2. Add quick start: install, start, play examples.
3. Update smoke test commands after package entrypoint is fixed.
4. Document platform support matrix:
   - Node.js 18+.
   - bundled/native `yt-dlp` for supported OS/arch.
   - bundled macOS mpv if validated.
   - Linux/Windows mpv PATH fallback unless implemented.
5. Add release checklist and troubleshooting.
6. Update changelog and roadmap.

## Todo List

- [x] Update README quick start.
- [x] Update INSTALL platform support.
- [x] Update DEV release commands.
- [x] Update changelog and roadmap.
- [x] Verify docs match actual package config.

## Success Criteria

- npm package page will show accurate install/use docs.
- Docs do not overpromise binary setup.
- Manual publish checklist is easy to follow.

## Risk Assessment

- README is the npm landing page; stale commands will cause bad first install experience.
- Absolute repo paths from plans/journals should not leak into public instructions.

## Security Considerations

- Warn not to paste npm tokens into repo.
- Warn not to commit `.env`, `.npmrc`, local binaries, or tarballs.

## Next Steps

Proceed to Phase 05 when docs are accurate and validation checklist is complete.
