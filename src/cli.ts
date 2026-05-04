#!/usr/bin/env node
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

if (import.meta.url === `file://${process.argv[1]}`) {
  createCliProgram().parse(process.argv);
}
