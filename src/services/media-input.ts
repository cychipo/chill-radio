import type { MediaInput, MediaInputKind } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';

const tiktokHosts = new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']);
const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be']);

export function parseMediaInput(value: string): MediaInput {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new UserFacingError('URL must start with http:// or https://.');
    }

    const hostname = url.hostname.toLowerCase();

    if (tiktokHosts.has(hostname)) {
      return {
        url: url.toString(),
        platform: 'tiktok',
        kind: classifyTikTokPath(url.pathname),
      };
    }

    if (youtubeHosts.has(hostname)) {
      return {
        url: url.toString(),
        platform: 'youtube',
        kind: classifyYouTubeUrl(url),
      };
    }

    throw new UserFacingError('Supported platforms: TikTok and YouTube.');
  } catch (error) {
    if (error instanceof UserFacingError) {
      throw error;
    }

    throw new UserFacingError('Please provide a valid media URL.');
  }
}

export function classifyTikTokPath(pathname: string): MediaInputKind {
  const normalizedPath = pathname.toLowerCase();

  if (normalizedPath.includes('/playlist/') || normalizedPath.includes('/collection/')) {
    return 'playlist';
  }

  if (normalizedPath.includes('/video/')) {
    return 'video';
  }

  return 'profile';
}

export function classifyYouTubeUrl(url: URL): MediaInputKind {
  const pathname = url.pathname.toLowerCase();

  if (url.hostname.toLowerCase() === 'youtu.be') {
    return 'video';
  }

  if (pathname === '/playlist' && url.searchParams.has('list')) {
    return 'playlist';
  }

  if (pathname === '/watch' && url.searchParams.has('list')) {
    return 'playlist';
  }

  if (pathname.startsWith('/live/')) {
    return 'livestream';
  }

  return 'video';
}
