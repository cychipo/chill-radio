import { youtubeDl } from 'youtube-dl-exec';
import type { MediaInfo } from '../types/media.js';
import { UserFacingError, toUserFacingError } from '../ui/errors.js';

export type ExtractedMedia = {
  title?: unknown;
  uploader?: unknown;
  channel?: unknown;
  duration?: unknown;
  url?: unknown;
  webpage_url?: unknown;
  original_url?: unknown;
};

export async function extractMediaInfo(url: string): Promise<MediaInfo> {
  try {
    const result = await youtubeDl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      format: 'bestaudio/best',
      noWarnings: true,
    });

    return normalizeMediaInfo(result as ExtractedMedia, url);
  } catch (error) {
    throw toUserFacingError(error, 'Could not extract audio stream');
  }
}

export function normalizeMediaInfo(raw: ExtractedMedia, fallbackUrl: string): MediaInfo {
  const streamUrl = stringValue(raw.url);

  if (!streamUrl) {
    throw new UserFacingError('Could not find a playable audio stream.');
  }

  return {
    title: stringValue(raw.title) ?? 'Untitled media',
    uploader: stringValue(raw.uploader) ?? stringValue(raw.channel),
    durationSeconds: numberValue(raw.duration),
    streamUrl,
    webpageUrl: stringValue(raw.webpage_url) ?? stringValue(raw.original_url) ?? fallbackUrl,
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
