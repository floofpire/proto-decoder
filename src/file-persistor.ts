import { writeFileSync } from 'fs';
import { resolve } from 'path';

export const saveMessage = (name: string, message: Record<string, unknown>): void => {
  // we ignore heartbeats
  if ('req_heartbeat' in message || 'reply_heartbeat' in message) {
    return;
  }

  writeFileSync(resolve(import.meta.dir, `../messages/${name}.json`), JSON.stringify(message, null, 2));
};
