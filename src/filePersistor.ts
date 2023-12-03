import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Message } from './protos.ts';
import { logger } from './logger.ts';

export const saveMessage = (name: string, message: Message): void => {
  // we ignore heartbeats
  if (
    ('req_heartbeat' in message && message.req_heartbeat !== null) ||
    ('reply_heartbeat' in message && message.reply_heartbeat !== null)
  ) {
    return;
  }

  try {
    writeFileSync(resolve(import.meta.dir, `../messages/${name}.json`), JSON.stringify(message, null, 2));
  } catch (e) {
    logger.error(e);
  }
};
