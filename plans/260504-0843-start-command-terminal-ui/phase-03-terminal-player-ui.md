# Phase 03: Terminal Player UI

## Context Links

- `user_stories.md` Feature 3.1, 3.2, 3.3.
- `src/ui/now-playing.ts`
- `src/ui/errors.ts`
- `docs/code-standards.md`

## Overview

Priority: high  
Status: planned

Render a clean terminal interface for current playback with progress and key hints. Keep it simple and dependency-light.

## Key Insights

- The user asked for a beautiful CLI, but clickable terminal buttons are not portable. Use visible button-like hints and keyboard controls.
- `cli-progress` is listed in user stories, but a custom single-line progress bar may be simpler and avoids dependency churn.
- Rendering should be throttled to avoid flicker and CPU overhead.

## Requirements

### Functional

- Display title, uploader, queue index, elapsed time, remaining time, total duration.
- Display progress bar.
- Display controls: `[Space] Pause/Resume`, `[N/→] Next`, `[P/←] Prev`, `[Q] Quit`.
- Update progress roughly every 500ms-1000ms.
- Reflect paused state.
- Restore terminal cursor/raw mode on exit.

### Non-functional

- Keep rendering pure where possible for deterministic tests.
- Avoid full-screen dependency unless needed after first implementation.
- Handle unknown duration gracefully.

## Architecture

```text
TerminalPlayerController
  -> enableRawMode()
  -> subscribe keypress
  -> setInterval(renderFrame)
  -> call PlayerSession controls
  -> cleanup in finally

renderPlayerFrame(state): string
```

## Related Code Files

### Modify

- `src/commands/start.ts`
- Existing UI modules if reusable formatting belongs there

### Create

- `src/ui/player-screen.ts`
- `src/ui/time-format.ts`
- `tests/player-screen.test.ts`
- `tests/time-format.test.ts`

## Implementation Steps

1. Add pure `formatDuration(seconds)` and `formatRemaining(elapsed, duration)` helpers.
2. Add pure `renderProgressBar(elapsed, duration, width)` helper.
3. Add `renderPlayerScreen(state)` returning a string.
4. Add terminal controller that clears/redraws controlled lines.
5. Add keypress handling through `readline.emitKeypressEvents()` and raw mode.
6. Add cleanup for Ctrl+C, `q`, normal track end, and thrown errors.

## Todo List

- [ ] Add time formatting helper tests.
- [ ] Add progress bar helper tests.
- [ ] Add player screen renderer.
- [ ] Add keyboard control wiring.
- [ ] Add terminal cleanup path.

## Success Criteria

- Playback screen shows elapsed and remaining time.
- Space toggles paused state visibly.
- Next/previous/quit keys call controller actions.
- Terminal cursor and input mode are restored after exit.

## Risk Assessment

- Terminal escape sequences vary; use conservative ANSI clear-line/cursor movement only.
- If stdout is not TTY, show a clear error instead of broken rendering.

## Security Considerations

- Metadata may contain terminal control chars; sanitize display text before rendering.

## Next Steps

Phase 04 connects the UI controller to queue navigation.
