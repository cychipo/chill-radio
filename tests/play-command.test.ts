import { describe, expect, it } from 'vitest';
import {
  classifyTikTokPath,
  classifyYouTubeUrl,
  createFastTikTokVideoMedia,
  parseMediaInput,
} from '../src/commands/play.js';
import { UserFacingError } from '../src/ui/errors.js';

describe('parseMediaInput', () => {
  it('accepts TikTok video URLs', () => {
    expect(parseMediaInput('https://www.tiktok.com/@radio/video/123')).toEqual({
      url: 'https://www.tiktok.com/@radio/video/123',
      platform: 'tiktok',
      kind: 'video',
    });
  });

  it('accepts TikTok profile URLs', () => {
    expect(parseMediaInput('https://www.tiktok.com/@radio')).toEqual({
      url: 'https://www.tiktok.com/@radio',
      platform: 'tiktok',
      kind: 'profile',
    });
  });

  it('accepts TikTok playlist URLs', () => {
    expect(parseMediaInput('https://www.tiktok.com/@radio/playlist/chill-123')).toEqual({
      url: 'https://www.tiktok.com/@radio/playlist/chill-123',
      platform: 'tiktok',
      kind: 'playlist',
    });
  });

  it('accepts YouTube video URLs', () => {
    expect(parseMediaInput('https://www.youtube.com/watch?v=abc123')).toEqual({
      url: 'https://www.youtube.com/watch?v=abc123',
      platform: 'youtube',
      kind: 'video',
    });
  });

  it('accepts short YouTube video URLs', () => {
    expect(parseMediaInput('https://youtu.be/abc123')).toEqual({
      url: 'https://youtu.be/abc123',
      platform: 'youtube',
      kind: 'video',
    });
  });

  it('accepts YouTube playlist URLs', () => {
    expect(parseMediaInput('https://www.youtube.com/playlist?list=PL123')).toEqual({
      url: 'https://www.youtube.com/playlist?list=PL123',
      platform: 'youtube',
      kind: 'playlist',
    });
  });

  it('treats YouTube watch URLs with a list as playlists', () => {
    expect(parseMediaInput('https://www.youtube.com/watch?v=abc123&list=PL123')).toEqual({
      url: 'https://www.youtube.com/watch?v=abc123&list=PL123',
      platform: 'youtube',
      kind: 'playlist',
    });
  });

  it('accepts YouTube livestream URLs', () => {
    expect(parseMediaInput('https://www.youtube.com/live/abc123')).toEqual({
      url: 'https://www.youtube.com/live/abc123',
      platform: 'youtube',
      kind: 'livestream',
    });
  });

  it('rejects invalid URLs', () => {
    expect(() => parseMediaInput('not-a-url')).toThrow(UserFacingError);
  });

  it('rejects non-http protocols', () => {
    expect(() => parseMediaInput('file:///tmp/audio.mp3')).toThrow('URL must start with http:// or https://.');
  });

  it('rejects unsupported URLs', () => {
    expect(() => parseMediaInput('https://soundcloud.com/radio')).toThrow('Supported platforms: TikTok and YouTube.');
  });
});

describe('createFastTikTokVideoMedia', () => {
  it('creates minimal media from the original video URL', () => {
    expect(
      createFastTikTokVideoMedia({
        url: 'https://www.tiktok.com/@radio/video/123',
        platform: 'tiktok',
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

describe('classifyYouTubeUrl', () => {
  it('classifies playlist paths and watch URLs with list params', () => {
    expect(classifyYouTubeUrl(new URL('https://www.youtube.com/playlist?list=PL123'))).toBe('playlist');
    expect(classifyYouTubeUrl(new URL('https://www.youtube.com/watch?v=1&list=PL123'))).toBe('playlist');
  });

  it('classifies live paths', () => {
    expect(classifyYouTubeUrl(new URL('https://www.youtube.com/live/abc123'))).toBe('livestream');
  });

  it('classifies normal watch and short URLs as video', () => {
    expect(classifyYouTubeUrl(new URL('https://www.youtube.com/watch?v=abc123'))).toBe('video');
    expect(classifyYouTubeUrl(new URL('https://youtu.be/abc123'))).toBe('video');
  });
});
