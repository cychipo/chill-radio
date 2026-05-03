const startTime = performance.now();

export function isTimingEnabled(): boolean {
  return process.env.CHILL_RADIO_TIMING === '1';
}

export function markTiming(label: string): void {
  if (!isTimingEnabled()) {
    return;
  }

  const elapsedMilliseconds = Math.round(performance.now() - startTime);
  console.error(`[timing +${elapsedMilliseconds}ms] ${label}`);
}
