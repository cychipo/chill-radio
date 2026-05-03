export type TikTokInputKind = 'video' | 'profile' | 'playlist';

export type TikTokInput = {
  url: string;
  kind: TikTokInputKind;
};
