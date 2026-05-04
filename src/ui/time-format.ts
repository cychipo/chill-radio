export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return '--:--';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padTime(minutes)}:${padTime(remainingSeconds)}`;
  }

  return `${minutes}:${padTime(remainingSeconds)}`;
}

export function formatRemaining(elapsedSeconds: number | undefined, durationSeconds: number | undefined): string {
  if (elapsedSeconds === undefined || durationSeconds === undefined) {
    return '--:--';
  }

  return formatDuration(Math.max(durationSeconds - elapsedSeconds, 0));
}

function padTime(value: number): string {
  return value.toString().padStart(2, '0');
}
