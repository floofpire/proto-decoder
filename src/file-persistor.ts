import { writeFileSync } from 'fs';
import { resolve } from 'path';

export const saveMessage = (name: string, message: Record<string, unknown>): void => {
  // we ignore heartbeats
  if ('reqHeartbeat' in message || 'replyHeartbeat' in message) {
    return;
  }

  writeFileSync(resolve(import.meta.dir, `../messages/${name}.json`), JSON.stringify(message, null, 2));
};
