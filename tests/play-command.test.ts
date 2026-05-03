import { describe, expect, it } from 'vitest';
import { parseMediaUrl } from '../src/commands/play.js';
import { UserFacingError } from '../src/ui/errors.js';

describe('parseMediaUrl', () => {
  it('accepts http and https URLs', () => {
    expect(parseMediaUrl('https://example.com/watch?v=1')).toBe('https://example.com/watch?v=1');
    expect(parseMediaUrl('http://example.com/audio')).toBe('http://example.com/audio');
  });

  it('rejects invalid URLs', () => {
    expect(() => parseMediaUrl('not-a-url')).toThrow(UserFacingError);
  });

  it('rejects non-http protocols', () => {
    expect(() => parseMediaUrl('file:///tmp/audio.mp3')).toThrow('URL must start with http:// or https://.');
  });
});
