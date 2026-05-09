import { describe, expect, it } from 'vitest';
import {
  renderLoadingBar,
  renderLoadingScreen,
  renderPlayerScreen,
  renderProgressBar,
  renderStartScreen,
  sanitizeTerminalText,
} from '../src/ui/player-screen.js';

describe('renderProgressBar', () => {
  it('renders filled progress and unknown duration', () => {
    expect(renderProgressBar(50, 100, 10)).toBe('█████░░░░░');
    expect(renderProgressBar(undefined, undefined, 5)).toBe('░░░░░');
  });
});

describe('renderLoadingBar', () => {
  it('renders a moving indeterminate segment', () => {
    expect(renderLoadingBar(0, 10)).toBe('████████░░');
    expect(renderLoadingBar(1, 10)).toBe('░████████░');
  });
});

describe('renderLoadingScreen', () => {
  it('renders loading phase and elapsed time', () => {
    const output = renderLoadingScreen({ label: 'Resolving media stream', elapsedSeconds: 12, frame: 2 });

    expect(output).toContain('Loading Media');
    expect(output).toContain('Resolving media stream');
    expect(output).toContain('0:12 elapsed');
    expect(output).toContain('Please Wait');
  });
});

describe('renderStartScreen', () => {
  it('wraps supported platform text instead of truncating it', () => {
    const output = renderStartScreen();

    expect(output).toContain('YouTube');
    expect(output).toContain('videos/playlists/livestreams');
    expect(output).not.toContain('…');
  });
});

describe('renderPlayerScreen', () => {
  it('renders now playing metadata, queue position, time, and controls', () => {
    const output = renderPlayerScreen({
      media: {
        title: 'track',
        uploader: 'creator',
        streamUrl: 'https://cdn.example/track',
        webpageUrl: 'https://www.tiktok.com/@creator/video/1',
      },
      queueIndex: 1,
      queueLength: 3,
      elapsedSeconds: 30,
      durationSeconds: 90,
      paused: false,
      errorMessage: 'Playback failed with exit code 2. HTTP error 403 Forbidden',
    });

    expect(output).toContain('track');
    expect(output).toContain('creator');
    expect(output).toContain('2/3');
    expect(output).toContain('0:30 elapsed   1:00 left   1:30 total');
    expect(output).toContain('Now Playing');
    expect(output).toContain('Progress');
    expect(output).toContain('Space');
    expect(output).toContain('Playback Error');
    expect(output).toContain('HTTP error 403 Forbidden');
  });
});

describe('sanitizeTerminalText', () => {
  it('removes terminal control sequences and line breaks', () => {
    expect(sanitizeTerminalText('[31mred[0m\nnext')).toBe('red next');
  });
});
