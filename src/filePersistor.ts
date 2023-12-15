import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import { Message } from './protos.ts';
import { logger } from './logger.ts';

export const saveMessage = async (name: string, sender: string, message: Message): Promise<void> => {
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

    await Bun.write(`${destinationFolder}/${name}.json`, JSON.stringify(message, null, 2));
  } catch (e) {
    logger.error(e);
  }
};
