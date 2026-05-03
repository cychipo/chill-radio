# Code Standards

## Scope

These standards apply to the initial `chill-radio` Node.js CLI codebase.

## TypeScript

- Use ESM TypeScript targeting Node.js 18+.
- Keep CLI parsing, extraction, playback, platform utilities, and UI formatting in separate modules.
- Use kebab-case filenames for TypeScript, JavaScript, and scripts.
- Keep files focused and under roughly 200 lines where practical.

## Safety

- Never execute user-provided URLs through shell strings.
- Use `spawn(command, args, { shell: false })` for external processes.
- Treat metadata from external platforms as untrusted terminal output.
- Do not commit downloaded binaries, caches, tokens, API keys, or environment files.

## Testing

- Prefer deterministic unit tests for URL parsing, metadata normalization, path resolution, and UI formatting.
- Keep live platform tests opt-in because external media services are flaky and may require auth.
