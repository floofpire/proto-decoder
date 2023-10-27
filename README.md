# proto-decoder

Decode all the protobufs communications from AFK Arena.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/server.ts
```

To decode protos, you need to send your protobufs to the server. The request body is like this:
```json
{
  "message": "base64 encoded protobuf"
}
```
And there are two routes depending on the direction of the communication:
- POST http://localhost:29323/up
- POST http://localhost:29323/down
