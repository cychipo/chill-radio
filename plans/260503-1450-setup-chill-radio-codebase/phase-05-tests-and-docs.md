# Phase 05: Tests and Docs

## Context Links

- Overview plan: `plans/260503-1450-setup-chill-radio-codebase/plan.md`
- Source requirements: `user_stories.md`

## Overview

Priority: Medium  
Status: Complete

Add validation coverage and replace template documentation with project-specific docs.

## Requirements

### Functional

- Add unit tests for CLI argument handling, media metadata normalization, binary path resolution, and error mapping.
- Add integration-style test for command wiring where practical without requiring real audio playback.
- Add docs for install, development, architecture, and user guide.
- Update README to describe `chill-radio` instead of the starter kit.

### Non-functional

- Tests should not depend on live YouTube/TikTok/SoundCloud availability by default.
- Keep docs concise and accurate to implemented behavior.
- Avoid claiming playlist/progress/keyboard controls before implemented.

## Architecture

Recommended docs:

```text
docs/
├── INSTALL.md
├── DEV.md
├── GUIDE.md
├── GUIDE-VI.md
├── code-standards.md
└── system-architecture.md
```

Recommended tests:

```text
tests/
├── cli.test.ts
├── binary-paths.test.ts
├── media-extractor.test.ts
└── errors.test.ts
```

## Related Code Files

### Create

- `tests/*.test.ts`
- `docs/INSTALL.md`
- `docs/DEV.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/code-standards.md`
- `docs/system-architecture.md`

### Modify

- `README.md`
- `package.json`

## Implementation Steps

1. Choose a Node-friendly test runner. Recommendation: Vitest.
2. Add tests for deterministic logic first.
3. Add command-level tests with child process only if stable.
4. Document supported platforms and binary installation behavior.
5. Document current MVP commands and explicitly list planned future features.
6. Run build, typecheck, tests, and local CLI smoke test.

## Todo List

- [ ] Add test runner and scripts.
- [ ] Add unit tests for core deterministic modules.
- [ ] Add docs under `docs/`.
- [ ] Rewrite README for `chill-radio`.
- [ ] Run final validation commands.

## Success Criteria

- Tests pass locally.
- Typecheck/build passes.
- README and docs match actual implemented state.
- Future epics remain visible but not misrepresented as done.

## Risk Assessment

- Live media tests are flaky; keep them opt-in.
- Documentation can drift if it describes planned features as current features.

## Security Considerations

- Docs should warn that URLs are sent to extractor tooling and platform services.
- Do not document unsafe shell examples with untrusted interpolation.

## Next Steps

After this phase, plan a separate feature plan for playlist support, progress bar, and keyboard controls.
