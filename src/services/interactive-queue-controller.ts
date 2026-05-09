import type { MediaInfo } from '../types/media.js';
import type { PlaybackProgress, PlayerSession } from './player-session.js';

export type PlayerSessionFactory = (media: MediaInfo) => Promise<PlayerSession>;

export type RepeatMode = 'off' | 'track' | 'queue';

export type PlaybackModeState = {
  repeatMode: RepeatMode;
  shuffle: boolean;
};

export type QueueState = {
  media: MediaInfo;
  queueIndex: number;
  queueLength: number;
  progress: PlaybackProgress;
  playbackMode: PlaybackModeState;
  errorMessage?: string;
};

const previousRestartThresholdSeconds = 5;

export class InteractiveQueueController {
  private currentIndex = 0;
  private playbackOrder: number[];
  private currentOrderIndex = 0;
  private repeatMode: RepeatMode = 'off';
  private shuffle = false;
  private currentSession: PlayerSession | undefined;
  private stoppingForSwitch = false;
  private errorMessage: string | undefined;

  constructor(
    private readonly queue: MediaInfo[],
    private readonly createSession: PlayerSessionFactory,
    private readonly random = Math.random,
  ) {
    this.playbackOrder = createSequentialOrder(queue.length);
  }

  async start(index = 0): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    this.currentIndex = clampIndex(index, this.queue.length);
    this.currentOrderIndex = this.playbackOrder.indexOf(this.currentIndex);
    this.errorMessage = undefined;
    await this.startCurrentSession();
  }

  async next(): Promise<void> {
    const nextIndex = this.getNextIndex();

    if (nextIndex === undefined) {
      return;
    }

    await this.switchTo(nextIndex);
  }

  async previous(): Promise<void> {
    const elapsedSeconds = (await this.currentSession?.getProgress().catch(() => undefined))?.elapsedSeconds ?? 0;

    const previousIndex = this.getPreviousIndex();

    if (elapsedSeconds > previousRestartThresholdSeconds || previousIndex === undefined) {
      await this.switchTo(this.currentIndex);
      return;
    }

    await this.switchTo(previousIndex);
  }

  async togglePause(): Promise<void> {
    await this.currentSession?.togglePause();
  }

  toggleRepeatTrack(): void {
    this.repeatMode = this.repeatMode === 'track' ? 'off' : 'track';
  }

  toggleRepeatQueue(): void {
    this.repeatMode = this.repeatMode === 'queue' ? 'off' : 'queue';
  }

  toggleShuffle(): void {
    this.shuffle = !this.shuffle;
    this.playbackOrder = this.shuffle ? createShuffledOrder(this.queue.length, this.currentIndex, this.random) : createSequentialOrder(this.queue.length);
    this.currentOrderIndex = this.playbackOrder.indexOf(this.currentIndex);
  }

  async stop(): Promise<void> {
    this.stoppingForSwitch = true;
    await this.currentSession?.stop();
    this.currentSession = undefined;
    this.stoppingForSwitch = false;
  }

  async getState(): Promise<QueueState | undefined> {
    const media = this.queue[this.currentIndex];

    if (!media || !this.currentSession) {
      return undefined;
    }

    const progress = await this.currentSession.getProgress().catch(() => ({ paused: false }));

    return {
      media,
      queueIndex: this.currentIndex,
      queueLength: this.queue.length,
      progress,
      playbackMode: {
        repeatMode: this.repeatMode,
        shuffle: this.shuffle,
      },
      errorMessage: this.errorMessage,
    };
  }

  private async switchTo(index: number): Promise<void> {
    this.stoppingForSwitch = true;
    await this.currentSession?.stop();
    this.currentIndex = clampIndex(index, this.queue.length);
    this.currentOrderIndex = this.playbackOrder.indexOf(this.currentIndex);
    this.stoppingForSwitch = false;
    await this.startCurrentSession();
  }

  private async startCurrentSession(): Promise<void> {
    const media = this.queue[this.currentIndex];

    if (!media) {
      return;
    }

    this.errorMessage = undefined;
    this.currentSession = await this.createSession(media);
    this.currentSession.waitForExit().then(() => this.handleSessionExit()).catch((error: unknown) => this.handleSessionError(error));
  }

  private async handleSessionExit(): Promise<void> {
    if (this.stoppingForSwitch) {
      return;
    }

    if (this.repeatMode === 'track') {
      await this.startCurrentSession();
      return;
    }

    const nextIndex = this.getNextIndex();

    if (nextIndex !== undefined) {
      this.currentIndex = nextIndex;
      this.currentOrderIndex = this.playbackOrder.indexOf(this.currentIndex);
      await this.startCurrentSession();
      return;
    }

    this.currentSession = undefined;
  }

  private getNextIndex(): number | undefined {
    if (this.currentOrderIndex < this.playbackOrder.length - 1) {
      return this.playbackOrder[this.currentOrderIndex + 1];
    }

    return this.repeatMode === 'queue' ? this.playbackOrder[0] : undefined;
  }

  private getPreviousIndex(): number | undefined {
    if (this.currentOrderIndex > 0) {
      return this.playbackOrder[this.currentOrderIndex - 1];
    }

    return this.repeatMode === 'queue' ? this.playbackOrder.at(-1) : undefined;
  }

  private handleSessionError(error: unknown): void {
    if (this.stoppingForSwitch) {
      return;
    }

    this.errorMessage = error instanceof Error ? error.message : String(error);
  }
}

function createSequentialOrder(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

function createShuffledOrder(length: number, currentIndex: number, random: () => number): number[] {
  const remaining = createSequentialOrder(length).filter((index) => index !== currentIndex);

  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [remaining[index], remaining[swapIndex]] = [remaining[swapIndex], remaining[index]];
  }

  return [currentIndex, ...remaining];
}

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}
