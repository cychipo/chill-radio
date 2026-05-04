import { describe, expect, it } from 'vitest';
import { formatDuration, formatRemaining } from '../src/ui/time-format.js';

describe('formatDuration', () => {
  it('formats unknown, minute, and hour durations', () => {
    expect(formatDuration(undefined)).toBe('--:--');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});

describe('formatRemaining', () => {
  it('formats remaining time without going below zero', () => {
    expect(formatRemaining(10, 65)).toBe('0:55');
    expect(formatRemaining(80, 65)).toBe('0:00');
    expect(formatRemaining(undefined, 65)).toBe('--:--');
  });
});
