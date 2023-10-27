import protobuf from 'protobufjs';
import { inflateSync } from 'zlib';
import CRC32 from 'crc-32';

const downRoot = await protobuf.load('./csproto/down.proto');
const DownMsgDefinition = downRoot.lookupType('down_msg');
const ReplyMMapDefinition = downRoot.lookupType('reply_m_map');

const upRoot = await protobuf.load('./csproto/up.proto');
const UpMsgDefinition = upRoot.lookupType('up_msg');

interface DownMessage {
  replySvrTs: string;
  replySeq: number;
  replySlg?: {
    queryMap: string | Record<string, unknown>;
  };

  [key: string]: unknown;
}

export const decodeDownMessage = (encodeMessage: string): DownMessage => {
  const buffer = Buffer.from(encodeMessage, 'base64');
  const decodedMessage = DownMsgDefinition.decode(buffer).toJSON() as DownMessage;

  if (typeof decodedMessage.replySvrTs !== 'string') {
    throw new Error('Invalid replySvrTs');
  }
  if (typeof decodedMessage.replySeq !== 'number') {
    throw new Error('Invalid replySeq');
  }

  if (decodedMessage.replySlg?.queryMap && typeof decodedMessage.replySlg.queryMap === 'string') {
    try {
      const queryMapBuffer = Buffer.from(decodedMessage.replySlg.queryMap, 'base64');
      const decompressedQueryMap = inflateSync(queryMapBuffer);
      decodedMessage.replySlg.queryMap = ReplyMMapDefinition.decode(decompressedQueryMap).toJSON();
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};

interface UpMessage {
  seq: number;
  sign: string;
  reqSlg?: {
    _queryMap: Record<string, unknown>;
    queryMap: {
      msgName: string;
      binZlib: string;
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

  if (decodedMessage.reqSlg?.queryMap) {
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
      const queryMapBuffer = Buffer.from(decodedMessage.reqSlg.queryMap.binZlib, 'base64');
      const compressedDataLength = queryMapBuffer.subarray(1, 5).readUInt32LE(0);
      const compressedData = queryMapBuffer.subarray(5, 5 + compressedDataLength);
      const crc32 = queryMapBuffer.readUInt32LE(5 + compressedDataLength);
      const compressedDataCRC32 = CRC32.buf(compressedData);
      if (crc32 !== compressedDataCRC32) {
        console.warn('CRC32 mismatch');
      }

      const decompressedQueryMap = inflateSync(compressedData);
      decodedMessage.reqSlg._queryMap = upRoot
        .lookupType(decodedMessage.reqSlg.queryMap.msgName)
        .decode(decompressedQueryMap)
        .toJSON();
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};
