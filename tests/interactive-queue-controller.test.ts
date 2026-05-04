import { describe, expect, it } from 'vitest';
import { InteractiveQueueController } from '../src/services/interactive-queue-controller.js';
import type { PlayerSession } from '../src/services/player-session.js';
import type { MediaInfo } from '../src/types/media.js';

const mediaItems: MediaInfo[] = [
  { title: 'first', streamUrl: 'https://cdn.example/1', webpageUrl: 'https://www.tiktok.com/@c/video/1' },
  { title: 'second', streamUrl: 'https://cdn.example/2', webpageUrl: 'https://www.tiktok.com/@c/video/2' },
];

describe('InteractiveQueueController', () => {
  it('starts, moves next, and reports queue state', async () => {
    const started: string[] = [];
    const controller = new InteractiveQueueController(mediaItems, async (media) => {
      started.push(media.title);
      return createFakeSession(media, 0);
    });

    await controller.start();
    expect((await controller.getState())?.media.title).toBe('first');

    await controller.next();
    const state = await controller.getState();

    expect(started).toEqual(['first', 'second']);
    expect(state?.media.title).toBe('second');
    expect(state?.queueIndex).toBe(1);
    expect(state?.queueLength).toBe(2);
  });

  it('restarts current track when previous is pressed after threshold', async () => {
    const started: string[] = [];
    const controller = new InteractiveQueueController(mediaItems, async (media) => {
      started.push(media.title);
      return createFakeSession(media, 10);
    });

    await controller.start(1);
    await controller.previous();

    expect(started).toEqual(['second', 'second']);
    expect((await controller.getState())?.media.title).toBe('second');
  });

  it('keeps playback errors visible in queue state', async () => {
    const controller = new InteractiveQueueController(mediaItems, async (media) =>
      createFakeSession(media, 0, Promise.reject(new Error('Playback failed with exit code 2. HTTP error 403 Forbidden'))),
    );

    await controller.start();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect((await controller.getState())?.errorMessage).toBe('Playback failed with exit code 2. HTTP error 403 Forbidden');
  });
});

function createFakeSession(media: MediaInfo, elapsedSeconds: number, exitPromise: Promise<void> = new Promise(() => undefined)): PlayerSession {
  return {
    media,
    togglePause: async () => undefined,
    setPause: async () => undefined,
    stop: async () => undefined,
    getProgress: async () => ({ elapsedSeconds, durationSeconds: 100, paused: false }),
    waitForExit: async () => exitPromise,
  };
}
