import { spawn } from 'node:child_process';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';

export async function playAudio(media: MediaInfo): Promise<void> {
  const mpvPath = await resolveBinaryPath('mpv');
  const ytDlpPath = await resolveBinaryPath('yt-dlp');

  await new Promise<void>((resolve, reject) => {
    const player = spawn(mpvPath, buildMpvArgs(media, ytDlpPath), {
      stdio: 'inherit',
      shell: false,
    });

    player.once('error', (error) => {
      reject(new UserFacingError(`Could not start mpv. Run npm install again to download bundled mpv, or install mpv on PATH. ${error.message}`));
    });

    player.once('exit', (code, signal) => {
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
  return ['--no-video', '--really-quiet', `--script-opts=ytdl_hook-ytdl_path=${ytDlpPath}`, media.webpageUrl];
}
