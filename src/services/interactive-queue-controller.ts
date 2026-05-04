import type { MediaInfo } from '../types/media.js';
import type { PlaybackProgress, PlayerSession } from './player-session.js';

export type PlayerSessionFactory = (media: MediaInfo) => Promise<PlayerSession>;

export type QueueState = {
  media: MediaInfo;
  queueIndex: number;
  queueLength: number;
  progress: PlaybackProgress;
  errorMessage?: string;
};

const previousRestartThresholdSeconds = 5;

export class InteractiveQueueController {
  private currentIndex = 0;
  private currentSession: PlayerSession | undefined;
  private stoppingForSwitch = false;
  private errorMessage: string | undefined;

  constructor(
    private readonly queue: MediaInfo[],
    private readonly createSession: PlayerSessionFactory,
  ) {}

  async start(index = 0): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    this.currentIndex = clampIndex(index, this.queue.length);
    this.errorMessage = undefined;
    await this.startCurrentSession();
  }

  async next(): Promise<void> {
    if (this.currentIndex >= this.queue.length - 1) {
      return;
    }

    await this.switchTo(this.currentIndex + 1);
  }

  async previous(): Promise<void> {
    const elapsedSeconds = (await this.currentSession?.getProgress().catch(() => undefined))?.elapsedSeconds ?? 0;

    if (elapsedSeconds > previousRestartThresholdSeconds || this.currentIndex === 0) {
      await this.switchTo(this.currentIndex);
      return;
    }

    await this.switchTo(this.currentIndex - 1);
  }

  async togglePause(): Promise<void> {
    await this.currentSession?.togglePause();
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
      errorMessage: this.errorMessage,
    };
  }

  private async switchTo(index: number): Promise<void> {
    this.stoppingForSwitch = true;
    await this.currentSession?.stop();
    this.currentIndex = clampIndex(index, this.queue.length);
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

    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex += 1;
      await this.startCurrentSession();
      return;
    }

    this.currentSession = undefined;
  }

  private handleSessionError(error: unknown): void {
    if (this.stoppingForSwitch) {
      return;
    }

    this.errorMessage = error instanceof Error ? error.message : String(error);
  }
}

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}
