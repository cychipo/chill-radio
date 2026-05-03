import { describe, expect, it } from 'vitest';
import { mapExtractorError, normalizeMediaInfo, normalizeTikTokResult } from '../src/services/media-extractor.js';

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
});

describe('mapExtractorError', () => {
  it('maps Python 3.10+ yt-dlp failures to an actionable install message', () => {
    expect(
      mapExtractorError(new Error('ImportError: Only Python versions 3.10 and above are supported by yt-dlp')).message,
    ).toBe('yt-dlp requires Python 3.10+ or the native yt-dlp binary. Run npm install again to download the native binary.');
  });
});

describe('normalizeTikTokResult', () => {
  it('returns one media item for a video result', () => {
    expect(
      normalizeTikTokResult(
        {
          title: 'focus clip',
          channel: 'creator',
          duration: 42,
          url: 'https://cdn.example/video-audio',
          webpage_url: 'https://www.tiktok.com/@creator/video/1',
        },
        { url: 'https://www.tiktok.com/@creator/video/1', kind: 'video' },
      ),
    ).toHaveLength(1);
  });

  it('normalizes profile and playlist entries into a queue', () => {
    expect(
      normalizeTikTokResult(
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
        { url: 'https://www.tiktok.com/@creator', kind: 'profile' },
      ).map((media) => media.title),
    ).toEqual(['first', 'second']);
  });

  it('skips unplayable entries when at least one entry is playable', () => {
    expect(
      normalizeTikTokResult(
        {
          entries: [
            { title: 'missing stream' },
            { title: 'playable', url: 'https://cdn.example/playable' },
          ],
        },
        { url: 'https://www.tiktok.com/@creator/playlist/list-1', kind: 'playlist' },
      ).map((media) => media.title),
    ).toEqual(['playable']);
  });

  it('rejects empty queues', () => {
    expect(() =>
      normalizeTikTokResult({ entries: [] }, { url: 'https://www.tiktok.com/@creator', kind: 'profile' }),
    ).toThrow('No playable TikTok videos found.');
  });
});
