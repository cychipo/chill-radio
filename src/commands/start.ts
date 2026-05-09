import type { Command } from 'commander';
import { createInterface } from 'node:readline/promises';
import { emitKeypressEvents } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { extractMedia } from '../services/media-extractor.js';
import { parseMediaInput } from '../services/media-input.js';
import { InteractiveQueueController } from '../services/interactive-queue-controller.js';
import { createPlayerSession } from '../services/player-session.js';
import { formatCliError, UserFacingError } from '../ui/errors.js';
import { renderLoadingScreen, renderPlayerScreen, renderStartScreen } from '../ui/player-screen.js';

const refreshIntervalMs = 750;
const loadingRefreshIntervalMs = 160;
const loadingLabels = ['Analyzing media URL', 'Resolving media stream', 'Preparing playback queue'];

export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Open the interactive terminal player.')
    .action(async () => {
      try {
        await startInteractiveMode();
      } catch (error) {
        console.error(formatCliError(error));
        process.exitCode = error instanceof UserFacingError ? error.exitCode : 1;
      }
    });
}

export async function startInteractiveMode(): Promise<void> {
  if (!input.isTTY || !output.isTTY) {
    throw new UserFacingError('Interactive start mode requires a TTY terminal. Use chill-radio play <url> for scripts.');
  }

  let promptMessage: string | undefined;

  while (true) {
    const url = await readMediaUrl(promptMessage);
    promptMessage = undefined;

    if (!url) {
      return;
    }

    const loading = startLoadingScreen();

    try {
      const mediaInput = parseMediaInput(url);
      const queue = await extractMedia(mediaInput);
      loading.stop();
      const controller = new InteractiveQueueController(queue, createPlayerSession);
      await controller.start();
      console.clear();
      console.log(
        renderPlayerScreen({
          media: queue[0],
          queueIndex: 0,
          queueLength: queue.length,
          paused: false,
          status: 'Starting playback...',
        }),
      );
      await runPlayerUi(controller);
    } catch (error) {
      loading.stop();
      promptMessage = formatCliError(error);
    }
  }
}

function startLoadingScreen(): { stop: () => void } {
  const startedAt = Date.now();
  let frame = 0;

  const render = () => {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const label = loadingLabels[Math.floor(frame / 12) % loadingLabels.length];
    console.clear();
    console.log(renderLoadingScreen({ label, elapsedSeconds, frame }));
    frame += 1;
  };

  render();
  const interval = setInterval(render, loadingRefreshIntervalMs);

  return {
    stop: () => clearInterval(interval),
  };
}

async function readMediaUrl(message?: string): Promise<string | undefined> {
  console.clear();
  console.log(renderStartScreen(message));

  const reader = createInterface({ input, output });

  try {
    const answer = await reader.question('Media URL> ');
    const trimmed = answer.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  } finally {
    reader.close();
  }
}

async function runPlayerUi(controller: InteractiveQueueController): Promise<void> {
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();
  output.write('\x1B[?25l');

  let stopped = false;
  let refresh: NodeJS.Timeout | undefined;

  const cleanup = async () => {
    if (stopped) {
      return;
    }

    stopped = true;
    if (refresh) {
      clearInterval(refresh);
    }
    input.setRawMode(false);
    input.pause();
    output.write('\x1B[?25h');
    await controller.stop();
  };

  const render = async () => {
    const state = await controller.getState();

    if (!state) {
      await cleanup();
      return;
    }

    console.clear();
    console.log(
      renderPlayerScreen({
        media: state.media,
        queueIndex: state.queueIndex,
        queueLength: state.queueLength,
        elapsedSeconds: state.progress.elapsedSeconds,
        durationSeconds: state.progress.durationSeconds,
        paused: state.progress.paused,
        errorMessage: state.errorMessage,
      }),
    );
  };

  const onKeypress = async (_text: string, key: { name?: string; ctrl?: boolean; sequence?: string }) => {
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      await cleanup();
      return;
    }

    if (key.name === 'space') {
      await controller.togglePause();
      await render();
      return;
    }

    if (key.name === 'n' || key.name === 'right') {
      await controller.next();
      await render();
      return;
    }

    if (key.name === 'p' || key.name === 'left') {
      await controller.previous();
      await render();
    }
  };

  input.on('keypress', onKeypress);

  try {
    await render();
    refresh = setInterval(() => {
      void render();
    }, refreshIntervalMs);

    while (!stopped) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    input.off('keypress', onKeypress);
    await cleanup();
  }
}
