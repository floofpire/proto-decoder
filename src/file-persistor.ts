import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Message } from './protos.ts';

export const saveMessage = (name: string, message: Message): void => {
  // we ignore heartbeats
  if ('req_heartbeat' in message || 'reply_heartbeat' in message) {
    return;
  }

  writeFileSync(resolve(import.meta.dir, `../messages/${name}.json`), JSON.stringify(message, null, 2));
};
