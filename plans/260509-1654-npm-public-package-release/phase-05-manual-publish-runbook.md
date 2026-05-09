# Phase 05: Manual Publish Runbook

## Context Links

- Plan: `plans/260509-1654-npm-public-package-release/plan.md`
- Package config: `package.json`
- NPM docs: `README.md`, `docs/INSTALL.md`, `docs/DEV.md`

## Overview

Priority: High  
Status: Complete

Define the manual release process. Publishing is a shared external state change, so the implementation should prepare scripts/docs but only publish after explicit user confirmation.

## Requirements

### Functional

- Include pre-publish commands.
- Include npm login/status checks.
- Include package name availability check.
- Include publish command.
- Include post-publish install verification.
- Include rollback/deprecation notes for bad release.

### Non-functional

- No npm token in repo.
- No automatic publish from code changes.
- Require human review of `npm pack --dry-run` output.

## Manual Runbook Draft

```bash
npm whoami
npm view @tgiap-dev/chill-radio name version --json
npm run typecheck
npm run build
npm test
npm pack --dry-run
npm pack
npm install --prefix /tmp/chill-radio-smoke -g ./chill-radio-*.tgz
/tmp/chill-radio-smoke/bin/chill-radio --help
/tmp/chill-radio-smoke/bin/chill-radio play not-a-url
npm publish --access public
npm view @tgiap-dev/chill-radio version
npm install -g @tgiap-dev/chill-radio
chill-radio --help
```

If publish is bad:

- If within npm unpublish policy window and no users should depend on it, consider `npm unpublish @tgiap-dev/chill-radio@<version>`.
- Prefer `npm deprecate @tgiap-dev/chill-radio@<version> "reason"` and publish a fixed patch version.
- Never force-publish secrets; rotate exposed tokens immediately if leaked.

## Related Files

### Modify

- `docs/DEV.md` or a release section in `README.md`.
- `docs/project-changelog.md`.

## Implementation Steps

1. Add runbook to developer/release docs.
2. Ensure package scripts match runbook.
3. Verify temp-prefix CLI path on macOS; adjust command if npm creates a different bin location.
4. Ask user for explicit approval before running `npm publish`.

## Todo List

- [x] Add release runbook to docs.
- [x] Verify npm auth instructions.
- [x] Verify post-publish install check.
- [x] Document deprecate/unpublish fallback.

## Success Criteria

- User can publish manually without guessing commands.
- Publish step is clearly separated from validation.
- Post-publish verification is defined.

## Risk Assessment

- `npm publish` is public and hard to reverse; do not run without explicit user approval.
- NPM OTP may require interactive input; user may need to run command manually.

## Security Considerations

- Never commit `.npmrc` or tokens.
- Use npm account 2FA where possible.
- Inspect tarball before publish.

## Next Steps

After runbook is implemented and validated, user can decide whether to publish.
