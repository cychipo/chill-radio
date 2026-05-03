import chalk from 'chalk';
import type { MediaInfo } from '../types/media.js';

export function renderNowPlaying(media: MediaInfo): string {
  const lines = [
    chalk.cyan('Now playing'),
    `${chalk.bold(media.title)}`,
  ];

  if (media.uploader) {
    lines.push(`${chalk.gray('By')} ${media.uploader}`);
  }

  if (media.durationSeconds !== undefined) {
    lines.push(`${chalk.gray('Duration')} ${formatDuration(media.durationSeconds)}`);
  }

  return lines.join('\n');
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
