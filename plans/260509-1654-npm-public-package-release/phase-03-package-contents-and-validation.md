# Phase 03: Package Contents and Validation

## Context Links

- Plan: `plans/260509-1654-npm-public-package-release/plan.md`
- Package config: `package.json`
- Ignore config: `.gitignore`, optional `.npmignore`
- Build output: `dist/`

## Overview

Priority: High  
Status: Complete

Validate exactly what npm will publish and verify the generated tarball installs as a global CLI before any public publish.

## Requirements

### Functional

- Run full automated validation: typecheck, build, tests.
- Run `npm pack --dry-run` and inspect included files.
- Generate local tarball with `npm pack`.
- Install tarball globally or into a temporary prefix.
- Verify `chill-radio --help` works from installed package.
- Verify `chill-radio play not-a-url` returns clean user-facing error.
- Optionally run `chill-radio start` in a real TTY for UI smoke if environment allows.

### Non-functional

- Do not publish in this phase.
- Avoid destructive global npm changes if a temporary prefix is easier.
- Clean generated `.tgz` after smoke unless user wants to keep it.

## Related Files

### Modify if needed

- `package.json` `files` field.
- `.npmignore` only if `files` cannot express desired package contents clearly.

## Implementation Steps

1. Run `npm run typecheck`.
2. Run `npm run build`.
3. Run `npm test`.
4. Run `npm pack --dry-run`.
5. Review output for accidental inclusion/exclusion.
6. Run `npm pack`.
7. Install with temp prefix, e.g. `npm install --prefix /tmp/chill-radio-smoke -g ./chill-radio-*.tgz`.
8. Run installed CLI help and invalid URL smoke.
9. Remove temp prefix/tarball after validation if desired.

## Todo List

- [x] Run validation commands.
- [x] Review pack dry-run output.
- [x] Install tarball locally.
- [x] Smoke test installed CLI.
- [x] Adjust package contents if needed.

## Success Criteria

- Tarball contains runtime JS, declarations if published, scripts, package metadata, README, LICENSE, and docs intended for users.
- Tarball excludes `src`, `tests`, `plans`, `.claude`, `.env`, local binaries, and caches unless intentionally included.
- Installed CLI starts from package tarball.

## Risk Assessment

- Current `files` includes `vendor`; if local vendor cache exists, tarball may include unintended binaries. Verify dry-run carefully.
- Global install may conflict with any existing `chill-radio`; prefer temp prefix when possible.

## Security Considerations

- Inspect tarball before publish.
- Do not include internal plans or journals if not desired for public package.
- Do not include local machine paths in packaged docs where avoidable.

## Next Steps

Proceed to Phase 04 after package contents are clean and installed CLI works.
