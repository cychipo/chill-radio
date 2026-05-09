# Development

## Requirements

- Node.js 18+
- npm
- Bundled macOS `mpv` from `npm install`, or `mpv` installed on `PATH` for Linux/Windows manual playback testing

## Commands

```bash
npm install
npm run typecheck
npm run build
npm test
npm run dev -- play <url>
npm run dev -- start
npm pack --dry-run
```

Tests avoid live TikTok/YouTube by default. Manual playback testing should use public URLs you are allowed to access and stream:

```bash
npm run dev -- play "https://www.tiktok.com/@creator/video/123"
npm run dev -- play "https://www.tiktok.com/@creator"
npm run dev -- play "https://www.tiktok.com/@creator/playlist/name-123"
npm run dev -- play "https://www.youtube.com/watch?v=abc123"
npm run dev -- play "https://www.youtube.com/playlist?list=PL123"
npm run dev -- play "https://www.youtube.com/live/abc123"
```

Manual interactive UI smoke test:

```bash
npm run dev -- start
```

Checklist:

- Paste public TikTok and YouTube URLs and confirm playback starts.
- Space toggles pause/resume.
- `n` or right arrow moves to the next queue item when available.
- `p` or left arrow restarts or moves to the previous item.
- `q` or Ctrl+C exits and restores the terminal.
- `r` toggles repeat current track.
- `l` toggles repeat queue/playlist.
- `s` toggles stable shuffle order.

For playback startup diagnostics, enable timing logs:

```bash
CHILL_RADIO_TIMING=1 npm run dev -- play "https://www.youtube.com/watch?v=abc123"
```

## Release validation

```bash
npm whoami
npm view @tgiap-dev/chill-radio name version --json
npm run typecheck
npm run build
npm test
npm pack --dry-run
npm pack
npm install --prefix /tmp/chill-radio-smoke --ignore-scripts -g ./tgiap-dev-chill-radio-0.1.0.tgz
/tmp/chill-radio-smoke/bin/chill-radio --help
/tmp/chill-radio-smoke/bin/chill-radio play not-a-url
npm install --prefix /tmp/chill-radio-postinstall-smoke -g ./tgiap-dev-chill-radio-0.1.0.tgz
```

`npm view @tgiap-dev/chill-radio name version --json` may return npm 404 before the first publish; verify the npm account owns or can publish the `@tgiap-dev` scope before enabling automation. The `--ignore-scripts` install validates the CLI bin path without downloading binaries; the second install validates real `postinstall` behavior and may download `yt-dlp`/macOS `mpv`. Current binary downloads use mutable GitHub latest release URLs without checksum verification, so treat that as an explicit first-release risk or pin versions with SHA256 checks before publish. Do not commit `.npmrc`, npm tokens, generated `.tgz`, or downloaded `vendor` binaries.

## Automated npm publish

Publishing runs automatically on every non-bot push to `main`. The workflow validates the package, bumps the patch version, publishes to npm, then pushes the version commit/tag and creates a GitHub Release.

Required GitHub setup:

- Add repository secret `NPM_TOKEN` with an npm automation token that can publish `@tgiap-dev/chill-radio`.
- Enable GitHub Actions workflow read/write permissions so `contents: write` can push the version commit and tag.
- Ensure branch protection allows `github-actions[bot]` to push release commits/tags to `main`, or the workflow will fail after validation.
- Verify the npm account can publish under the `@tgiap-dev` scope before the first push that enables automation.

Workflow behavior:

1. `npm ci --ignore-scripts` installs dependencies without downloading runtime binaries in CI.
2. `npm run typecheck`, `npm run build`, `npm test`, and `npm pack --dry-run` must pass.
3. `npm version patch --no-git-tag-version` bumps the package version in the workflow workspace.
4. `npm publish --access public` publishes with `NODE_AUTH_TOKEN` from `NPM_TOKEN`.
5. The workflow commits `package.json`/`package-lock.json`, tags `vX.Y.Z`, and pushes to `main`.
6. `gh release create` creates the GitHub Release.

The workflow skips commits from `github-actions[bot]` and commits containing `[skip ci]` to avoid an infinite release loop. Because every normal push to `main` publishes a patch release, keep `main` stable and use PR checks before merging.

If npm publish fails, the workflow stops before pushing the version commit/tag. Inspect the GitHub Actions logs, fix the blocker, and push a new change to retry. If npm publish succeeds but the later git push or GitHub Release step fails, run `npm view @tgiap-dev/chill-radio versions --json`, then manually commit/tag the already published version or create the missing GitHub Release; do not bump again unless you intentionally want a new patch version.

## Manual publish fallback

Use this only if automation is disabled or recovery requires a manual publish:

```bash
npm publish --access public
npm view @tgiap-dev/chill-radio version
npm install -g @tgiap-dev/chill-radio
chill-radio --help
```

If a bad version is published, prefer `npm deprecate @tgiap-dev/chill-radio@<version> "reason"` and publish a fixed patch version. Use `npm unpublish @tgiap-dev/chill-radio@<version>` only if it is within npm policy and safe for users.

## Package layout

- `src/cli.ts`: CLI program setup.
- `src/commands/play.ts`: `play <url>` command boundary.
- `src/commands/start.ts`: interactive terminal player command.
- `src/services/media-extractor.ts`: TikTok/YouTube `yt-dlp` metadata and stream queue extraction.
- `src/services/media-queue-player.ts`: sequential playback for extracted media queues.
- `src/services/audio-player.ts`: blocking `mpv` process startup for one-shot playback.
- `src/services/player-session.ts`: controllable `mpv` JSON IPC session for interactive playback.
- `src/services/interactive-queue-controller.ts`: queue navigation for start mode.
- `src/platform/`: platform and binary path resolution.
- `src/ui/`: terminal output formatting.
