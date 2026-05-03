import { describe, expect, it } from 'vitest';
import { buildMpvDirectArgs, buildMpvHookArgs, isForbiddenPlayback } from '../src/services/audio-player.js';

describe('buildMpvHookArgs', () => {
  it('plays through mpv yt-dlp hook with the original webpage URL', () => {
    expect(
      buildMpvHookArgs(
        {
          title: 'track',
          streamUrl: 'https://cdn.example/media.mp4',
          webpageUrl: 'https://www.tiktok.com/@creator/video/1',
        },
        '/tmp/yt-dlp',
      ),
    ).toEqual([
      '--no-video',
      '--really-quiet',
      '--script-opts=ytdl_hook-ytdl_path=/tmp/yt-dlp',
      'https://www.tiktok.com/@creator/video/1',
    ]);
  });
});

describe('buildMpvDirectArgs', () => {
  it('passes direct stream URL with repeated safe HTTP headers', () => {
    expect(
      buildMpvDirectArgs({
        title: 'track',
        streamUrl: 'https://cdn.example/media.mp4',
        webpageUrl: 'https://www.tiktok.com/@creator/video/1',
        httpHeaders: {
          Referer: 'https://www.tiktok.com/',
          'User-Agent': 'Mozilla/5.0',
          Authorization: 'ignored',
        },
      }),
    ).toEqual([
      '--no-video',
      '--really-quiet',
      '--http-header-fields-append=Referer: https://www.tiktok.com/',
      '--http-header-fields-append=User-Agent: Mozilla/5.0',
      'https://cdn.example/media.mp4',
    ]);
  });
});

describe('isForbiddenPlayback', () => {
  it('detects TikTok CDN 403 errors', () => {
    expect(isForbiddenPlayback('[ffmpeg] https: HTTP error 403 Forbidden')).toBe(true);
    expect(isForbiddenPlayback('network timeout')).toBe(false);
  });
});
