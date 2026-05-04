# Phase 01: Start Command Boundary

## Context Links

- `user_stories.md` Epic 2 and Epic 3.
- `src/cli.ts`
- `src/commands/play.ts`
- `src/services/media-extractor.ts`
- `src/ui/errors.ts`

## Overview

Priority: high  
Status: planned

Add `chill-radio start` as a separate command that opens an interactive terminal flow. Keep `play <url>` as the scriptable one-shot command.

## Key Insights

- Current command boundary already validates TikTok URLs and classifies video/profile/playlist.
- Start mode needs URL input after the process starts, not as a command argument.
- The app should show friendly errors and return to URL input instead of exiting on every bad URL.

## Requirements

### Functional

- Register `start` in `src/cli.ts` via a new command module.
- Render an initial screen with app name, supported platform note, and paste prompt.
- Accept pasted TikTok URL from stdin.
- Reuse `parseTikTokInput()` for validation.
- Show loading state while extracting.
- On invalid URL, show error and prompt again.

### Non-functional

- No shell string execution.
- Keep command code focused; extract reusable prompt/session logic if file grows.
- Work on standard TTY and degrade with a readable error if stdin/stdout is not interactive.

## Architecture

```text
registerStartCommand(program)
  -> startInteractiveMode()
     -> renderWelcome()
     -> readUrlLine()
     -> parseTikTokInput(url)
     -> loadPlaybackQueue(input)
     -> hand off to player UI session
```

## Related Code Files

### Modify

- `src/cli.ts`
- `src/commands/play.ts` if parser exports need cleanup
- `tests/play-command.test.ts` or new command tests

### Create

- `src/commands/start.ts`
- `src/ui/start-screen.ts` if rendering needs isolation
- `tests/start-command.test.ts`

## Implementation Steps

1. Add `registerStartCommand(program)` and call it from `createCliProgram()`.
2. Add a small interactive entry function that checks `process.stdin.isTTY` and `process.stdout.isTTY`.
3. Render welcome/prompt using `chalk` only; do not add new TUI dependency yet.
4. Read one URL line through `readline/promises`.
5. Validate with `parseTikTokInput()` and map failures through existing `formatCliError()`.
6. Return to prompt on validation/extraction errors; quit on Ctrl+C.

## Todo List

- [ ] Add start command registration.
- [ ] Add URL prompt loop.
- [ ] Add invalid URL retry behavior.
- [ ] Add tests for command registration and validation retry helpers.

## Success Criteria

- `npm run dev -- start` opens a prompt.
- Invalid input shows user-facing error and keeps session alive.
- Valid TikTok input reaches queue loading handoff.
- `play <url>` behavior remains unchanged.

## Risk Assessment

- Raw terminal mode should not be enabled in this phase; keep input simple until playback UI phase.

## Security Considerations

- URL remains untrusted input.
- Never interpolate URL into shell commands.

## Next Steps

Phase 02 adds controllable playback session so Phase 01 can hand off loaded media to a real player.
