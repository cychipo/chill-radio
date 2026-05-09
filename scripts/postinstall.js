#!/usr/bin/env node
import { chmodSync, copyFileSync, cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import extract from 'extract-zip';
import * as tar from 'tar';

const platform = process.platform;
const arch = process.arch;
const supportedPlatforms = new Set(['darwin', 'linux', 'win32']);
const supportedArchitectures = new Set(['x64', 'arm64']);

if (!supportedPlatforms.has(platform) || !supportedArchitectures.has(arch)) {
  console.warn(`chill-radio: automatic binary setup is not supported on ${platform}-${arch}.`);
  console.warn('chill-radio: install yt-dlp and mpv on PATH before playback.');
  process.exit(0);
}

const ytDlpAsset = getYtDlpAssetName(platform, arch);
const ytDlpPath = join('vendor', 'bin', 'yt-dlp', `${platform}-${arch}`, ytDlpAsset);

installBinaries().catch((error) => {
  console.warn(`chill-radio: automatic binary setup failed. ${error.message}`);
  console.warn('chill-radio: re-run npm install with network access, or install yt-dlp and mpv on PATH before playback.');
});

async function installBinaries() {
  await installYtDlp(ytDlpAsset, ytDlpPath);
  await installMpv();
}

function getYtDlpAssetName(currentPlatform, currentArch) {
  if (currentPlatform === 'darwin') {
    return 'yt-dlp_macos';
  }

  if (currentPlatform === 'linux') {
    return currentArch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
  }

  return currentArch === 'arm64' ? 'yt-dlp_arm64.exe' : 'yt-dlp.exe';
}

async function installYtDlp(assetName, targetPath) {
  if (existsSync(targetPath)) {
    console.log(`chill-radio: native yt-dlp already installed at ${targetPath}.`);
    return;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;
  console.log(`chill-radio: downloading native yt-dlp from ${url}.`);
  await downloadFile(url, targetPath);

  if (platform !== 'win32') {
    chmodSync(targetPath, 0o755);
  }

  console.log(`chill-radio: native yt-dlp installed at ${targetPath}.`);
}

async function installMpv() {
  const targetPath = join('vendor', 'bin', 'mpv', `${platform}-${arch}`, platform === 'win32' ? 'mpv.exe' : 'mpv');

  if (existsSync(targetPath) && (platform !== 'darwin' || existsSync(join(dirname(targetPath), 'lib')))) {
    console.log(`chill-radio: mpv already installed at ${targetPath}.`);
    return;
  }

  if (platform !== 'darwin') {
    console.warn(`chill-radio: bundled mpv download is not enabled for ${platform}-${arch}; using PATH fallback.`);
    return;
  }

  const asset = await resolveMpvMacosAsset();
  const cacheDirectory = join('vendor', '.cache');
  const extractDirectory = join(cacheDirectory, `mpv-${platform}-${arch}`);
  const archivePath = join(cacheDirectory, asset.name);

  mkdirSync(cacheDirectory, { recursive: true });
  rmSync(extractDirectory, { force: true, recursive: true });
  mkdirSync(extractDirectory, { recursive: true });

  console.log(`chill-radio: downloading mpv from ${asset.browser_download_url}.`);
  await downloadFile(asset.browser_download_url, archivePath);
  await extract(archivePath, { dir: join(process.cwd(), extractDirectory) });
  await extractNestedTarballs(extractDirectory);

  const extractedMpvPath = findMpvExecutable(extractDirectory);

  if (!extractedMpvPath) {
    throw new Error(`mpv executable not found in ${asset.name}`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(extractedMpvPath, targetPath);
  copyMpvLibraries(extractedMpvPath, dirname(targetPath));
  chmodSync(targetPath, 0o755);
  console.log(`chill-radio: mpv installed at ${targetPath}.`);
}

async function resolveMpvMacosAsset() {
  const response = await fetch('https://api.github.com/repos/mpv-player/mpv/releases/latest');

  if (!response.ok) {
    throw new Error(`mpv release lookup failed with HTTP ${response.status}`);
  }

  const release = await response.json();
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const architectureName = arch === 'arm64' ? 'arm' : 'intel';
  const candidates = assets
    .filter((asset) => typeof asset.name === 'string' && asset.name.includes('macos') && asset.name.includes(architectureName) && asset.name.endsWith('.zip'))
    .sort((left, right) => right.name.localeCompare(left.name));
  const asset = candidates[0];

  if (!asset?.browser_download_url) {
    throw new Error(`no official macOS mpv asset found for ${arch}`);
  }

  return asset;
}

function copyMpvLibraries(executablePath, targetDirectory) {
  const libraryDirectory = join(dirname(executablePath), 'lib');

  if (existsSync(libraryDirectory)) {
    cpSync(libraryDirectory, join(targetDirectory, 'lib'), { recursive: true });
  }
}

async function extractNestedTarballs(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isFile() && entry.name.endsWith('.tar.gz')) {
      await tar.x({ file: entryPath, cwd: directory });
      continue;
    }

    if (entry.isDirectory()) {
      await extractNestedTarballs(entryPath);
    }
  }
}

function findMpvExecutable(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isFile() && entry.name === 'mpv' && entryPath.includes(join('Contents', 'MacOS', 'mpv'))) {
      return entryPath;
    }

    if (entry.isDirectory()) {
      const nestedPath = findMpvExecutable(entryPath);

      if (nestedPath) {
        return nestedPath;
      }
    }
  }

  return undefined;
}

async function downloadFile(url, targetPath) {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`download failed with HTTP ${response.status}`);
  }

  await pipeline(response.body, createWriteStream(targetPath));
}
