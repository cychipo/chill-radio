import type { Command } from 'commander';
import { playMediaQueue } from '../services/media-queue-player.js';
import { extractTikTokMedia } from '../services/media-extractor.js';
import type { TikTokInput, TikTokInputKind } from '../types/tiktok.js';
import { formatCliError, UserFacingError } from '../ui/errors.js';

const allowedTikTokHosts = new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']);

export function registerPlayCommand(program: Command): void {
  program
    .command('play')
    .description('Play audio from a TikTok URL.')
    .argument('<url>', 'TikTok video, profile, or playlist URL')
    .action(async (url: string) => {
      try {
        const tiktokInput = parseTikTokInput(url);
        const mediaItems = await extractTikTokMedia(tiktokInput);
        await playMediaQueue(mediaItems);
      } catch (error) {
        console.error(formatCliError(error));
        process.exitCode = error instanceof UserFacingError ? error.exitCode : 1;
      }
    });
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
