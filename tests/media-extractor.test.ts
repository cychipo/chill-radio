import { describe, expect, it } from 'vitest';
import { mapExtractorError, normalizeMediaInfo, normalizeMediaResult } from '../src/services/media-extractor.js';

describe('normalizeMediaInfo', () => {
  it('normalizes extractor metadata', () => {
    expect(
      normalizeMediaInfo(
        {
          title: 'lofi track',
          uploader: 'radio channel',
          duration: 125,
          url: 'https://cdn.example/audio.m4a',
          webpage_url: 'https://example.com/watch',
          http_headers: {
            Referer: 'https://www.tiktok.com/',
            'User-Agent': 'Mozilla/5.0',
            Count: 1,
          },
        },
        'https://fallback.example/watch',
      ),
    ).toEqual({
      title: 'lofi track',
      uploader: 'radio channel',
      durationSeconds: 125,
      streamUrl: 'https://cdn.example/audio.m4a',
      webpageUrl: 'https://example.com/watch',
      httpHeaders: {
        Referer: 'https://www.tiktok.com/',
        'User-Agent': 'Mozilla/5.0',
      },
    });
  });

  it('requires a stream URL', () => {
    expect(() => normalizeMediaInfo({ title: 'no stream' }, 'https://example.com')).toThrow(
      'Could not find a playable audio stream.',
    );
  });

  it('allows YouTube livestreams without duration', () => {
    expect(
      normalizeMediaInfo(
        {
          title: 'live radio',
          channel: 'station',
          url: 'https://cdn.example/live',
          webpage_url: 'https://www.youtube.com/live/abc123',
        },
        'https://www.youtube.com/live/abc123',
        'youtube',
      ),
    ).toEqual({
      title: 'live radio',
      uploader: 'station',
      streamUrl: 'https://cdn.example/live',
      webpageUrl: 'https://www.youtube.com/live/abc123',
      durationSeconds: undefined,
      httpHeaders: undefined,
    });
  });
});

describe('mapExtractorError', () => {
  it('maps Python 3.10+ yt-dlp failures to an actionable install message', () => {
    expect(
      mapExtractorError(new Error('ImportError: Only Python versions 3.10 and above are supported by yt-dlp')).message,
    ).toBe('yt-dlp requires Python 3.10+ or the native yt-dlp binary. Run npm install again to download the native binary.');
  });
});

describe('normalizeMediaResult', () => {
  it('returns one media item for a TikTok video result', () => {
    expect(
      normalizeMediaResult(
        {
          title: 'focus clip',
          channel: 'creator',
          duration: 42,
          url: 'https://cdn.example/video-audio',
          webpage_url: 'https://www.tiktok.com/@creator/video/1',
        },
        { url: 'https://www.tiktok.com/@creator/video/1', platform: 'tiktok', kind: 'video' },
      ),
    ).toHaveLength(1);
  });

  it('normalizes TikTok profile and playlist entries into a queue', () => {
    expect(
      normalizeMediaResult(
        {
          entries: [
            {
              title: 'first',
              uploader: 'creator',
              url: 'https://cdn.example/first',
              webpage_url: 'https://www.tiktok.com/@creator/video/1',
            },
            {
              title: 'second',
              uploader: 'creator',
              url: 'https://cdn.example/second',
              webpage_url: 'https://www.tiktok.com/@creator/video/2',
            },
          ],
        },
        { url: 'https://www.tiktok.com/@creator', platform: 'tiktok', kind: 'profile' },
      ).map((media) => media.title),
    ).toEqual(['first', 'second']);
  });

  it('normalizes YouTube playlist entries into a queue', () => {
    expect(
      normalizeMediaResult(
        {
          entries: [
            {
              title: 'first video',
              channel: 'radio',
              duration: 180,
              url: 'https://cdn.example/youtube-first',
              webpage_url: 'https://www.youtube.com/watch?v=1',
            },
            {
              title: 'second video',
              channel: 'radio',
              duration: 240,
              url: 'https://cdn.example/youtube-second',
              webpage_url: 'https://www.youtube.com/watch?v=2',
            },
          ],
        },
        { url: 'https://www.youtube.com/playlist?list=PL123', platform: 'youtube', kind: 'playlist' },
      ).map((media) => media.title),
    ).toEqual(['first video', 'second video']);
  });

  it('skips unplayable entries when at least one entry is playable', () => {
    expect(
      normalizeMediaResult(
        {
          entries: [{ title: 'missing stream' }, { title: 'playable', url: 'https://cdn.example/playable' }],
        },
        { url: 'https://www.youtube.com/playlist?list=PL123', platform: 'youtube', kind: 'playlist' },
      ).map((media) => media.title),
    ).toEqual(['playable']);
  });

  it('rejects empty YouTube queues', () => {
    expect(() =>
      normalizeMediaResult({ entries: [] }, { url: 'https://www.youtube.com/playlist?list=PL123', platform: 'youtube', kind: 'playlist' }),
    ).toThrow('No playable YouTube videos found.');
  });
});
