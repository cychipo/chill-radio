import { describe, expect, it } from 'vitest';
import { classifyTikTokPath, createFastTikTokVideoMedia, parseTikTokInput } from '../src/commands/play.js';
import { UserFacingError } from '../src/ui/errors.js';

describe('parseTikTokInput', () => {
  it('accepts TikTok video URLs', () => {
    expect(parseTikTokInput('https://www.tiktok.com/@radio/video/123')).toEqual({
      url: 'https://www.tiktok.com/@radio/video/123',
      kind: 'video',
    });
  });

  it('accepts TikTok profile URLs', () => {
    expect(parseTikTokInput('https://www.tiktok.com/@radio')).toEqual({
      url: 'https://www.tiktok.com/@radio',
      kind: 'profile',
    });
  });

  it('accepts TikTok playlist URLs', () => {
    expect(parseTikTokInput('https://www.tiktok.com/@radio/playlist/chill-123')).toEqual({
      url: 'https://www.tiktok.com/@radio/playlist/chill-123',
      kind: 'playlist',
    });
  });

  it('accepts short TikTok URLs', () => {
    expect(parseTikTokInput('https://vm.tiktok.com/ZM123/')).toEqual({
      url: 'https://vm.tiktok.com/ZM123/',
      kind: 'profile',
    });
  });

  it('rejects invalid URLs', () => {
    expect(() => parseTikTokInput('not-a-url')).toThrow(UserFacingError);
  });

  it('rejects non-http protocols', () => {
    expect(() => parseTikTokInput('file:///tmp/audio.mp3')).toThrow('URL must start with http:// or https://.');
  });

  it('rejects non-TikTok URLs', () => {
    expect(() => parseTikTokInput('https://youtube.com/watch?v=1')).toThrow(
      'TikTok is currently the only supported platform.',
    );
  });
});

describe('createFastTikTokVideoMedia', () => {
  it('creates minimal media from the original video URL', () => {
    expect(
      createFastTikTokVideoMedia({
        url: 'https://www.tiktok.com/@radio/video/123',
        kind: 'video',
      }),
    ).toEqual({
      title: 'TikTok video',
      streamUrl: 'https://www.tiktok.com/@radio/video/123',
      webpageUrl: 'https://www.tiktok.com/@radio/video/123',
    });
  });
});

describe('classifyTikTokPath', () => {
  it('classifies video paths', () => {
    expect(classifyTikTokPath('/@radio/video/123')).toBe('video');
  });

  it('classifies playlist paths', () => {
    expect(classifyTikTokPath('/@radio/playlist/chill-123')).toBe('playlist');
    expect(classifyTikTokPath('/@radio/collection/chill-123')).toBe('playlist');
  });

  it('classifies profile paths', () => {
    expect(classifyTikTokPath('/@radio')).toBe('profile');
  });
});
