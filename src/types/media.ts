export type MediaPlatform = 'tiktok' | 'youtube';

export type MediaInputKind = 'video' | 'profile' | 'playlist' | 'livestream';

export type MediaInput = {
  url: string;
  platform: MediaPlatform;
  kind: MediaInputKind;
};

export type MediaInfo = {
  title: string;
  uploader?: string;
  durationSeconds?: number;
  streamUrl: string;
  webpageUrl: string;
  httpHeaders?: Record<string, string>;
};
