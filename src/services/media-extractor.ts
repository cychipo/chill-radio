import { create } from 'youtube-dl-exec';
import { resolveBinaryPath } from '../platform/binary-paths.js';
import type { MediaInfo } from '../types/media.js';
import type { TikTokInput } from '../types/tiktok.js';
import { UserFacingError, toUserFacingError } from '../ui/errors.js';

export type ExtractedMedia = {
  title?: unknown;
  uploader?: unknown;
  channel?: unknown;
  duration?: unknown;
  url?: unknown;
  webpage_url?: unknown;
  original_url?: unknown;
  entries?: unknown;
};

export async function extractTikTokMedia(input: TikTokInput): Promise<MediaInfo[]> {
  try {
    const ytDlp = create(await resolveBinaryPath('yt-dlp'));
    const result = await ytDlp(input.url, {
      dumpSingleJson: true,
      format: 'bestaudio/best',
      noPlaylist: input.kind === 'video' ? true : undefined,
      noWarnings: true,
    });

    return normalizeTikTokResult(result as ExtractedMedia, input);
  } catch (error) {
    throw mapExtractorError(error);
  }
}

export async function extractMediaInfo(url: string): Promise<MediaInfo> {
  const [media] = await extractTikTokMedia({ url, kind: 'video' });
  return media;
}

export function normalizeTikTokResult(raw: ExtractedMedia, input: TikTokInput): MediaInfo[] {
  if (Array.isArray(raw.entries)) {
    const mediaItems = raw.entries
      .map((entry) => normalizeOptionalMediaInfo(entry as ExtractedMedia, input.url))
      .filter((media): media is MediaInfo => media !== undefined);

    if (mediaItems.length === 0) {
      throw new UserFacingError('No playable TikTok videos found.');
    }

    return mediaItems;
  }

  return [normalizeMediaInfo(raw, input.url)];
}

export function normalizeMediaInfo(raw: ExtractedMedia, fallbackUrl: string): MediaInfo {
  const streamUrl = stringValue(raw.url);

  if (!streamUrl) {
    throw new UserFacingError('Could not find a playable audio stream.');
  }

  return {
    title: stringValue(raw.title) ?? 'Untitled TikTok video',
    uploader: stringValue(raw.uploader) ?? stringValue(raw.channel),
    durationSeconds: numberValue(raw.duration),
    streamUrl,
    webpageUrl: stringValue(raw.webpage_url) ?? stringValue(raw.original_url) ?? fallbackUrl,
  };
}

function normalizeOptionalMediaInfo(raw: ExtractedMedia, fallbackUrl: string): MediaInfo | undefined {
  try {
    return normalizeMediaInfo(raw, fallbackUrl);
  } catch (error) {
    if (error instanceof UserFacingError) {
      return undefined;
    }

    throw error;
  }
}

export function mapExtractorError(error: unknown): UserFacingError {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('unsupported version of Python') || message.includes('Python versions 3.10 and above')) {
    return new UserFacingError(
      'yt-dlp requires Python 3.10+ or the native yt-dlp binary. Run npm install again to download the native binary.',
    );
  }

  return toUserFacingError(error, 'Could not extract TikTok audio stream');
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
