import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { connect } from 'node:net';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';
import { buildMpvDirectArgs, buildMpvHookArgs } from './audio-player.js';

export type PlaybackProgress = {
  elapsedSeconds?: number;
  durationSeconds?: number;
  paused: boolean;
};

export type PlayerSession = {
  media: MediaInfo;
  togglePause: () => Promise<void>;
  setPause: (paused: boolean) => Promise<void>;
  stop: () => Promise<void>;
  getProgress: () => Promise<PlaybackProgress>;
  waitForExit: () => Promise<void>;
};

type MpvResponse = {
  data?: unknown;
  error?: string;
};

export function createIpcSocketPath(): string {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\chill-radio-${process.pid}-${randomUUID()}`;
  }

  return join('/tmp', `cr-${process.pid}-${randomUUID().slice(0, 8)}.sock`);
}

export function buildMpvIpcArgs(media: MediaInfo, ytDlpPath: string, socketPath: string, mode: 'direct' | 'hook' = 'direct'): string[] {
  const playbackArgs = mode === 'direct' && media.streamUrl !== media.webpageUrl ? buildMpvDirectArgs(media) : buildMpvHookArgs(media, ytDlpPath);
  return [...playbackArgs.slice(0, -1), `--input-ipc-server=${socketPath}`, playbackArgs[playbackArgs.length - 1]];
}

export function formatIpcCommand(command: unknown[]): string {
  return `${JSON.stringify({ command })}\n`;
}

export async function createPlayerSession(media: MediaInfo): Promise<PlayerSession> {
  const mpvPath = await resolveBinaryPath('mpv');
  const ytDlpPath = await resolveBinaryPath('yt-dlp');
  return startMpvSession(media, mpvPath, ytDlpPath, 'hook');
}

async function startMpvSession(media: MediaInfo, mpvPath: string, ytDlpPath: string, mode: 'direct' | 'hook'): Promise<PlayerSession> {
  const socketPath = createIpcSocketPath();
  const stderrChunks: Buffer[] = [];
  const player = spawn(mpvPath, buildMpvIpcArgs(media, ytDlpPath, socketPath, mode), {
    stdio: ['ignore', 'ignore', 'pipe'],
    shell: false,
  });

  player.stderr?.on('data', (chunk: Buffer) => {
    stderrChunks.push(chunk);
  });

  const getStderr = () => Buffer.concat(stderrChunks).toString('utf8');
  const exitPromise = createExitPromise(player, socketPath, getStderr);
  exitPromise.catch(() => undefined);

  void waitForIpc(socketPath, getStderr).catch(() => undefined);

  return {
    media,
    togglePause: () => sendIpcCommand(socketPath, ['cycle', 'pause']).then(() => undefined),
    setPause: (paused: boolean) => sendIpcCommand(socketPath, ['set_property', 'pause', paused]).then(() => undefined),
    stop: async () => {
      await sendIpcCommand(socketPath, ['quit']).catch(() => undefined);
      if (!player.killed && player.exitCode === null) {
        player.kill('SIGTERM');
      }
    },
    getProgress: async () => {
      const [elapsedSeconds, durationSeconds, paused] = await Promise.all([
        getNumberProperty(socketPath, 'time-pos'),
        getNumberProperty(socketPath, 'duration'),
        getBooleanProperty(socketPath, 'pause'),
      ]);

      return { elapsedSeconds, durationSeconds, paused: paused ?? false };
    },
    waitForExit: () => exitPromise,
  };
}

async function getNumberProperty(socketPath: string, name: string): Promise<number | undefined> {
  const response = await sendIpcCommand(socketPath, ['get_property', name]);
  return typeof response.data === 'number' && Number.isFinite(response.data) ? response.data : undefined;
}

async function getBooleanProperty(socketPath: string, name: string): Promise<boolean | undefined> {
  const response = await sendIpcCommand(socketPath, ['get_property', name]);
  return typeof response.data === 'boolean' ? response.data : undefined;
}

async function waitForIpc(socketPath: string, getStderr: () => string): Promise<void> {
  const deadline = Date.now() + 8000;

  while (Date.now() < deadline) {
    try {
      await sendIpcCommand(socketPath, ['get_property', 'pause']);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  if (getStderr().trim().length > 0) {
    throw new UserFacingError(`Could not connect to mpv control socket.${summarizeMpvStartupFailure(getStderr())}`);
  }
}

function createExitPromise(player: ChildProcess, socketPath: string, getStderr: () => string): Promise<void> {
  return new Promise((resolve, reject) => {
    player.once('error', (error) => reject(new UserFacingError(`Could not start mpv. Run npm install again to download bundled mpv, or install mpv on PATH. ${error.message}`)));
    player.once('exit', (code, signal) => {
      cleanupIpcSocket(socketPath);

      if (code === 0 || signal === 'SIGTERM') {
        resolve();
        return;
      }

      reject(formatPlaybackFailure(code, signal, getStderr()));
    });
  });
}

function cleanupIpcSocket(socketPath: string): void {
  if (process.platform !== 'win32' && existsSync(socketPath)) {
    rmSync(socketPath, { force: true });
  }
}

export function formatPlaybackFailure(code: number | null, signal: NodeJS.Signals | null, stderr: string): UserFacingError {
  const detail = summarizeMpvFailure(stderr);

  if (signal) {
    return new UserFacingError(`Playback stopped by signal ${signal}.${detail}`);
  }

  return new UserFacingError(`Playback failed with exit code ${code ?? 'unknown'}.${detail}`);
}

function summarizeMpvFailure(stderr: string): string {
  const usefulLine = findUsefulMpvLine(stderr);
  return usefulLine ? ` ${usefulLine}` : '';
}

function summarizeMpvStartupFailure(stderr: string): string {
  const usefulLine = findUsefulMpvLine(stderr);
  return usefulLine ? ` mpv: ${usefulLine}` : '';
}

function findUsefulMpvLine(stderr: string): string | undefined {
  const lines = stderr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.find((line) => line.includes('HTTP error') || line.includes('Failed to open') || line.includes('youtube-dl failed')) ?? lines.at(-1);
}

async function sendIpcCommand(socketPath: string, command: unknown[]): Promise<MpvResponse> {
  return new Promise<MpvResponse>((resolve, reject) => {
    const client = connect(socketPath);
    const timeout = setTimeout(() => {
      client.destroy();
      reject(new Error('mpv IPC command timed out'));
    }, 1000);
    let response = '';
    let settled = false;

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      callback();
    };

    client.once('error', (error) => settle(() => reject(error)));
    client.on('data', (chunk: Buffer) => {
      response += chunk.toString('utf8');
      const lines = response.split('\n').filter((part) => part.trim().length > 0);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as MpvResponse;

          if (!('error' in parsed)) {
            continue;
          }

          client.end();
          if (parsed.error && parsed.error !== 'success') {
            settle(() => reject(new Error(parsed.error)));
            return;
          }

          settle(() => resolve(parsed));
          return;
        } catch (error) {
          client.end();
          settle(() => reject(error));
          return;
        }
      }
    });

    client.write(formatIpcCommand(command));
  });
}
