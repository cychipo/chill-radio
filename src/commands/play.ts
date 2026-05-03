import type { Command } from 'commander';
import { playAudio } from '../services/audio-player.js';
import { extractMediaInfo } from '../services/media-extractor.js';
import { formatCliError, UserFacingError } from '../ui/errors.js';
import { renderNowPlaying } from '../ui/now-playing.js';

export function registerPlayCommand(program: Command): void {
  program
    .command('play')
    .description('Play audio from a media URL.')
    .argument('<url>', 'YouTube, SoundCloud, TikTok, or yt-dlp supported URL')
    .action(async (url: string) => {
      try {
        const parsedUrl = parseMediaUrl(url);
        const media = await extractMediaInfo(parsedUrl);
        console.log(renderNowPlaying(media));
        await playAudio(media);
      } catch (error) {
        console.error(formatCliError(error));
        process.exitCode = error instanceof UserFacingError ? error.exitCode : 1;
      }
    });
}

export function parseMediaUrl(value: string): string {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new UserFacingError('URL must start with http:// or https://.');
    }

    return url.toString();
  } catch (error) {
    if (error instanceof UserFacingError) {
      throw error;
    }

    throw new UserFacingError('Please provide a valid media URL.');
  }
}
