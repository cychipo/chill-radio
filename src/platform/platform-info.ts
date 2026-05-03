export type SupportedPlatform = 'darwin' | 'linux' | 'win32';
export type SupportedArch = 'x64' | 'arm64';

export type PlatformInfo = {
  platform: SupportedPlatform;
  arch: SupportedArch;
  executableExtension: string;
};

export function getPlatformInfo(): PlatformInfo {
  if (!isSupportedPlatform(process.platform)) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  if (!isSupportedArch(process.arch)) {
    throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  return {
    platform: process.platform,
    arch: process.arch,
    executableExtension: process.platform === 'win32' ? '.exe' : '',
  };
}

function isSupportedPlatform(value: NodeJS.Platform): value is SupportedPlatform {
  return value === 'darwin' || value === 'linux' || value === 'win32';
}

function isSupportedArch(value: string): value is SupportedArch {
  return value === 'x64' || value === 'arm64';
}
