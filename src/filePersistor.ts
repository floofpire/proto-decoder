import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { Rome, Distribution } from '@biomejs/js-api';

import biomeConfig from '../biome.json';
import { logger } from './logger.ts';
import { Message } from './protos.ts';

const rome = await Rome.create({
  distribution: Distribution.NODE,
});
// @ts-ignore
rome.applyConfiguration(biomeConfig);

export const saveMessage = async (
  name: string,
  sender: string,
  message: Message,
  raw?: { message: string },
): Promise<void> => {
  // we ignore heartbeats
  if (
    ('req_heartbeat' in message && message.req_heartbeat !== null) ||
    ('reply_heartbeat' in message && message.reply_heartbeat !== null)
  ) {
    return;
  }

  try {
    const destinationFolder = resolve(import.meta.dir, `../messages/${sender}`);
    if (!existsSync(destinationFolder)) {
      mkdirSync(destinationFolder, { recursive: true });
    }

    const formatted = await rome.formatContent(JSON.stringify(message, null, 2), {
      filePath: `${name}.json`,
    });

    await Bun.write(`${destinationFolder}/${name}.json`, formatted.content);
    if (raw) {
      await Bun.write(`${destinationFolder}/${name}.raw.json`, JSON.stringify(raw));
    }
  } catch (e) {
    logger.error(e);
  }
};
