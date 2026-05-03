#!/usr/bin/env node
const platform = process.platform;
const arch = process.arch;
const supportedPlatforms = new Set(['darwin', 'linux', 'win32']);
const supportedArchitectures = new Set(['x64', 'arm64']);

if (!supportedPlatforms.has(platform) || !supportedArchitectures.has(arch)) {
  console.warn(`chill-radio: automatic mpv setup is not supported on ${platform}-${arch}.`);
  console.warn('Install mpv manually or add a compatible binary under vendor/bin/mpv.');
  process.exit(0);
}

console.log(`chill-radio: using PATH fallback for mpv on ${platform}-${arch}.`);
console.log('chill-radio: yt-dlp is managed by youtube-dl-exec.');
