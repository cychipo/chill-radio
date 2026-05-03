import { spawn } from 'node:child_process';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';

export async function playAudio(media: MediaInfo): Promise<void> {
  const mpvPath = await resolveBinaryPath('mpv');

  await new Promise<void>((resolve, reject) => {
    const player = spawn(mpvPath, ['--no-video', '--really-quiet', media.streamUrl], {
      stdio: 'inherit',
      shell: false,
    });

    player.once('error', (error) => {
      reject(new UserFacingError(`Could not start mpv. Install mpv or run postinstall again. ${error.message}`));
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
