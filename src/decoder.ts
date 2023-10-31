import protobuf from 'protobufjs';
import { inflateSync } from 'zlib';
import CRC32 from 'crc-32';
import { JSONObject, JSONValue } from './types.ts';

const protobufRoot = new protobuf.Root();

const downRoot = await protobufRoot.load('./csproto/down.proto', { keepCase: true });
const DownMsgDefinition = downRoot.lookupType('down_msg');
const ReplyMMapDefinition = downRoot.lookupType('reply_m_map');

const upRoot = await protobufRoot.load('./csproto/up.proto', { keepCase: true });
const UpMsgDefinition = upRoot.lookupType('up_msg');

interface DownMessage {
  reply_svr_ts: string;
  reply_seq: number;
  reply_slg?: {
    query_map: string | JSONObject;
  };
  [key: string]: JSONValue;
}

export const decodeDownMessage = (encodeMessage: string): DownMessage => {
  const buffer = Buffer.from(encodeMessage, 'base64');
  const decodedMessage = DownMsgDefinition.decode(buffer).toJSON() as DownMessage;

  if (typeof decodedMessage.reply_svr_ts !== 'string') {
    throw new Error('Invalid replySvrTs');
  }
  if (typeof decodedMessage.reply_seq !== 'number') {
    throw new Error('Invalid replySeq');
  }

  if (decodedMessage.reply_slg?.query_map && typeof decodedMessage.reply_slg.query_map === 'string') {
    try {
      const queryMapBuffer = Buffer.from(decodedMessage.reply_slg.query_map, 'base64');
      const decompressedQueryMap = inflateSync(queryMapBuffer);
      decodedMessage.reply_slg.query_map = ReplyMMapDefinition.decode(decompressedQueryMap).toJSON();
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};

interface UpMessage {
  seq: number;
  sign: string;
  req_slg?: {
    _query_map: Record<string, unknown>;
    query_map: {
      msg_name: string;
      bin_zlib: string;
    };
  };
  [key: string]: unknown;
}

export const decodeUpMessage = (encodeMessage: string): UpMessage => {
  const buffer = Buffer.from(encodeMessage, 'base64');
  const decodedMessage = UpMsgDefinition.decode(buffer).toJSON() as UpMessage;

  if (typeof decodedMessage.sign !== 'string') {
    throw new Error('Invalid sign');
  }
  if (typeof decodedMessage.seq !== 'number') {
    throw new Error('Invalid seq');
  }

  if (decodedMessage.req_slg?.query_map) {
    try {
      /**
       *     var i = ed.compressNetData(e, t),
       *       r = String.fromCharCode.apply(null, i),
       *       n = ed.crc32(r),
       *       a = i.byteLength,
       *       s = new Uint8Array(5 + a + 4);
       *     return (
       *       s.set([0]),
       *       s.set(new Uint8Array(new Uint32Array([a]).buffer), 1),
       *       s.set(i, 5),
       *       s.set(new Uint8Array(new Uint32Array([n]).buffer), 5 + a),
       *       s
       *     );
       */
      const queryMapBuffer = Buffer.from(decodedMessage.req_slg.query_map.bin_zlib, 'base64');
      const compressedDataLength = queryMapBuffer.subarray(1, 5).readUInt32LE(0);
      const compressedData = queryMapBuffer.subarray(5, 5 + compressedDataLength);
      const crc32 = queryMapBuffer.readUInt32LE(5 + compressedDataLength);
      const compressedDataCRC32 = CRC32.buf(compressedData);
      if (crc32 !== compressedDataCRC32) {
        console.warn('CRC32 mismatch');
      }

      const decompressedQueryMap = inflateSync(compressedData);
      decodedMessage.req_slg._query_map = upRoot
        .lookupType(decodedMessage.req_slg.query_map.msg_name)
        .decode(decompressedQueryMap)
        .toJSON();
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};
