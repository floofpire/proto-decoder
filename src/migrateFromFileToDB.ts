import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { saveMessageInDatabase } from './dbPersistor.ts';
import { logger } from './logger.ts';

const files = readdirSync(resolve(import.meta.dir, '../messages/')).sort();

for (const file of files) {
  if (!file.includes('.json')) {
    continue;
  }

  logger.info(file);

  const fileContent = readFileSync(resolve(import.meta.dir, '../messages/', file), 'utf8');
  const message = JSON.parse(fileContent);
  await saveMessageInDatabase(message);
}

process.exit(0);
