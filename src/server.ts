import { Elysia, t } from 'elysia';

import { decodeDownMessage, decodeUpMessage } from './decoder.ts';
import { saveMessage } from './file-persistor.ts';
import { runMigrations, getDbClient } from './db/client.ts';
import { saveMessageInDatabase } from './dbPersistor.ts';
import { logger } from './logger.ts';

const port = 29323;

await getDbClient();
await runMigrations();

const app = new Elysia()
  .model({
    proto: t.Object({
      message: t.String(),
    }),
  })
  .onRequest(({ request }) => {
    logger.silly(`Received request: ${request.url}`);
  })
  .post(
    '/down',
    ({ body }) => {
      const decodedMessage = decodeDownMessage(body.message);
      saveMessage(`${decodedMessage.reply_seq}-down-${decodedMessage.reply_svr_ts}`, decodedMessage);
      saveMessageInDatabase(decodedMessage);

      logger.info(`Received ${decodedMessage.reply_seq}-down message: ${body.message.length}`);
      return 'OK';
    },
    {
      body: 'proto',
    },
  )
  .post(
    '/up',
    ({ body }) => {
      const decodedMessage = decodeUpMessage(body.message);
      saveMessage(`${decodedMessage.seq}-up-${decodedMessage.sign}`, decodedMessage);

      logger.info(`Received ${decodedMessage.seq}-up message: ${body.message.length}`);
      return 'OK';
    },
    {
      body: 'proto',
    },
  )
  .listen(port);

logger.info(`Server started on http://localhost:${app.server?.port}`);
