# Phase 02: Controllable Playback Session

## Context Links

- `src/services/audio-player.ts`
- `src/services/media-queue-player.ts`
- `src/platform/binary-paths.ts`
- `tests/audio-player.test.ts`

## Overview

Priority: high  
Status: planned

Add a playback backend that can be controlled while `mpv` is running. Existing `playAudio()` waits until `mpv` exits and cannot pause/resume or query progress.

## Key Insights

- `mpv` supports JSON IPC through `--input-ipc-server=<path>`.
- A session object can spawn `mpv`, send JSON commands, observe exit, and clean up socket/process.
- Keep the existing blocking `playAudio()` API for `play <url>`; add new APIs for `start`.

## Requirements

### Functional

- Start `mpv` for one `MediaInfo` with JSON IPC enabled.
- Send commands: pause/resume, stop, seek optional later.
- Query properties: `time-pos`, `duration`, `pause`, `media-title` if useful.
- Emit/return exit status so queue controller can advance.
- Support hook playback mode for reliability.

### Non-functional

- Use `spawn(..., args, { shell: false })`.
- IPC socket path must be generated safely under OS temp directory.
- Cleanup process and socket on stop, exit, and errors.
- Avoid buffering large playback output.

## Architecture

```text
createPlaybackSession(media)
  -> resolve mpv + yt-dlp
  -> create temp IPC socket path
  -> spawn mpv with hook args + --input-ipc-server
  -> expose:
     - togglePause()
     - stop()
     - getProgress()
     - waitForExit()
```

## Related Code Files

### Modify

- `src/services/audio-player.ts`
- `tests/audio-player.test.ts`

### Create

- `src/services/player-session.ts` if `audio-player.ts` would exceed size target
- `tests/player-session.test.ts`

## Implementation Steps

1. Extract shared mpv arg building so hook/direct args can compose IPC options.
2. Implement a small JSON IPC client using `node:net` that sends one command per connection or keeps a single connection if simple.
3. Implement `PlayerSession` with `togglePause()`, `setPause(boolean)`, `stop()`, `getProgress()`.
4. Ensure `stop()` kills `mpv` only after trying `quit` IPC command.
5. Add tests for IPC command JSON formatting, socket path construction, and arg arrays.
6. Keep direct-stream fallback out of interactive mode initially unless it can share the session API safely.

## Todo List

- [ ] Add IPC mpv args builder.
- [ ] Add JSON IPC command helper.
- [ ] Add `PlayerSession` lifecycle.
- [ ] Add tests for command formatting and cleanup decisions.

## Success Criteria

- A session can spawn `mpv` with IPC enabled.
- Pause/resume can be requested without restarting playback.
- Progress can be polled as elapsed/duration numbers.
- Stop exits cleanly without orphaning `mpv`.

## Risk Assessment

- IPC may not be ready immediately after spawn; implement small retry with bounded timeout.
- Windows named pipe behavior differs from Unix sockets; if not implemented now, document limitation and keep code path isolated.

## Security Considerations

- IPC commands are generated from internal enums, not raw user input.
- Socket path must not include URL or metadata.

## Next Steps

Phase 03 uses this backend to render the terminal player and wire key controls.
