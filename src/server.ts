import { Elysia, t } from 'elysia';
import { cron } from '@elysiajs/cron';

import {
  decodeDownMessage,
  decodeDownWebsocketMessage,
  decodeUpMessage,
  decodeUpWebsocketMessage,
  decodeWebsocketMessage,
} from './decoder.ts';
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
  .guard(
    {
      body: t.Object({
        up: t.Optional(t.Nullable(t.String())),
        down: t.String(),
      }),
      headers: t.Object({
        'x-sent-by': t.String(),
      }),
    },
    (app) =>
      app
        .post('/up-and-down', async ({ body, headers }) => {
          const sender = headers['x-sent-by'];

          let decodedUpMessage;
          if (body.up) {
            decodedUpMessage = decodeUpMessage(body.up);
            await saveMessage(`${decodedUpMessage.seq}-up-${decodedUpMessage.sign}`, sender, decodedUpMessage);
          }

          const decodedDownMessage = decodeDownMessage(body.down);
          await saveMessage(
            `${decodedDownMessage.reply_seq}-down-${decodedDownMessage.reply_svr_ts}`,
            sender,
            decodedDownMessage,
          );

          saveMessageInDatabase(decodedDownMessage, sender, decodedUpMessage);

          logger.info(
            `Received ${decodedDownMessage.reply_seq}-${body.up ? 'up-' : ''}down message from "${sender}" of size ${
              body.up ? `${body.up.length} + ` : ''
            }${body.down.length}`,
          );

          return 'OK';
        })
        .post('/up-and-down-v2', async ({ body, headers }) => {
          const sender = headers['x-sent-by'];

          try {
            let upWebsocketMessage;
            let decodedUpMessage;
            if (body.up) {
              [upWebsocketMessage, decodedUpMessage] = decodeUpWebsocketMessage(body.up);
              if (decodedUpMessage) {
                await saveMessage(
                  `${upWebsocketMessage.prefixData.seq}-up-${decodedUpMessage.sign}`,
                  sender,
                  decodedUpMessage,
                );
              }
            }

            const [downWebsocketMessage, decodedDownMessage] = decodeDownWebsocketMessage(body.down);
            if (!decodedDownMessage) {
              return 'OK';
            }

            await saveMessage(
              `${downWebsocketMessage.prefixData.seq}-down-${decodedDownMessage.reply_svr_ts}`,
              sender,
              decodedDownMessage,
            );

            saveMessageInDatabase(decodedDownMessage, sender, decodedUpMessage);

            logger.info(
              `Received ${downWebsocketMessage.prefixData.seq}-${
                body.up ? 'up-' : ''
              }down message from "${sender}" of size ${body.up ? `${body.up.length} + ` : ''}${body.down.length}`,
            );
          } catch (e) {
            logger.error(e);
          }

          return 'OK';
        }),
  )

  .post('/cron', async () => {
    await snapshotGVGWarbandMembers();
    return 'OK';
  })
  .listen(port);

logger.info(`Server started on http://localhost:${app.server?.port}`);
