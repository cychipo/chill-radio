---
name: npm-public-package-release
status: completed
priority: high
created: 2026-05-09
blockedBy: []
blocks: []
source: user request
---

# NPM Public Package Release

## Overview

Prepare `chill-radio` for a first public npm publish under scoped package name `@tgiap-dev/chill-radio` with MIT license. This plan focuses on publish config, package contents, install safety, release validation, and docs needed so users can install with npm and run the CLI.

The current repo is close, but not publish-ready: `package.json` metadata is minimal, license is missing, README has outdated smoke commands, setup plan still marks binary installation as partial, and the package `bin` path must be verified against actual TypeScript build output before publish.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| [Phase 01](./phase-01-package-metadata-and-entrypoints.md) | Complete | Complete npm package metadata and runtime entrypoints | publish-ready `package.json`, MIT license, correct CLI bin/files |
| [Phase 02](./phase-02-install-and-binary-readiness.md) | Complete | Harden postinstall/runtime binary behavior for public users | safer installer warnings, explicit fallback docs, scoped binary roadmap |
| [Phase 03](./phase-03-package-contents-and-validation.md) | Complete | Verify tarball contents and install behavior locally | `npm pack --dry-run`, temp-prefix install smoke, clean package contents |
| [Phase 04](./phase-04-docs-release-checklist.md) | Complete | Update public docs and manual publish checklist | README/INSTALL/DEV docs, release checklist, changelog update |
| [Phase 05](./phase-05-manual-publish-runbook.md) | Complete | Define safe manual npm publish process | step-by-step publish and post-publish verification runbook |

## Decisions

- Package name: `chill-radio`.
- License: MIT.
- Publish flow: manual npm publish first; no GitHub Actions/token automation in this scope.
- Do not commit downloaded runtime binaries, cache directories, or secrets.

## Dependencies

- Existing setup plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`, especially partial Phase 03 binary installation.
- Current runtime binary resolver in `src/platform/binary-paths.ts`.
- Postinstall script: `scripts/postinstall.js` / `scripts/postinstall.ts`.
- Current build config: `tsconfig.json` and `package.json`.
- Manual npm account auth on developer machine.

## Scope

### In scope

- Check scoped npm package availability with `npm view @tgiap-dev/chill-radio` before publish.
- Add/verify `license`, `author`, `repository`, `homepage`, `bugs`, `keywords`, `publishConfig`, `engines`, `bin`, `files`, `exports`, and `types` metadata.
- Add MIT `LICENSE` file.
- Fix CLI entrypoint if build output is `dist/src/cli.js` but `bin` points to `dist/cli.js`.
- Add `prepack`/`prepublishOnly` validation scripts if they keep manual publish safe.
- Ensure package tarball excludes `tests`, `plans`, `.claude`, local binaries, `.env`, cache, and dev-only artifacts.
- Validate postinstall does not hard-fail npm install when binary downloads fail.
- Document manual install/use/publish flow.
- Run local package install smoke test from generated tarball.

### Out of scope

- Automated GitHub Actions publish.
- npm provenance/signing setup unless user explicitly asks later.
- Publishing under scoped package name.
- Full Linux/Windows bundled `mpv` download support if not solved safely; document PATH fallback instead.
- Embedding large binaries in the npm tarball.

## Architecture Direction

```text
source TS + scripts
  -> npm run build
  -> dist/ runtime JS + declaration files
  -> npm pack dry run
  -> local npm install -g ./chill-radio-*.tgz
  -> chill-radio --help / play invalid URL smoke
  -> npm publish --access public
```

Release safety priorities:

1. Package installs without secrets/binaries/cache.
2. CLI binary path works from global install.
3. Postinstall attempts binary setup but degrades to clear PATH/manual-install fallback.
4. Publish commands require explicit user action; no automated publish in implementation.

## Success Criteria

- `package.json` has complete public npm metadata and correct entrypoints.
- `LICENSE` exists and package license is MIT.
- `npm run typecheck`, `npm run build`, and `npm test` pass.
- `npm pack --dry-run` shows only intended runtime/docs files.
- Local tarball install smoke passes:
  - `npm pack`
  - `npm install -g ./chill-radio-*.tgz`
  - `chill-radio --help`
  - `chill-radio play not-a-url` exits with user-facing error.
- README/INSTALL explain npm install and known binary fallback limitations.
- Manual publish runbook is clear and requires npm login/OTP if configured.

## Risk Assessment

- `npm view chill-radio name version --json` returned npm 404 with a historical unpublish notice, so the package moved to scoped name `@tgiap-dev/chill-radio`; verify npm scope ownership before publish.
- Current `bin` path may be wrong because `tsconfig.json` uses `rootDir: "."`; verify actual build output before changing.
- Postinstall downloads from mutable GitHub latest release URLs at install time; first publish must either accept that risk explicitly or pin versions with SHA256 verification.
- Public publish is hard to undo cleanly after users install it; perform dry-run/tarball install first.
- Bundled macOS mpv download source/license/checksum remains sensitive; publish docs must be honest if Linux/Windows require PATH fallback.

## Security Considerations

- Never include `.env`, tokens, npm auth files, `.claude`, `node_modules`, `dist` source maps if unnecessary, local `vendor/bin`, or cache in package.
- Do not place npm token in repo or docs.
- Do not run shell strings with user media URLs.
- Avoid `npm audit fix --force` without review.
- Verify package tarball before publish.

## Cook Command

```bash
/cook /Users/tgiap.dev/devs/chill-radio/plans/260509-1654-npm-public-package-release
```
