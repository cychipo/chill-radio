import { getPlatformInfo } from '../src/platform/platform-info.js';

try {
  const platformInfo = getPlatformInfo();
  console.log(`chill-radio: using PATH fallback for mpv on ${platformInfo.platform}-${platformInfo.arch}.`);
  console.log('chill-radio: yt-dlp is managed by youtube-dl-exec.');
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unsupported platform.';
  console.warn(`chill-radio: ${message}`);
  console.warn('Install mpv manually or add a compatible binary under vendor/bin/mpv.');
}
