import chalk from 'chalk';
import type { MediaInfo } from '../types/media.js';
import type { PlaybackModeState } from '../services/interactive-queue-controller.js';
import { formatDuration, formatRemaining } from './time-format.js';

export type PlayerScreenState = {
  media: MediaInfo;
  queueIndex: number;
  queueLength: number;
  elapsedSeconds?: number;
  durationSeconds?: number;
  paused: boolean;
  playbackMode?: PlaybackModeState;
  status?: string;
  errorMessage?: string;
};

export type LoadingScreenState = {
  label: string;
  elapsedSeconds: number;
  frame: number;
};

const minimumScreenWidth = 62;
const terminalPadding = 2;
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
      'yt-dlp can take a while to resolve media.',
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
      `Title  ${chalk.white.bold(title)}`,
      `Artist ${chalk.gray(uploader)}`,
      `Queue  ${state.queueIndex + 1}/${state.queueLength}    Status ${state.paused ? chalk.yellow(status) : chalk.green(status)}`,
      `Mode   ${formatPlaybackMode(state.playbackMode)}`,
    ]),
    renderBox('Progress', [
      `${chalk.cyan(renderProgressBar(elapsed, duration, 34))}`,
      `${formatDuration(elapsed)} elapsed   ${formatRemaining(elapsed, duration)} left   ${formatDuration(duration)} total`,
    ]),
    ...(state.errorMessage
      ? [renderBox('Playback Error', [chalk.red(sanitizeTerminalText(state.errorMessage))])]
      : []),
    renderBox('Controls', [
      `${keyLabel('Space')} pause/resume   ${keyLabel('N/→')} next`,
      `${keyLabel('P/←')} previous         ${keyLabel('Q')} quit`,
      `${keyLabel('R')} repeat track       ${keyLabel('L')} repeat queue   ${keyLabel('S')} shuffle`,
    ]),
  ].join('\n');
}

export function renderStartScreen(message?: string): string {
  return [
    renderHeader(),
    renderBox('Tune In', [
      'Paste a TikTok or YouTube media URL.',
      'Press Enter to load the station.',
      '',
      `${chalk.gray('Supported')} TikTok videos/profiles/playlists and YouTube videos/playlists/livestreams`,
    ]),
    message ? renderBox('Status', [message]) : renderBox('Controls', [`${keyLabel('Ctrl+C')} quit`]),
  ].join('\n');
}

export function sanitizeTerminalText(value: string): string {
  return value.replace(unsafeTerminalPattern, '').replace(/[\r\n\t]/g, ' ').trim();
}

function renderHeader(): string {
  const screenWidth = getScreenWidth();
  const innerWidth = getInnerWidth(screenWidth);

  return [
    chalk.cyan(`╭${'─'.repeat(screenWidth - 2)}╮`),
    chalk.cyan('│') + centerText(`${chalk.bold('chill-radio')}  ${chalk.gray('terminal media player')}`, innerWidth) + chalk.cyan('│'),
    chalk.cyan(`╰${'─'.repeat(screenWidth - 2)}╯`),
  ].join('\n');
}

function renderBox(title: string, lines: string[]): string {
  const screenWidth = getScreenWidth();
  const innerWidth = getInnerWidth(screenWidth);
  const top = `${chalk.cyan('╭')} ${chalk.cyan.bold(title)} ${chalk.cyan('─'.repeat(Math.max(screenWidth - visibleLength(title) - 5, 0)))}${chalk.cyan('╮')}`;
  const body = lines
    .flatMap((line) => wrapVisibleLine(line, innerWidth))
    .map((line) => `${chalk.cyan('│')} ${padVisible(line, innerWidth)} ${chalk.cyan('│')}`);
  const bottom = `${chalk.cyan('╰')}${chalk.cyan('─'.repeat(screenWidth - 2))}${chalk.cyan('╯')}`;
  return [top, ...body, bottom].join('\n');
}

function formatPlaybackMode(mode: PlaybackModeState | undefined): string {
  if (!mode) {
    return 'Normal';
  }

  const repeat = mode.repeatMode === 'track' ? 'Repeat track' : mode.repeatMode === 'queue' ? 'Repeat queue' : 'Repeat off';
  return `${repeat}${mode.shuffle ? ' + Shuffle' : ''}`;
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

function wrapVisibleLine(value: string, width: number): string[] {
  if (visibleLength(value) <= width) {
    return [value];
  }

  const words = value.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (visibleLength(next) <= width) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    lines.push(word);
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function getScreenWidth(): number {
  return Math.max(minimumScreenWidth, (process.stdout.columns ?? minimumScreenWidth) - terminalPadding);
}

function getInnerWidth(screenWidth = getScreenWidth()): number {
  return screenWidth - 4;
}

function visibleLength(value: string): number {
  return value.replace(unsafeTerminalPattern, '').length;
}
