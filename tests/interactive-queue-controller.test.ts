import { describe, expect, it } from 'vitest';
import { InteractiveQueueController } from '../src/services/interactive-queue-controller.js';
import type { PlayerSession } from '../src/services/player-session.js';
import type { MediaInfo } from '../src/types/media.js';

const mediaItems: MediaInfo[] = [
  { title: 'first', streamUrl: 'https://cdn.example/1', webpageUrl: 'https://www.tiktok.com/@c/video/1' },
  { title: 'second', streamUrl: 'https://cdn.example/2', webpageUrl: 'https://www.youtube.com/watch?v=2' },
  { title: 'third', streamUrl: 'https://cdn.example/3', webpageUrl: 'https://www.youtube.com/watch?v=3' },
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
    expect(state?.queueLength).toBe(3);
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

  it('repeats current track when playback exits', async () => {
    const started: string[] = [];
    const firstExit = createDeferred<void>();
    let startCount = 0;
    const controller = new InteractiveQueueController(mediaItems, async (media) => {
      started.push(media.title);
      startCount += 1;
      return createFakeSession(media, 0, startCount === 1 ? firstExit.promise : new Promise(() => undefined));
    });

    await controller.start();
    controller.toggleRepeatTrack();
    firstExit.resolve();
    await flushPromises();

    expect(started).toEqual(['first', 'first']);
    expect((await controller.getState())?.playbackMode).toEqual({ repeatMode: 'track', shuffle: false });
  });

  it('repeats queue after the last track exits', async () => {
    const started: string[] = [];
    const lastExit = createDeferred<void>();
    const controller = new InteractiveQueueController(mediaItems, async (media) => {
      started.push(media.title);
      return createFakeSession(media, 0, media.title === 'third' ? lastExit.promise : new Promise(() => undefined));
    });

    await controller.start(2);
    controller.toggleRepeatQueue();
    lastExit.resolve();
    await flushPromises();

    expect(started).toEqual(['third', 'first']);
    expect((await controller.getState())?.media.title).toBe('first');
  });

  it('uses a stable shuffled order for next and previous', async () => {
    const started: string[] = [];
    const controller = new InteractiveQueueController(
      mediaItems,
      async (media) => {
        started.push(media.title);
        return createFakeSession(media, 0);
      },
      () => 0,
    );

    await controller.start();
    controller.toggleShuffle();
    await controller.next();
    await controller.next();
    await controller.previous();

    expect(started).toEqual(['first', 'third', 'second', 'third']);
    expect((await controller.getState())?.playbackMode).toEqual({ repeatMode: 'off', shuffle: true });
  });

  it('keeps playback errors visible in queue state', async () => {
    const controller = new InteractiveQueueController(mediaItems, async (media) =>
      createFakeSession(media, 0, Promise.reject(new Error('Playback failed with exit code 2. HTTP error 403 Forbidden'))),
    );

    await controller.start();
    await flushPromises();

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

function createDeferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
