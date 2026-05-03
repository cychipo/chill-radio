import chalk from 'chalk';

export class UserFacingError extends Error {
  constructor(message: string, readonly exitCode = 1) {
    super(message);
    this.name = 'UserFacingError';
  }
}

export function formatCliError(error: unknown): string {
  if (error instanceof UserFacingError) {
    return chalk.red(error.message);
  }

  if (error instanceof Error && error.message) {
    return chalk.red(error.message);
  }

  return chalk.red('Unexpected error.');
}

export function toUserFacingError(error: unknown, fallback: string): UserFacingError {
  if (error instanceof UserFacingError) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return new UserFacingError(`${fallback}: ${error.message}`);
  }

  return new UserFacingError(fallback);
}
