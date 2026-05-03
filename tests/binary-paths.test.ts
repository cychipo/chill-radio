import { describe, expect, it } from 'vitest';
import { getBundledBinaryPath } from '../src/platform/binary-paths.js';

describe('getBundledBinaryPath', () => {
  it('builds package-local mpv paths', () => {
    const mpvPath = getBundledBinaryPath('mpv');

    expect(mpvPath).toContain('vendor');
    expect(mpvPath).toContain('bin');
    expect(mpvPath).toContain('mpv');
    expect(mpvPath).toMatch(/darwin|linux|win32/);
  });

  it('builds package-local native yt-dlp paths', () => {
    const ytDlpPath = getBundledBinaryPath('yt-dlp');

    expect(ytDlpPath).toContain('vendor');
    expect(ytDlpPath).toContain('bin');
    expect(ytDlpPath).toContain('yt-dlp');
    expect(ytDlpPath).toMatch(/yt-dlp_(macos|linux|linux_aarch64|arm64\.exe)|yt-dlp\.exe/);
  });
});
