import type { Command } from 'commander';
import { playAudioWithDirectFallback } from '../services/audio-player.js';
import { playMediaQueue } from '../services/media-queue-player.js';
import { extractMedia } from '../services/media-extractor.js';
import { parseMediaInput } from '../services/media-input.js';
import type { MediaInfo, MediaInput } from '../types/media.js';
import { formatCliError, UserFacingError } from '../ui/errors.js';
import { renderNowPlaying } from '../ui/now-playing.js';
import { markTiming } from '../ui/timing.js';

export function registerPlayCommand(program: Command): void {
  program
    .command('play')
    .description('Play audio from a TikTok or YouTube URL.')
    .argument('<url>', 'TikTok or YouTube video, playlist, profile, or livestream URL')
    .action(async (url: string) => {
      try {
        markTiming('play command started');
        const mediaInput = parseMediaInput(url);
        markTiming(`${mediaInput.platform} URL parsed as ${mediaInput.kind}`);

        if (mediaInput.platform === 'tiktok' && mediaInput.kind === 'video') {
          await playTikTokVideoFast(mediaInput);
          return;
        }

        markTiming(`extracting ${mediaInput.platform} queue`);
        const mediaItems = await extractMedia(mediaInput);
        markTiming(`extracted ${mediaItems.length} media item(s)`);
        await playMediaQueue(mediaItems);
      } catch (error) {
        console.error(formatCliError(error));
        process.exitCode = error instanceof UserFacingError ? error.exitCode : 1;
      }
    });
}

export async function playTikTokVideoFast(input: MediaInput): Promise<void> {
  markTiming('using TikTok video direct stream path');

  try {
    markTiming('extracting direct TikTok stream');
    const [media] = await extractMedia(input);
    markTiming('direct TikTok stream extracted');
    console.log(renderNowPlaying(media));
    markTiming('starting player');
    await playAudioWithDirectFallback(media);
  } catch (error) {
    if (!(error instanceof UserFacingError)) {
      throw error;
    }

    console.error(`Could not prepare direct TikTok stream. Falling back to yt-dlp resolver... ${error.message}`);
    const media = createFastTikTokVideoMedia(input);
    console.log(renderNowPlaying(media));
    markTiming('starting fallback player');
    await playAudioWithDirectFallback(media);
  }
}

export function createFastTikTokVideoMedia(input: MediaInput): MediaInfo {
  return {
    title: 'TikTok video',
    streamUrl: input.url,
    webpageUrl: input.url,
  };
}

export { classifyTikTokPath, classifyYouTubeUrl, parseMediaInput } from '../services/media-input.js';
export const parseMediaUrl = parseMediaInput;
