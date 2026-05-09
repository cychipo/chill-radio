import { chmod, copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import extract from 'extract-zip';
import * as tar from 'tar';
import { getPlatformInfo, type PlatformInfo } from '../src/platform/platform-info.js';

type GithubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

try {
  const platformInfo = getPlatformInfo();
  await installBinaries(platformInfo);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unsupported platform.';
  console.warn(`chill-radio: automatic binary setup failed. ${message}`);
  console.warn('chill-radio: re-run npm install with network access, or install yt-dlp and mpv on PATH before playback.');
}

async function installBinaries(platformInfo: PlatformInfo): Promise<void> {
  const ytDlpAssetName = getYtDlpAssetName(platformInfo);
  const ytDlpPath = join('vendor', 'bin', 'yt-dlp', `${platformInfo.platform}-${platformInfo.arch}`, ytDlpAssetName);
  await installYtDlp(ytDlpAssetName, ytDlpPath, platformInfo);
  await installMpv(platformInfo);
}

function getYtDlpAssetName(platformInfo: PlatformInfo): string {
  if (platformInfo.platform === 'darwin') {
    return 'yt-dlp_macos';
  }

  if (platformInfo.platform === 'linux') {
    return platformInfo.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
  }

  return platformInfo.arch === 'arm64' ? 'yt-dlp_arm64.exe' : 'yt-dlp.exe';
}

async function installYtDlp(assetName: string, targetPath: string, platformInfo: PlatformInfo): Promise<void> {
  if (existsSync(targetPath)) {
    console.log(`chill-radio: native yt-dlp already installed at ${targetPath}.`);
    return;
  }

  await mkdir(dirname(targetPath), { recursive: true });
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;
  console.log(`chill-radio: downloading native yt-dlp from ${url}.`);
  await downloadFile(url, targetPath);

  if (platformInfo.platform !== 'win32') {
    await chmod(targetPath, 0o755);
  }

  console.log(`chill-radio: native yt-dlp installed at ${targetPath}.`);
}

async function installMpv(platformInfo: PlatformInfo): Promise<void> {
  const targetPath = join(
    'vendor',
    'bin',
    'mpv',
    `${platformInfo.platform}-${platformInfo.arch}`,
    platformInfo.platform === 'win32' ? 'mpv.exe' : 'mpv',
  );

  if (existsSync(targetPath) && (platformInfo.platform !== 'darwin' || existsSync(join(dirname(targetPath), 'lib')))) {
    console.log(`chill-radio: mpv already installed at ${targetPath}.`);
    return;
  }

  if (platformInfo.platform !== 'darwin') {
    console.warn(`chill-radio: bundled mpv download is not enabled for ${platformInfo.platform}-${platformInfo.arch}; using PATH fallback.`);
    return;
  }

  const asset = await resolveMpvMacosAsset(platformInfo);
  const cacheDirectory = join('vendor', '.cache');
  const extractDirectory = join(cacheDirectory, `mpv-${platformInfo.platform}-${platformInfo.arch}`);
  const archivePath = join(cacheDirectory, asset.name);

  await mkdir(cacheDirectory, { recursive: true });
  await rm(extractDirectory, { force: true, recursive: true });
  await mkdir(extractDirectory, { recursive: true });

  console.log(`chill-radio: downloading mpv from ${asset.browser_download_url}.`);
  await downloadFile(asset.browser_download_url, archivePath);
  await extract(archivePath, { dir: join(process.cwd(), extractDirectory) });
  await extractNestedTarballs(extractDirectory);

  const extractedMpvPath = await findMpvExecutable(extractDirectory);

  if (!extractedMpvPath) {
    throw new Error(`mpv executable not found in ${asset.name}`);
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(extractedMpvPath, targetPath);
  await copyMpvLibraries(extractedMpvPath, dirname(targetPath));
  await chmod(targetPath, 0o755);
  console.log(`chill-radio: mpv installed at ${targetPath}.`);
}

async function resolveMpvMacosAsset(platformInfo: PlatformInfo): Promise<GithubReleaseAsset> {
  const response = await fetch('https://api.github.com/repos/mpv-player/mpv/releases/latest');

  if (!response.ok) {
    throw new Error(`mpv release lookup failed with HTTP ${response.status}`);
  }

  const release = (await response.json()) as { assets?: GithubReleaseAsset[] };
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const architectureName = platformInfo.arch === 'arm64' ? 'arm' : 'intel';
  const candidates = assets
    .filter((asset) => asset.name.includes('macos') && asset.name.includes(architectureName) && asset.name.endsWith('.zip'))
    .sort((left, right) => right.name.localeCompare(left.name));
  const asset = candidates[0];

  if (!asset?.browser_download_url) {
    throw new Error(`no official macOS mpv asset found for ${platformInfo.arch}`);
  }

  return asset;
}

async function copyMpvLibraries(executablePath: string, targetDirectory: string): Promise<void> {
  const libraryDirectory = join(dirname(executablePath), 'lib');

  if (existsSync(libraryDirectory)) {
    await cp(libraryDirectory, join(targetDirectory, 'lib'), { recursive: true });
  }
}

async function extractNestedTarballs(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
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

async function findMpvExecutable(directory: string): Promise<string | undefined> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isFile() && entry.name === 'mpv' && entryPath.includes(join('Contents', 'MacOS', 'mpv'))) {
      return entryPath;
    }

    if (entry.isDirectory()) {
      const nestedPath = await findMpvExecutable(entryPath);

      if (nestedPath) {
        return nestedPath;
      }
    }
  }

  return undefined;
}

async function downloadFile(url: string, targetPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`download failed with HTTP ${response.status}`);
  }

  await pipeline(response.body, createWriteStream(targetPath));
}
