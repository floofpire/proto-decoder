import { decodeDownMessage, decodeUpMessage } from './decoder.ts';
import { saveMessage } from './file-persistor.ts';
import { runMigrations, getDbClient } from './db/client.ts';

interface RequestBody {
  message?: string;
}

const port = 29323;

await getDbClient();
await runMigrations();

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (!request.body) {
      return new Response('Missing request body', { status: 400 });
    }

    const body = await request.json<RequestBody>();
    if (!body.message) {
      return new Response('Missing body message', { status: 400 });
    }

    switch (url.pathname) {
      case '/down': {
        const decodedMessage = decodeDownMessage(body.message);
        saveMessage(`${decodedMessage.reply_seq}-down-${decodedMessage.reply_svr_ts}`, decodedMessage);

        console.log(
          `[${new Date().toISOString()}] Received ${decodedMessage.reply_seq}-down message: ${body.message.length}`,
        );

        return new Response('OK', { status: 201 });
      }
      case '/up': {
        const decodedMessage = decodeUpMessage(body.message);
        saveMessage(`${decodedMessage.seq}-up-${decodedMessage.sign}`, decodedMessage);

        console.log(`[${new Date().toISOString()}] Received ${decodedMessage.seq}-up message: ${body.message.length}`);

        return new Response('OK', { status: 201 });
      }
      default:
        return new Response('Not found', { status: 404 });
    }
  },
});

console.log(`Server started on http://localhost:${port}`);
