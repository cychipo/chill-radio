#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { registerPlayCommand } from './commands/play.js';
import { registerStartCommand } from './commands/start.js';

export function createCliProgram(): Command {
  const program = new Command();

  program
    .name('chill-radio')
    .description('Play music from media URLs in your terminal.')
    .version('0.1.0');

  registerPlayCommand(program);
  registerStartCommand(program);

  return program;
}

if (isCliEntrypoint()) {
  createCliProgram().parse(process.argv);
}

function isCliEntrypoint(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}
