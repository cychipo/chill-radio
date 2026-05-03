import { describe, expect, it } from 'vitest';
import { buildMpvArgs } from '../src/services/audio-player.js';

describe('buildMpvArgs', () => {
  it('plays through mpv yt-dlp hook with the original webpage URL', () => {
    expect(
      buildMpvArgs(
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
