import { create } from 'youtube-dl-exec';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo, MediaInput, MediaPlatform } from '../types/media.js';
import { UserFacingError, toUserFacingError } from '../ui/errors.js';
import { parseMediaInput } from './media-input.js';

export type ExtractedMedia = {
  title?: unknown;
  uploader?: unknown;
  channel?: unknown;
  duration?: unknown;
  url?: unknown;
  webpage_url?: unknown;
  original_url?: unknown;
  http_headers?: unknown;
  entries?: unknown;
};

export async function extractMedia(input: MediaInput): Promise<MediaInfo[]> {
  try {
    const ytDlp = create(await resolveBinaryPath('yt-dlp'));
    const result = await ytDlp(input.url, {
      dumpSingleJson: true,
      format: 'bestaudio/best',
      noPlaylist: input.kind === 'video' || input.kind === 'livestream' ? true : undefined,
      noWarnings: true,
    });

    return normalizeMediaResult(result as ExtractedMedia, input);
  } catch (error) {
    throw mapExtractorError(error, input.platform);
  }
}

export async function extractMediaInfo(url: string): Promise<MediaInfo> {
  const [media] = await extractMedia(parseMediaInput(url));
  return media;
}

export function normalizeMediaResult(raw: ExtractedMedia, input: MediaInput): MediaInfo[] {
  if (Array.isArray(raw.entries)) {
    const mediaItems = raw.entries
      .map((entry) => normalizeOptionalMediaInfo(entry as ExtractedMedia, input.url, input.platform))
      .filter((media): media is MediaInfo => media !== undefined);

    if (mediaItems.length === 0) {
      throw new UserFacingError(`No playable ${platformLabel(input.platform)} videos found.`);
    }

    return mediaItems;
  }

  return [normalizeMediaInfo(raw, input.url, input.platform)];
}

export function normalizeMediaInfo(raw: ExtractedMedia, fallbackUrl: string, platform: MediaPlatform = 'tiktok'): MediaInfo {
  const streamUrl = stringValue(raw.url);

  if (!streamUrl) {
    throw new UserFacingError('Could not find a playable audio stream.');
  }

  return {
    title: stringValue(raw.title) ?? `Untitled ${platformLabel(platform)} media`,
    uploader: stringValue(raw.uploader) ?? stringValue(raw.channel),
    durationSeconds: numberValue(raw.duration),
    streamUrl,
    webpageUrl: stringValue(raw.webpage_url) ?? stringValue(raw.original_url) ?? fallbackUrl,
    httpHeaders: recordStringValues(raw.http_headers),
  };
}

function normalizeOptionalMediaInfo(raw: ExtractedMedia, fallbackUrl: string, platform: MediaPlatform): MediaInfo | undefined {
  try {
    return normalizeMediaInfo(raw, fallbackUrl, platform);
  } catch (error) {
    if (error instanceof UserFacingError) {
      return undefined;
    }

    throw error;
  }
}

export function mapExtractorError(error: unknown, platform: MediaPlatform = 'tiktok'): UserFacingError {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('unsupported version of Python') || message.includes('Python versions 3.10 and above')) {
    return new UserFacingError(
      'yt-dlp requires Python 3.10+ or the native yt-dlp binary. Run npm install again to download the native binary.',
    );
  }

  return toUserFacingError(error, `Could not extract ${platformLabel(platform)} audio stream`);
}

function platformLabel(platform: MediaPlatform): string {
  return platform === 'youtube' ? 'YouTube' : 'TikTok';
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function recordStringValues(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}
