# Phase 01: Package Metadata and Entrypoints

## Context Links

- Plan: `plans/260509-1654-npm-public-package-release/plan.md`
- Package config: `package.json`
- CLI entry: `src/cli.ts`
- Build config: `tsconfig.json`

## Overview

Priority: High  
Status: Complete

Complete npm metadata and verify entrypoints so a globally installed package exposes `chill-radio` correctly.

## Requirements

### Functional

- Use scoped package name `@tgiap-dev/chill-radio` because unscoped `chill-radio` is blocked by historical npm unpublish state.
- Add MIT license metadata and `LICENSE` file.
- Add public npm metadata: author, repository, bugs, homepage, keywords.
- Verify `bin` path matches actual build output.
- Add `types` and `exports` only if library consumers can import stable public API.
- Add `publishConfig.access: public`.
- Add safe validation scripts such as `prepack` or `prepublishOnly` if useful.

### Non-functional

- Do not add publish automation or tokens.
- Keep package config minimal; avoid npm fields that are not used.

## Related Files

### Modify

- `package.json`
- `src/cli.ts` if version should be read from package metadata or kept synced manually.

### Create

- `LICENSE`

## Implementation Steps

1. Run `npm view @tgiap-dev/chill-radio name version --json` to check scoped package availability.
2. Run `npm run build` and inspect generated CLI path under `dist/`.
3. Fix `bin.chill-radio` if it does not point to built CLI.
4. Add MIT license file and set `license: MIT`.
5. Add package metadata fields.
6. Decide if `exports` should expose `./dist/src/index.js`; if not needed, omit to keep CLI-only package simple.
7. Add `prepack`/`prepublishOnly` to run typecheck/build/test before packing/publishing.

## Todo List

- [x] Check npm name availability.
- [x] Verify build output and bin path.
- [x] Add MIT license.
- [x] Complete package metadata.
- [x] Add publish validation scripts.

## Success Criteria

- `npm run build` creates the file referenced by `bin.chill-radio`.
- `package.json` is acceptable for public npm package discovery.
- `LICENSE` is included in pack output.

## Risk Assessment

- If `@tgiap-dev/chill-radio` is blocked, verify npm scope ownership or switch to a scope owned by the publisher.
- If `prepack` runs build automatically, ensure it does not make local dev workflow surprising.

## Security Considerations

- Never include npm token or auth config in repo.
- Verify metadata URLs are correct before publish.

## Next Steps

Proceed to Phase 02 after entrypoints and metadata are ready.
