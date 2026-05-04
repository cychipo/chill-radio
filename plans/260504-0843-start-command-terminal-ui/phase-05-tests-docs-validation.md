# Phase 05: Tests Docs Validation

## Context Links

- `README.md`
- `docs/DEV.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/system-architecture.md`
- `docs/project-changelog.md`
- Existing `tests/*.test.ts`

## Overview

Priority: high  
Status: planned

Validate the interactive start mode with deterministic tests and update user/developer docs. Live TikTok playback remains manual because external platforms are flaky.

## Key Insights

- Unit tests should cover pure render/control logic, not live terminal behavior.
- Manual smoke tests are required for TTY behavior and mpv IPC.
- Existing `play <url>` tests must remain passing.

## Requirements

### Functional

- Unit tests for URL prompt helpers, player screen rendering, time formatting, progress bar, IPC command formatting, and queue navigation.
- Manual checklist for `npm run dev -- start`.
- Docs for controls and supported URL types.
- Changelog entry for interactive start mode.

### Non-functional

- Tests must not call live TikTok by default.
- Do not mock core implementation in a way that hides real control flow; inject small fake session objects for queue controller tests only.
- Run compile/build/test before completion.

## Architecture

```text
Tests
  -> pure UI render tests
  -> IPC arg/command tests
  -> queue controller fake-session tests
  -> CLI command registration tests

Docs
  -> README quick usage
  -> GUIDE/GUIDE-VI controls
  -> DEV manual smoke checklist
  -> system architecture update
  -> project changelog
```

## Related Code Files

### Modify

- `README.md`
- `docs/DEV.md`
- `docs/GUIDE.md`
- `docs/GUIDE-VI.md`
- `docs/system-architecture.md`
- `docs/project-changelog.md`
- Existing tests if imports move

### Create

- `tests/start-command.test.ts`
- `tests/player-screen.test.ts`
- `tests/player-session.test.ts`
- `tests/interactive-queue-controller.test.ts`
- `docs/journals/{date}-start-command-terminal-ui.md`

## Implementation Steps

1. Add deterministic tests for each new helper/module.
2. Add manual TTY smoke checklist in `docs/DEV.md`.
3. Update README to mention `chill-radio start` as the interactive mode and `play` as scriptable mode.
4. Update GUIDE and GUIDE-VI with controls.
5. Update architecture docs with new interactive modules and mpv IPC boundary.
6. Update changelog and write a concise journal.
7. Run validation commands.

## Todo List

- [ ] Add unit tests for new modules.
- [ ] Update README and guides.
- [ ] Update architecture and changelog.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run manual `npm run dev -- start` smoke test in a TTY.

## Success Criteria

- All deterministic tests pass.
- Manual start flow can play a TikTok URL and respond to pause/next/prev/quit.
- Docs accurately describe current support and limitations.
- No docs claim YouTube/SoundCloud support for start mode yet.

## Risk Assessment

- Automated tests cannot fully verify raw TTY behavior; manual smoke test remains required.

## Security Considerations

- Manual test docs must warn not to paste private/authenticated URLs if logs are being shared.

## Next Steps

After this plan is implemented, consider a separate plan for YouTube/SoundCloud support or richer TUI polish.
