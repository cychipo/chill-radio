---
title: NPM Public Package Release Implementation
created: 2026-05-09
type: implementation
---

# NPM Public Package Release Implementation

## Context

Implemented the public npm package release readiness plan for `chill-radio`. Publish remains manual and was not executed.

## What happened

- Added MIT license metadata and `LICENSE`.
- Completed npm metadata: author, repository, bugs, homepage, keywords, public publish config.
- Fixed global CLI bin path from `dist/cli.js` to verified `dist/src/cli.js`.
- Fixed CLI entrypoint detection so npm bin symlinks execute correctly.
- Restricted package contents to runtime `dist/src`, selected docs, README, LICENSE, package metadata, and `scripts/postinstall.js`.
- Improved postinstall warnings for `yt-dlp`/`mpv` PATH fallback.
- Updated README, install docs, development release validation, changelog, roadmap, and plan statuses.

## Validation

- `npm run typecheck` passed.
- `npm run build` passed.
- `npm test` passed: 57 tests.
- `npm pack --dry-run` showed 65 intended files and excluded tests, plans, `.claude`, `vendor`, and local artifacts.
- Local temp-prefix tarball install with `--ignore-scripts` verified `chill-radio --help` and invalid URL error output.

## Decisions

- Initially kept package name `chill-radio`, then switched to scoped package `@tgiap-dev/chill-radio` after npm returned a historical unpublish notice for the unscoped name.
- Kept first release manual; no npm token or publish automation added.
- Kept Linux/Windows `mpv` as documented PATH fallback.

## Next

Before public publish, run a real postinstall smoke without `--ignore-scripts` on a supported machine, verify npm name/account policy, and decide whether mutable GitHub latest binary downloads are acceptable or should be pinned with SHA256 verification.
