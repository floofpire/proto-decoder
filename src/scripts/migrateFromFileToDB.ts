import { Glob } from 'bun';
import { resolve } from 'path';

import { saveMessageInDatabase } from '../dbPersistor.ts';
import { logger } from '../logger.ts';

const glob = new Glob('**/*-down-*.json');
const messageTimeRegex = /\d+-[downup]{2,4}-(\d{10}).json/;

const files = (await Array.fromAsync(glob.scan(resolve(import.meta.dir, '../messages/')))).sort();

for (const fileName of files) {
  logger.info(fileName);

  const sender = fileName.split('/')[0];
  const fileContent = await Bun.file(resolve(import.meta.dir, '../messages/', fileName)).text();
  const message = JSON.parse(fileContent);

  const messageTime = messageTimeRegex.exec(fileName);
  if (!messageTime) {
    logger.warn(`Cannot extract message time from file name: ${fileName}`);
  }
  const forcedTime = messageTime ? parseInt(messageTime[1]) : undefined;

  await saveMessageInDatabase(message, sender, undefined, forcedTime);
}

process.exit(0);
