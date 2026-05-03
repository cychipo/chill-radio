# Phase 01: Package Foundation

## Context Links

- Source requirements: `user_stories.md`
- Overview plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`

## Overview

Priority: High  
Status: Complete

Create the minimal Node.js CLI package structure needed before implementing audio features.

## Requirements

### Functional

- Add package metadata for npm package `chill-radio`.
- Add executable CLI bin command `chill-radio`.
- Add scripts for development, type checking, linting if selected, testing, and local CLI execution.
- Define runtime and dev dependencies.

### Non-functional

- Use Node.js 18+.
- Prefer TypeScript for maintainability.
- Keep setup simple; avoid bundlers until needed.
- Avoid committing downloaded binaries.

## Architecture

Package foundation should expose:

```text
package.json
src/cli.ts              # CLI entrypoint
src/commands/play.ts    # play command shell
src/index.ts            # optional package export
```

## Related Code Files

### Create

- `package.json`
- `tsconfig.json`
- `src/cli.ts`
- `src/commands/play.ts`
- `.gitignore`

### Modify

- `README.md` after scaffold exists

## Implementation Steps

1. Decide module format. Recommendation: ESM TypeScript.
2. Add `package.json` with `bin.chill-radio` pointing to built CLI.
3. Add TypeScript config targeting Node 18.
4. Add CLI entry with `commander` and `--version`/`--help` support.
5. Add placeholder `play <url>` command that validates a URL string and prints planned action.
6. Add `.gitignore` entries for `node_modules`, `dist`, binary cache, logs.

## Todo List

- [ ] Create npm package metadata.
- [ ] Add TypeScript build config.
- [ ] Add CLI entrypoint.
- [ ] Add `play` command placeholder.
- [ ] Verify `npm run build` and local help command.

## Success Criteria

- `npm install` succeeds.
- `npm run build` succeeds.
- Local CLI prints help and recognizes `play <url>`.

## Risk Assessment

- `README.md` currently describes another project; update only after scaffold is real.
- Avoid adding too many tools before the MVP needs them.

## Security Considerations

- Do not execute user-provided URLs as shell arguments.
- Validate command arguments at the CLI boundary.

## Next Steps

Proceed to Phase 02 source architecture after the CLI skeleton compiles.
