---
name: setup-chill-radio-codebase
status: partially-complete
priority: high
created: 2026-05-03
blockedBy: []
blocks: []
source: user_stories.md
---

# Setup Chill Radio Codebase

## Overview

Bootstrap `chill-radio` as a Node.js CLI package that can later implement the user stories in `user_stories.md`: zero-config install, stream extraction, portable playback, and terminal UX.

Current repo state is not yet a real `chill-radio` app. `README.md` still describes FayeDark Agent Kit, and expected docs such as `docs/code-standards.md` and `docs/system-architecture.md` are missing. This plan starts with a clean package scaffold before feature work.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| [Phase 01](./phase-01-package-foundation.md) | Complete | Create package foundation | `package.json`, CLI entry, npm scripts, base config |
| [Phase 02](./phase-02-source-architecture.md) | Complete | Define runtime modules | `src/` CLI, services, platform utilities |
| [Phase 03](./phase-03-binary-installation.md) | Partial | Prepare zero-config binary installer | platform detection + binary resolution; verified downloads pending |
| [Phase 04](./phase-04-playback-mvp.md) | Complete | Implement first playable vertical slice | `chill-radio play <url>` using extractor + mpv |
| [Phase 05](./phase-05-tests-and-docs.md) | Complete | Add validation and docs | tests, typecheck, project docs |

## Dependencies

- Node.js 18+ minimum.
- `commander` for CLI command routing.
- `youtube-dl-exec` for `yt-dlp` integration.
- `child_process` for `mpv` process control.
- `chalk`, `ora`, `cli-progress` for terminal feedback.
- Cross-platform binary acquisition strategy must be verified before publishing.

## Success Criteria

- Repository contains a real installable Node CLI package named `chill-radio`.
- `npm install`, `npm run typecheck`, and `npm test` are defined and pass.
- `chill-radio --help` works from local package scripts.
- Architecture supports the first three epics without premature playlist/control complexity.
- Docs explain install, development, and the MVP CLI flow.

## Cook Command

```bash
/cook /Users/tgiap.dev/devs/chill-radio/plans/260503-1450-setup-chill-radio-codebase
```
