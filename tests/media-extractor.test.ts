import { describe, expect, it } from 'vitest';
import { normalizeMediaInfo } from '../src/services/media-extractor.js';

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
        },
        'https://fallback.example/watch',
      ),
    ).toEqual({
      title: 'lofi track',
      uploader: 'radio channel',
      durationSeconds: 125,
      streamUrl: 'https://cdn.example/audio.m4a',
      webpageUrl: 'https://example.com/watch',
    });
  });

  it('requires a stream URL', () => {
    expect(() => normalizeMediaInfo({ title: 'no stream' }, 'https://example.com')).toThrow(
      'Could not find a playable audio stream.',
    );
  });
});
