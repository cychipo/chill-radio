import { spawn } from 'node:child_process';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';
import { isTimingEnabled, markTiming } from '../ui/timing.js';

export async function playAudio(media: MediaInfo): Promise<void> {
  markTiming('resolving player binaries');
  const mpvPath = await resolveBinaryPath('mpv');
  const ytDlpPath = await resolveBinaryPath('yt-dlp');
  markTiming('player binaries resolved');

  await new Promise<void>((resolve, reject) => {
    const player = spawn(mpvPath, buildMpvArgs(media, ytDlpPath), {
      stdio: 'inherit',
      shell: false,
    });
    markTiming('mpv process spawned');

    player.once('error', (error) => {
      markTiming(`mpv process error: ${error.message}`);
      reject(new UserFacingError(`Could not start mpv. Run npm install again to download bundled mpv, or install mpv on PATH. ${error.message}`));
    });

    player.once('exit', (code, signal) => {
      markTiming(`mpv process exited with code ${code ?? 'unknown'}${signal ? ` and signal ${signal}` : ''}`);

      if (code === 0) {
        resolve();
        return;
      }

      if (signal) {
        reject(new UserFacingError(`Playback stopped by signal ${signal}.`));
        return;
      }

      reject(new UserFacingError(`Playback failed with exit code ${code ?? 'unknown'}.`));
    });
  });
}

export function buildMpvArgs(media: MediaInfo, ytDlpPath: string): string[] {
  return [
    '--no-video',
    ...(isTimingEnabled() ? [] : ['--really-quiet']),
    `--script-opts=ytdl_hook-ytdl_path=${ytDlpPath}`,
    media.webpageUrl,
  ];
}
