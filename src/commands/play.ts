import type { Command } from 'commander';
import { playAudioWithDirectFallback } from '../services/audio-player.js';
import { playMediaQueue } from '../services/media-queue-player.js';
import { extractTikTokMedia } from '../services/media-extractor.js';
import type { MediaInfo } from '../types/media.js';
import type { TikTokInput, TikTokInputKind } from '../types/tiktok.js';
import { formatCliError, UserFacingError } from '../ui/errors.js';
import { renderNowPlaying } from '../ui/now-playing.js';
import { markTiming } from '../ui/timing.js';

const allowedTikTokHosts = new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']);

export function registerPlayCommand(program: Command): void {
  program
    .command('play')
    .description('Play audio from a TikTok URL.')
    .argument('<url>', 'TikTok video, profile, or playlist URL')
    .action(async (url: string) => {
      try {
        markTiming('play command started');
        const tiktokInput = parseTikTokInput(url);
        markTiming(`TikTok URL parsed as ${tiktokInput.kind}`);

        if (tiktokInput.kind === 'video') {
          await playTikTokVideoFast(tiktokInput);
          return;
        }

        markTiming('extracting TikTok queue');
        const mediaItems = await extractTikTokMedia(tiktokInput);
        markTiming(`extracted ${mediaItems.length} media item(s)`);
        await playMediaQueue(mediaItems);
      } catch (error) {
        console.error(formatCliError(error));
        process.exitCode = error instanceof UserFacingError ? error.exitCode : 1;
      }
    });
}

export async function playTikTokVideoFast(input: TikTokInput): Promise<void> {
  markTiming('using TikTok video direct stream path');

  try {
    markTiming('extracting direct TikTok stream');
    const [media] = await extractTikTokMedia(input);
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

export function createFastTikTokVideoMedia(input: TikTokInput): MediaInfo {
  return {
    title: 'TikTok video',
    streamUrl: input.url,
    webpageUrl: input.url,
  };
}

export function parseTikTokInput(value: string): TikTokInput {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new UserFacingError('URL must start with http:// or https://.');
    }

    if (!allowedTikTokHosts.has(url.hostname.toLowerCase())) {
      throw new UserFacingError('TikTok is currently the only supported platform.');
    }

    return {
      url: url.toString(),
      kind: classifyTikTokPath(url.pathname),
    };
  } catch (error) {
    if (error instanceof UserFacingError) {
      throw error;
    }

    throw new UserFacingError('Please provide a valid TikTok URL.');
  }
}

export function classifyTikTokPath(pathname: string): TikTokInputKind {
  const normalizedPath = pathname.toLowerCase();

  if (normalizedPath.includes('/playlist/') || normalizedPath.includes('/collection/')) {
    return 'playlist';
  }

  if (normalizedPath.includes('/video/')) {
    return 'video';
  }

  return 'profile';
}

export const parseMediaUrl = parseTikTokInput;
