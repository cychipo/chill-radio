import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { buildMpvIpcArgs, createPlayerSession, formatIpcCommand, formatPlaybackFailure } from '../src/services/player-session.js';

const spawnMock = vi.hoisted(() => vi.fn());
const connectMock = vi.hoisted(() => vi.fn());

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}));

vi.mock('node:net', () => ({
  connect: connectMock,
}));

vi.mock('../src/platform/binary-paths.js', () => ({
  resolveBinaryPath: (name: string) => Promise.resolve(`/tmp/${name}`),
}));

beforeEach(() => {
  spawnMock.mockReset();
  connectMock.mockReset();
});

describe('createPlayerSession', () => {
  it('starts interactive playback through mpv yt-dlp hook to avoid direct stream expiry', async () => {
    const player = createFakePlayer();
    spawnMock.mockReturnValue(player);
    connectMock.mockImplementation(() => createSuccessfulIpcClient());

    await createPlayerSession({
      title: 'track',
      streamUrl: 'https://cdn.example/track',
      webpageUrl: 'https://www.tiktok.com/@creator/video/1',
    });

    expect(spawnMock).toHaveBeenCalledWith(
      '/tmp/mpv',
      [
        '--no-video',
        '--really-quiet',
        '--ytdl-format=bestaudio/best',
        '--script-opts=ytdl_hook-ytdl_path=/tmp/yt-dlp',
        expect.stringMatching(/^--input-ipc-server=\/tmp\/cr-/),
        'https://www.tiktok.com/@creator/video/1',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'], shell: false },
    );
  });

  it('returns a session before mpv IPC is ready', async () => {
    const player = createFakePlayer();
    spawnMock.mockReturnValue(player);
    connectMock.mockImplementation(() => createFailingIpcClient());

    const session = await createPlayerSession({
      title: 'track',
      streamUrl: 'https://cdn.example/track',
      webpageUrl: 'https://www.tiktok.com/@creator/video/1',
    });

    expect(session.media.title).toBe('track');
  });
});

describe('buildMpvIpcArgs', () => {
  it('adds mpv JSON IPC server to direct stream playback args', () => {
    expect(
      buildMpvIpcArgs(
        {
          title: 'track',
          streamUrl: 'https://cdn.example/track',
          webpageUrl: 'https://www.tiktok.com/@creator/video/1',
          httpHeaders: {
            Referer: 'https://www.tiktok.com/',
            'User-Agent': 'Mozilla/5.0',
          },
        },
        '/tmp/yt-dlp',
        '/tmp/chill-radio.sock',
      ),
    ).toEqual([
      '--no-video',
      '--really-quiet',
      '--http-header-fields-append=Referer: https://www.tiktok.com/',
      '--http-header-fields-append=User-Agent: Mozilla/5.0',
      '--input-ipc-server=/tmp/chill-radio.sock',
      'https://cdn.example/track',
    ]);
  });

  it('builds mpv yt-dlp hook args when direct mode is disabled', () => {
    expect(
      buildMpvIpcArgs(
        {
          title: 'track',
          streamUrl: 'https://cdn.example/track',
          webpageUrl: 'https://www.tiktok.com/@creator/video/1',
        },
        '/tmp/yt-dlp',
        '/tmp/chill-radio.sock',
        'hook',
      ),
    ).toEqual([
      '--no-video',
      '--really-quiet',
      '--ytdl-format=bestaudio/best',
      '--script-opts=ytdl_hook-ytdl_path=/tmp/yt-dlp',
      '--input-ipc-server=/tmp/chill-radio.sock',
      'https://www.tiktok.com/@creator/video/1',
    ]);
  });

  it('falls back to mpv yt-dlp hook args when only webpage URL is available', () => {
    expect(
      buildMpvIpcArgs(
        {
          title: 'track',
          streamUrl: 'https://www.tiktok.com/@creator/video/1',
          webpageUrl: 'https://www.tiktok.com/@creator/video/1',
        },
        '/tmp/yt-dlp',
        '/tmp/chill-radio.sock',
      ),
    ).toEqual([
      '--no-video',
      '--really-quiet',
      '--ytdl-format=bestaudio/best',
      '--script-opts=ytdl_hook-ytdl_path=/tmp/yt-dlp',
      '--input-ipc-server=/tmp/chill-radio.sock',
      'https://www.tiktok.com/@creator/video/1',
    ]);
  });
});

function createFakePlayer() {
  return Object.assign(new EventEmitter(), {
    stderr: new EventEmitter(),
    killed: false,
    exitCode: null,
    kill: vi.fn(),
  });
}

function createSuccessfulIpcClient() {
  return Object.assign(new EventEmitter(), {
    write: vi.fn(function (this: EventEmitter) {
      queueMicrotask(() => this.emit('data', Buffer.from('{"error":"success"}\n')));
    }),
    end: vi.fn(),
    destroy: vi.fn(),
  });
}

function createFailingIpcClient() {
  return Object.assign(new EventEmitter(), {
    write: vi.fn(function (this: EventEmitter) {
      queueMicrotask(() => this.emit('error', new Error('not ready')));
    }),
    end: vi.fn(),
    destroy: vi.fn(),
  });
}

describe('formatIpcCommand', () => {
  it('formats one JSON mpv IPC command per line', () => {
    expect(formatIpcCommand(['set_property', 'pause', true])).toBe('{"command":["set_property","pause",true]}\n');
  });
});

describe('formatPlaybackFailure', () => {
  it('includes useful mpv stderr context instead of only exit code', () => {
    expect(
      formatPlaybackFailure(
        2,
        null,
        '[ffmpeg] https: HTTP error 403 Forbidden\n[ytdl_hook] youtube-dl failed: not found or not enough permissions',
      ).message,
    ).toBe('Playback failed with exit code 2. [ffmpeg] https: HTTP error 403 Forbidden');
  });
});
