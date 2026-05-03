# Phase 01: TikTok URL Boundary

## Context Links

- User stories: `user_stories.md` Epic 2.1 and 2.3
- Existing command: `src/commands/play.ts`
- Existing tests: `tests/play-command.test.ts`
- Overview: `plans/260503-1509-tiktok-basic-playback/plan.md`

## Overview

Priority: High  
Status: Complete

Restrict the current MVP to TikTok URLs and classify whether the input is a single video, a user/channel profile, or a playlist/collection so downstream extraction can pick the correct flow.

## Requirements

### Functional

- Accept `https://www.tiktok.com/...`, `https://tiktok.com/...`, and `https://vm.tiktok.com/...` URLs.
- Classify TikTok video URLs, commonly shaped like `/@user/video/<id>`.
- Classify TikTok profile/channel URLs, commonly shaped like `/@user`.
- Classify TikTok playlist/collection URLs when path contains known playlist/collection markers such as `/playlist/`, `/collection/`, or TikTok-supported list URLs observed during implementation.
- Reject non-HTTP(S) URLs.
- Reject non-TikTok URLs with a clear message.
- Keep URL validation and input-kind classification at the CLI boundary before extraction.

### Non-functional

- Keep validation deterministic and unit-testable.
- Do not add broad platform abstractions yet.

## Architecture

```text
play command
  -> parseMediaUrl
  -> assertTikTokUrl
  -> classifyTikTokInput
  -> extractTikTokMedia(input)
```

Recommended direct implementation:

```ts
const allowedHosts = new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']);
```

Consider accepting subdomains only if needed for observed TikTok short links; avoid opening `*.tiktok.com` without reason.

## Related Code Files

### Modify

- `src/commands/play.ts`
- `tests/play-command.test.ts`

## Implementation Steps

1. Rename or extend `parseMediaUrl` to express TikTok-only validation.
2. Add allowed host checks after URL parsing.
3. Add `TikTokInput` type, e.g. `{ url: string; kind: 'video' | 'profile' | 'playlist' }`.
4. Add path classifier for video/profile/playlist URL shapes.
5. Update command argument description from generic media URL to TikTok URL.
6. Add tests for accepted TikTok hosts.
7. Add tests for video/profile/playlist classification.
8. Add tests for YouTube/SoundCloud/non-TikTok rejection.
9. Keep invalid URL and non-HTTP protocol tests.

## Todo List

- [ ] Add TikTok host allowlist.
- [ ] Add TikTok input-kind type.
- [ ] Add video/profile/playlist classifier.
- [ ] Update CLI copy.
- [ ] Add accepted TikTok URL tests.
- [ ] Add input-kind classification tests.
- [ ] Add non-TikTok rejection tests.

## Success Criteria

- Non-TikTok URLs never reach extractor.
- Error message says TikTok is currently the only supported platform.
- Video/profile/playlist URL kinds are available to extractor code.
- Existing invalid URL behavior remains intact.

## Risk Assessment

- TikTok has multiple URL variants. Start with common hosts, add more only when validated.

## Security Considerations

- Validation must not execute or fetch URLs.
- Keep user input out of shell strings.

## Next Steps

Proceed to TikTok extraction hardening.
