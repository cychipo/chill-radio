# Start Command Terminal UI Plan

## Context

The next product step is `chill-radio start`: an interactive terminal mode where users paste TikTok links, watch playback progress, and control playback without leaving the terminal.

## What happened

- Reviewed `user_stories.md`, `CLAUDE.md`, README, existing plans, and current CLI/playback modules.
- Created plan `plans/260504-0843-start-command-terminal-ui/`.
- Split implementation into five phases: start command boundary, controllable mpv session, terminal UI, queue navigation, tests/docs/validation.
- Kept scope TikTok-only and avoided YouTube/SoundCloud, mouse UI, saved playlists, and heavy TUI dependencies for now.

## Decision

Use `mpv` JSON IPC for pause/progress/stop controls and raw TTY key handling for Space, next, previous, and quit. Keep `chill-radio play <url>` unchanged as the scriptable command.

## Next

Implement via `/cook /Users/tgiap.dev/devs/chill-radio/plans/260504-0843-start-command-terminal-ui`.
