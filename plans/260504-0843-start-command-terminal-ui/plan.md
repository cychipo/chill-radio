---
name: start-command-terminal-ui
status: completed
priority: high
created: 2026-05-04
blockedBy: []
blocks: []
source: user_stories.md
---

# Start Command Terminal UI

## Overview

Add `chill-radio start` as an interactive terminal mode for TikTok-first listening. The user should run one command, see a clean terminal screen, paste a TikTok video/profile/playlist URL, hear playback, view elapsed/remaining time, and control playback with pause, next, and previous actions.

This plan builds on the completed TikTok playback path without replacing `chill-radio play <url>`. The new mode should reuse URL parsing, TikTok extraction, metadata normalization, bundled binary resolution, and `mpv` playback safety rules.

## Phases

| Phase | Status | Goal | Output |
|---|---|---|---|
| [Phase 01](./phase-01-start-command-boundary.md) | Complete | Add `start` CLI command and interactive URL input | `chill-radio start`, prompt screen, TikTok URL submission flow |
| [Phase 02](./phase-02-controllable-playback-session.md) | Complete | Add controllable `mpv` session backend | pause/resume, stop, next, previous, progress polling through safe IPC |
| [Phase 03](./phase-03-terminal-player-ui.md) | Complete | Render terminal UI and keyboard controls | now playing panel, elapsed/remaining time, progress bar, key hints |
| [Phase 04](./phase-04-queue-navigation.md) | Complete | Support video/profile/playlist queue navigation | current index, next/prev behavior, end-of-track advance |
| [Phase 05](./phase-05-tests-docs-validation.md) | Complete | Cover behavior and docs | deterministic tests, README/GUIDE/architecture/changelog updates, manual smoke checklist |

## Dependencies

- Completed TikTok playback plan: `plans/260503-1509-tiktok-basic-playback/plan.md`.
- Existing safe playback modules in `src/services/audio-player.ts` and queue extraction in `src/services/media-extractor.ts`.
- `mpv` JSON IPC support for pause/progress/seek/stop commands.
- Node.js `readline`/TTY raw mode for keyboard input.
- Existing `chalk`; avoid adding heavy TUI dependencies unless a simple renderer is insufficient.

## Scope

### In scope

- `chill-radio start` interactive mode.
- Paste/enter TikTok URL inside the app.
- TikTok video/profile/playlist support matching existing `play` behavior.
- Terminal display with title/uploader, elapsed time, remaining time, duration, queue position, progress bar, and control hints.
- Keyboard controls:
  - Space: pause/resume.
  - `n` or right arrow: next item.
  - `p` or left arrow: previous item.
  - `q` or Ctrl+C: stop and exit cleanly.
- Safe `spawn` argument arrays and `shell: false`.
- Deterministic tests without live TikTok.

### Out of scope

- YouTube and SoundCloud input.
- Search UI or saved playlists.
- Mouse-clickable buttons; terminal buttons are key-driven labels/hints.
- Full-screen framework adoption unless raw TTY rendering becomes unmaintainable.
- Auth/cookies flow for restricted TikTok content.
- Cross-platform bundled `mpv` expansion beyond existing installer behavior.

## Architecture Direction

```text
chill-radio start
  -> render idle screen + URL input
  -> parse/classify TikTok URL
  -> extract one media item or queue
  -> create PlayerSession around mpv process + IPC socket
  -> render Now Playing + progress every 500ms-1000ms
  -> handle key input
     -> pause/resume via IPC
     -> next/prev by stopping current mpv and starting target queue item
     -> quit by stopping process and restoring terminal
```

## Success Criteria

- `npm run dev -- start` opens an interactive terminal UI without needing a URL argument.
- Pasting a valid TikTok video URL starts playback and displays elapsed/remaining time.
- Pasting a valid TikTok profile/playlist URL loads a queue and allows next/previous navigation.
- Space toggles pause/resume without killing the process.
- Next/previous switches items without leaking `mpv` processes.
- Ctrl+C and `q` restore terminal state and stop playback.
- Existing `chill-radio play <url>` behavior remains unchanged.
- `npm run typecheck`, `npm run build`, and `npm test` pass.
- Docs explain both `play` and `start` flows.

## Risk Assessment

- `mpv` IPC socket path and cleanup can leak files/processes if not handled carefully.
- Raw terminal mode can leave the terminal broken after crashes; terminal cleanup must run in `finally` and signal handlers.
- TikTok extraction for profile/playlist can be slow; UI should show loading state before playback.
- Progress polling can be noisy; throttle rendering to avoid CPU churn.

## Security Considerations

- Never pass user URL or IPC commands through shell strings.
- Generate IPC socket paths under OS temp directory with process-specific names.
- Treat all TikTok metadata as untrusted display text.
- Do not persist pasted URLs, cookies, stream URLs, or playback history.

## Cook Command

```bash
/cook /Users/tgiap.dev/devs/chill-radio/plans/260504-0843-start-command-terminal-ui
```
