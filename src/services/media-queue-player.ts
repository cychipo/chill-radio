import type { MediaInfo } from '../types/media.js';
import { UserFacingError } from '../ui/errors.js';
import { renderNowPlaying } from '../ui/now-playing.js';
import { playAudio } from './audio-player.js';

type QueuePlayerOptions = {
  play?: (media: MediaInfo) => Promise<void>;
  render?: (media: MediaInfo) => string;
  write?: (message: string) => void;
};

export async function playMediaQueue(items: MediaInfo[], options: QueuePlayerOptions = {}): Promise<void> {
  if (items.length === 0) {
    throw new UserFacingError('No playable TikTok videos found.');
  }

  const play = options.play ?? playAudio;
  const render = options.render ?? renderNowPlaying;
  const write = options.write ?? console.log;

  for (const item of items) {
    write(render(item));
    await play(item);
  }
}
