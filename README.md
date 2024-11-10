# proto-decoder

> [!CAUTION]
> November 10th 2024: this project has been moved to a private repository

Decode all the protobufs communications from AFK Arena. It require the .proto schemas from the game, which aren't included for obvious reasons. 

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/server.ts
```

To decode protos, you need to send your protobufs to the server. The request is like this:
POST http://localhost:29323/up-and-down-v2
```json
{
  "up": "optional base64 encoded protobuf",
  "down": "base64 encoded protobuf"
}
```
