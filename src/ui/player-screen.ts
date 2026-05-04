import chalk from 'chalk';
import type { MediaInfo } from '../types/media.js';
import { formatDuration, formatRemaining } from './time-format.js';

export type PlayerScreenState = {
  media: MediaInfo;
  queueIndex: number;
  queueLength: number;
  elapsedSeconds?: number;
  durationSeconds?: number;
  paused: boolean;
  status?: string;
  errorMessage?: string;
};

export type LoadingScreenState = {
  label: string;
  elapsedSeconds: number;
  frame: number;
};

const screenWidth = 62;
const innerWidth = screenWidth - 4;
const unsafeTerminalPattern = /[][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

export function renderProgressBar(elapsedSeconds: number | undefined, durationSeconds: number | undefined, width = 30): string {
  if (!elapsedSeconds || !durationSeconds || durationSeconds <= 0) {
    return `${'░'.repeat(width)}`;
  }

  const ratio = Math.min(Math.max(elapsedSeconds / durationSeconds, 0), 1);
  const filled = Math.round(ratio * width);
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
}

export function renderLoadingBar(frame: number, width = 34): string {
  const segmentWidth = Math.min(8, width);
  const travel = width - segmentWidth;
  const position = travel > 0 ? frame % (travel + 1) : 0;
  return `${'░'.repeat(position)}${'█'.repeat(segmentWidth)}${'░'.repeat(width - position - segmentWidth)}`;
}

export function renderLoadingScreen(state: LoadingScreenState): string {
  const spinner = ['◐', '◓', '◑', '◒'][state.frame % 4];

  return [
    renderHeader(),
    renderBox('Loading Media', [
      `${chalk.cyan(spinner)} ${state.label}`,
      `${chalk.cyan(renderLoadingBar(state.frame, 34))}`,
      `${formatDuration(state.elapsedSeconds)} elapsed`,
    ]),
    renderBox('Please Wait', [
      'TikTok/yt-dlp can take a while to resolve media.',
      'The app is still working; playback will start after extraction.',
    ]),
  ].join('\n');
}

export function renderPlayerScreen(state: PlayerScreenState): string {
  const title = sanitizeTerminalText(state.media.title);
  const uploader = sanitizeTerminalText(state.media.uploader ?? 'Unknown creator');
  const duration = state.durationSeconds ?? state.media.durationSeconds;
  const elapsed = state.elapsedSeconds;
  const status = state.status ?? (state.paused ? 'Paused' : 'Playing');

  return [
    renderHeader(),
    renderBox('Now Playing', [
      `Title  ${chalk.white.bold(truncateText(title, 48))}`,
      `Artist ${chalk.gray(truncateText(uploader, 48))}`,
      `Queue  ${state.queueIndex + 1}/${state.queueLength}    Status ${state.paused ? chalk.yellow(status) : chalk.green(status)}`,
    ]),
    renderBox('Progress', [
      `${chalk.cyan(renderProgressBar(elapsed, duration, 34))}`,
      `${formatDuration(elapsed)} elapsed   ${formatRemaining(elapsed, duration)} left   ${formatDuration(duration)} total`,
    ]),
    ...(state.errorMessage
      ? [renderBox('Playback Error', [chalk.red(truncateText(sanitizeTerminalText(state.errorMessage), innerWidth))])]
      : []),
    renderBox('Controls', [
      `${keyLabel('Space')} pause/resume   ${keyLabel('N/→')} next`,
      `${keyLabel('P/←')} previous         ${keyLabel('Q')} quit`,
    ]),
  ].join('\n');
}

export function renderStartScreen(message?: string): string {
  return [
    renderHeader(),
    renderBox('Tune In', [
      'Paste a TikTok video, profile, or playlist URL.',
      'Press Enter to load the station.',
      '',
      `${chalk.gray('Supported')} TikTok only for this MVP`,
    ]),
    message ? renderBox('Status', [message]) : renderBox('Controls', [`${keyLabel('Ctrl+C')} quit`]),
  ].join('\n');
}

export function sanitizeTerminalText(value: string): string {
  return value.replace(unsafeTerminalPattern, '').replace(/[\r\n\t]/g, ' ').trim();
}

function renderHeader(): string {
  return [
    chalk.cyan('╭────────────────────────────────────────────────────────────╮'),
    chalk.cyan('│') + centerText(`${chalk.bold('chill-radio')}  ${chalk.gray('TikTok terminal player')}`, innerWidth) + chalk.cyan('│'),
    chalk.cyan('╰────────────────────────────────────────────────────────────╯'),
  ].join('\n');
}

function renderBox(title: string, lines: string[]): string {
  const top = `${chalk.cyan('╭')} ${chalk.cyan.bold(title)} ${chalk.cyan('─'.repeat(Math.max(screenWidth - visibleLength(title) - 5, 0)))}${chalk.cyan('╮')}`;
  const body = lines.map((line) => `${chalk.cyan('│')} ${padVisible(fitVisible(line, innerWidth), innerWidth)} ${chalk.cyan('│')}`);
  const bottom = `${chalk.cyan('╰')}${chalk.cyan('─'.repeat(screenWidth - 2))}${chalk.cyan('╯')}`;
  return [top, ...body, bottom].join('\n');
}

function keyLabel(value: string): string {
  return chalk.bgCyan.black(` ${value} `);
}

function centerText(value: string, width: number): string {
  const padding = Math.max(width - visibleLength(value), 0);
  const left = Math.floor(padding / 2);
  return `${' '.repeat(left)}${value}${' '.repeat(padding - left)}`;
}

function padVisible(value: string, width: number): string {
  const padding = Math.max(width - visibleLength(value), 0);
  return `${value}${' '.repeat(padding)}`;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(maxLength - 1, 0))}…`;
}

function fitVisible(value: string, maxLength: number): string {
  return visibleLength(value) <= maxLength ? value : truncateText(value, maxLength);
}

function visibleLength(value: string): number {
  return value.replace(unsafeTerminalPattern, '').length;
}
