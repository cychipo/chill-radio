# GitHub NPM Release Setup

## Overview

`chill-radio` has a GitHub Actions workflow at `.github/workflows/publish-npm.yml` that publishes a new npm patch release on every non-bot push to `main`.

Before pushing this workflow to GitHub, configure GitHub and npm so the first release does not fail halfway.

## What the workflow does

On every normal push to `main`:

1. Install dependencies with `npm ci --ignore-scripts`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm test`.
5. Run `npm pack --dry-run`.
6. Bump patch version in `package.json` and `package-lock.json`.
7. Publish to npm with `NPM_TOKEN`.
8. Commit the new version, create tag `vX.Y.Z`, and push it to `main`.
9. Create a GitHub Release for that tag.

The workflow skips `github-actions[bot]` and commits containing `[skip ci]` to avoid an infinite release loop.

## 1. Verify npm package access

Run locally:

```bash
npm whoami
npm view @tgiap-dev/chill-radio name version --json
```

Current known behavior: `npm view @tgiap-dev/chill-radio name version --json` may return npm 404 before the first publish. Verify your npm account owns or can publish under the `@tgiap-dev` scope before enabling the workflow.

If npm blocks the scope, change the package scope before pushing automation to `main`.

## 2. Create npm automation token

In npm:

1. Open npm account settings.
2. Go to access tokens.
3. Create an automation token or publish-capable access token.
4. Copy the token once.

Do not commit this token. Do not put it in `.npmrc` inside the repo.

## 3. Add GitHub secret

In GitHub repository settings:

1. Go to `Settings` → `Secrets and variables` → `Actions`.
2. Add repository secret:

```text
NPM_TOKEN=<your npm token>
```

The workflow reads it as:

```yaml
NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 4. Enable workflow write permission

In GitHub repository settings:

1. Go to `Settings` → `Actions` → `General`.
2. Under workflow permissions, choose read and write permissions.
3. Save.

The workflow needs this because it pushes the version bump commit and git tag after npm publish succeeds.

## 5. Check branch protection

If `main` has branch protection, make sure `github-actions[bot]` can push release commits and tags.

The workflow runs:

```bash
git push origin HEAD:main --follow-tags
```

If branch protection blocks this push, npm may already be published but GitHub will not receive the version commit/tag. In that case, manually recover the version commit/tag before pushing another release.

## 6. Validate locally before first push

Run:

```bash
npm run typecheck
npm run build
npm test
npm pack --dry-run
```

Optional package smoke:

```bash
npm pack
npm install --prefix /tmp/chill-radio-smoke --ignore-scripts -g ./tgiap-dev-chill-radio-0.1.0.tgz
/tmp/chill-radio-smoke/bin/chill-radio --help
/tmp/chill-radio-smoke/bin/chill-radio play not-a-url
```

The invalid URL command should print a short user-facing error and exit non-zero.

## 7. First push checklist

Before merging or pushing to `main`:

- `NPM_TOKEN` exists in GitHub Actions secrets.
- GitHub Actions has read/write permission.
- Branch protection allows the bot release push.
- npm account can publish `@tgiap-dev/chill-radio`.
- `npm pack --dry-run` excludes `tests`, `plans`, `.claude`, `vendor`, `.env`, and old tarballs.
- You accept the current first-release risk: postinstall downloads GitHub latest binaries without checksum pinning.

## 8. Verify after workflow runs

After the GitHub Action finishes:

```bash
npm view @tgiap-dev/chill-radio version
npm install -g @tgiap-dev/chill-radio
chill-radio --help
```

Also check GitHub:

- `package.json` version was bumped on `main`.
- Tag `vX.Y.Z` exists.
- GitHub Release `vX.Y.Z` exists.

## Recovery notes

If npm publish fails, the workflow stops before pushing the version commit/tag. Fix the issue and push a new change to retry.

If npm publish succeeds but git push or GitHub Release creation fails:

1. Check published versions:

```bash
npm view @tgiap-dev/chill-radio versions --json
```

2. Manually commit/tag the already published version or create the missing GitHub Release.
3. Do not bump again unless you intentionally want a new patch version.

If a bad version is published, prefer:

```bash
npm deprecate @tgiap-dev/chill-radio@<version> "reason"
```

Then publish a fixed patch version. Use `npm unpublish @tgiap-dev/chill-radio@<version>` only if it is allowed by npm policy and safe for users.
