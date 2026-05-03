export type MediaInfo = {
  title: string;
  uploader?: string;
  durationSeconds?: number;
  streamUrl: string;
  webpageUrl: string;
  httpHeaders?: Record<string, string>;
};
