import { access } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPlatformInfo } from './platform-info.js';

export type BinaryName = 'mpv' | 'yt-dlp';

export async function resolveBinaryPath(name: BinaryName): Promise<string> {
  const bundledPath = getBundledBinaryPath(name);

  try {
    await access(bundledPath);
    return bundledPath;
  } catch {
    return name;
  }
}

export function getBundledBinaryPath(name: BinaryName): string {
  const platformInfo = getPlatformInfo();
  const packageRoot = getPackageRoot();

  return resolve(
    join(
      packageRoot,
      'vendor',
      'bin',
      name,
      `${platformInfo.platform}-${platformInfo.arch}`,
      `${name}${platformInfo.executableExtension}`,
    ),
  );
}

function getPackageRoot(): string {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const distSegment = `${sep}dist${sep}src${sep}`;
  return moduleDirectory.includes(distSegment)
    ? resolve(moduleDirectory, '../../..')
    : resolve(moduleDirectory, '../..');
}
