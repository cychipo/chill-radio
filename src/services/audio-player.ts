import { spawn } from 'node:child_process';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';
import { isTimingEnabled, markTiming } from '../ui/timing.js';

const directHeaderNames = new Set(['accept', 'accept-language', 'cookie', 'range', 'referer', 'user-agent']);

export async function playAudio(media: MediaInfo): Promise<void> {
  const binaries = await resolvePlayerBinaries();
  await runMpv(binaries.mpvPath, buildMpvHookArgs(media, binaries.ytDlpPath), { inheritOutput: true });
}

export async function playAudioWithDirectFallback(media: MediaInfo): Promise<void> {
  const binaries = await resolvePlayerBinaries();
  const directResult = await runMpv(binaries.mpvPath, buildMpvDirectArgs(media), { inheritOutput: false });

  if (directResult.ok) {
    return;
  }

  console.error(formatDirectFallbackMessage(directResult));
  await runMpv(binaries.mpvPath, buildMpvHookArgs(media, binaries.ytDlpPath), { inheritOutput: true });
}

export function buildMpvHookArgs(media: MediaInfo, ytDlpPath: string): string[] {
  return [
    '--no-video',
    ...(isTimingEnabled() ? [] : ['--really-quiet']),
    `--script-opts=ytdl_hook-ytdl_path=${ytDlpPath}`,
    media.webpageUrl,
  ];
}

export function buildMpvDirectArgs(media: MediaInfo): string[] {
  return [
    '--no-video',
    ...(isTimingEnabled() ? [] : ['--really-quiet']),
    ...formatHttpHeaderArgs(media.httpHeaders),
    media.streamUrl,
  ];
}

export const buildMpvArgs = buildMpvHookArgs;

export function isForbiddenPlayback(stderr: string): boolean {
  return stderr.includes('403 Forbidden') || stderr.includes('HTTP error 403');
}

async function resolvePlayerBinaries(): Promise<{ mpvPath: string; ytDlpPath: string }> {
  markTiming('resolving player binaries');
  const mpvPath = await resolveBinaryPath('mpv');
  const ytDlpPath = await resolveBinaryPath('yt-dlp');
  markTiming('player binaries resolved');
  return { mpvPath, ytDlpPath };
}

type PlaybackResult =
  | { ok: true }
  | { ok: false; code: number | null; signal: NodeJS.Signals | null; output: string };

async function runMpv(mpvPath: string, args: string[], options: { inheritOutput: boolean }): Promise<PlaybackResult> {
  return new Promise<PlaybackResult>((resolve, reject) => {
    const player = spawn(mpvPath, args, {
      stdio: options.inheritOutput ? 'inherit' : ['inherit', 'pipe', 'pipe'],
      shell: false,
    });
    const outputChunks: Buffer[] = [];
    markTiming('mpv process spawned');

    player.stdout?.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk);
      if (isTimingEnabled()) {
        process.stdout.write(chunk);
      }
    });

    player.stderr?.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk);
      if (isTimingEnabled()) {
        process.stderr.write(chunk);
      }
    });

    player.once('error', (error) => {
      markTiming(`mpv process error: ${error.message}`);
      reject(new UserFacingError(`Could not start mpv. Run npm install again to download bundled mpv, or install mpv on PATH. ${error.message}`));
    });

    player.once('exit', (code, signal) => {
      markTiming(`mpv process exited with code ${code ?? 'unknown'}${signal ? ` and signal ${signal}` : ''}`);

      if (code === 0) {
        resolve({ ok: true });
        return;
      }

      if (options.inheritOutput) {
        if (signal) {
          reject(new UserFacingError(`Playback stopped by signal ${signal}.`));
          return;
        }

        reject(new UserFacingError(`Playback failed with exit code ${code ?? 'unknown'}.`));
        return;
      }

      resolve({
        ok: false,
        code,
        signal,
        output: Buffer.concat(outputChunks).toString('utf8'),
      });
    });
  });
}

function formatHttpHeaderArgs(headers: Record<string, string> | undefined): string[] {
  if (!headers) {
    return [];
  }

  return Object.entries(headers)
    .filter(([name, value]) => directHeaderNames.has(name.toLowerCase()) && value.trim().length > 0)
    .map(([name, value]) => `--http-header-fields-append=${name}: ${value}`);
}

function formatDirectFallbackMessage(result: Exclude<PlaybackResult, { ok: true }>): string {
  if (isForbiddenPlayback(result.output)) {
    return 'Direct TikTok stream was blocked by TikTok CDN (403). Falling back to yt-dlp resolver...';
  }

  if (result.signal) {
    return `Direct TikTok stream stopped by signal ${result.signal}. Falling back to yt-dlp resolver...`;
  }

  return `Direct TikTok stream failed with exit code ${result.code ?? 'unknown'}. Falling back to yt-dlp resolver...`;
}
