import { describe, expect, it } from 'vitest';
import { formatDuration, renderNowPlaying } from '../src/ui/now-playing.js';

describe('now playing UI', () => {
  it('formats duration as minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('renders media details', () => {
    const output = renderNowPlaying({
      title: 'Focus Beats',
      uploader: 'Chill Channel',
      durationSeconds: 90,
      streamUrl: 'https://cdn.example/audio',
      webpageUrl: 'https://example.com/watch',
    });

    expect(output).toContain('Now playing');
    expect(output).toContain('Focus Beats');
    expect(output).toContain('Chill Channel');
    expect(output).toContain('1:30');
  });
});
