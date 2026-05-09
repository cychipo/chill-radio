import { describe, expect, it, vi } from 'vitest';
import { playMediaQueue } from '../src/services/media-queue-player.js';
import type { MediaInfo } from '../src/types/media.js';

const queue: MediaInfo[] = [
  {
    title: 'first',
    streamUrl: 'https://cdn.example/first',
    webpageUrl: 'https://www.tiktok.com/@creator/video/1',
  },
  {
    title: 'second',
    streamUrl: 'https://cdn.example/second',
    webpageUrl: 'https://www.tiktok.com/@creator/video/2',
  },
];

describe('playMediaQueue', () => {
  it('plays media sequentially', async () => {
    const played: string[] = [];
    const written: string[] = [];

    await playMediaQueue(queue, {
      play: async (media) => {
        played.push(media.title);
      },
      render: (media) => `Now playing ${media.title}`,
      write: (message) => written.push(message),
    });

    expect(played).toEqual(['first', 'second']);
    expect(written).toEqual(['Now playing first', 'Now playing second']);
  });

  it('rejects empty queues', async () => {
    await expect(playMediaQueue([], { write: vi.fn() })).rejects.toThrow('No playable media found.');
  });
});
