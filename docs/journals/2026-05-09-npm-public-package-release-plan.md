---
title: NPM Public Package Release Plan
created: 2026-05-09
type: planning
---

# NPM Public Package Release Plan

## Context

User asked for a plan to prepare `chill-radio` for public npm package release. Initial decisions: package name `chill-radio`, MIT license, manual publish first. Later implementation moved to scoped package `@tgiap-dev/chill-radio` because the unscoped name has historical npm unpublish state.

## What happened

Created plan at:

```text
plans/260509-1654-npm-public-package-release/plan.md
```

Plan phases:

1. Package metadata and entrypoints.
2. Install and binary readiness.
3. Package contents and local validation.
4. Docs and release checklist.
5. Manual publish runbook.

## Key decisions

- No automated GitHub Actions publish in first release scope.
- Must check npm name availability before publish.
- Must verify `bin` path against actual build output.
- Must inspect `npm pack --dry-run` before public publish.
- `npm publish` requires explicit user approval later.

## Unresolved questions

- Need actual npm name availability check during implementation.
- Need final author/repository/homepage metadata values.
