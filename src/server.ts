import { Elysia, t } from 'elysia';
import { cron } from '@elysiajs/cron';

import { decodeDownMessage, decodeUpMessage } from './decoder.ts';
import { saveMessage } from './filePersistor.ts';
import { runMigrations, getDbClient } from './db/client.ts';
import { saveMessageInDatabase } from './dbPersistor.ts';
import { logger } from './logger.ts';
import { snapshotGVGWarbandMembers } from './db/schema/gvgWarbandMemberSnapshot.ts';

const port = 29323;

await getDbClient();
await runMigrations();

const app = new Elysia()
  .onRequest(({ request }) => {
    logger.silly(`Received request: ${request.url}`);
  })
  .use(
    cron({
      name: 'snapshot-gvg-warband-members',
      pattern: '50 59 23 * * *',
      timezone: 'UTC',
      async run() {
        logger.debug('Running snapshot-gvg-warband-members cron job');
        await snapshotGVGWarbandMembers();
      },
    }),
  )
  .guard(
    {
      body: t.Object({
        message: t.String(),
      }),
      headers: t.Object({
        'x-sent-by': t.String(),
      }),
    },
    (app) =>
      app
        .post('/down', async ({ body, headers }) => {
          const sender = headers['x-sent-by'];
          const decodedMessage = decodeDownMessage(body.message);
          await saveMessage(`${decodedMessage.reply_seq}-down-${decodedMessage.reply_svr_ts}`, sender, decodedMessage);
          saveMessageInDatabase(decodedMessage, sender);

          logger.info(
            `Received ${decodedMessage.reply_seq}-down message from "${sender}" of size ${body.message.length}`,
          );
          return 'OK';
        })
        .post('/up', async ({ body, headers }) => {
          const sender = headers['x-sent-by'];
          const decodedMessage = decodeUpMessage(body.message);
          await saveMessage(`${decodedMessage.seq}-up-${decodedMessage.sign}`, sender, decodedMessage);

          logger.info(`Received ${decodedMessage.seq}-up message from "${sender}" of size ${body.message.length}`);
          return 'OK';
        }),
  )
  .post('/cron', async () => {
    await snapshotGVGWarbandMembers();
    return 'OK';
  })
  .listen(port);

logger.info(`Server started on http://localhost:${app.server?.port}`);
