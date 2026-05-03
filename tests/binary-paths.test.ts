import { describe, expect, it } from 'vitest';
import { getBundledBinaryPath } from '../src/platform/binary-paths.js';

describe('getBundledBinaryPath', () => {
  it('builds package-local binary paths', () => {
    const mpvPath = getBundledBinaryPath('mpv');

    expect(mpvPath).toContain('vendor');
    expect(mpvPath).toContain('bin');
    expect(mpvPath).toContain('mpv');
    expect(mpvPath).toMatch(/darwin|linux|win32/);
  });
});
