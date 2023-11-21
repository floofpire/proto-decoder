import protobuf from 'protobufjs';
import { inflateSync } from 'zlib';
import CRC32 from 'crc-32';

import { DownMessage, isReplyGuildManorDownMessage, isReplySlgQueryMap, UpMessage } from './protos.ts';

const protobufRoot = new protobuf.Root();

const downRoot = await protobufRoot.load('./csproto/down.proto', { keepCase: true });
const DownMsgDefinition = downRoot.lookupType('down_msg');
const ReplyMMapDefinition = downRoot.lookupType('reply_m_map');

const upRoot = await protobufRoot.load('./csproto/up.proto', { keepCase: true });
const UpMsgDefinition = upRoot.lookupType('up_msg');

const decompressNetDataWithCRC = (data: string, messageType: protobuf.Type) => {
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
  const dataBuffer = Buffer.from(data, 'base64');
  const compressedDataLength = dataBuffer.subarray(1, 5).readUInt32LE(0);
  const compressedData = dataBuffer.subarray(5, 5 + compressedDataLength);
  const crc32 = dataBuffer.readUInt32LE(5 + compressedDataLength);
  const compressedDataCRC32 = CRC32.buf(compressedData);
  if (crc32 !== compressedDataCRC32) {
    console.warn('CRC32 mismatch');
  }

  const decompressedData = inflateSync(compressedData);
  return messageType.decode(decompressedData).toJSON();
};

const decompressNetData = (data: string, messageType: protobuf.Type) => {
  /**
   *    var i = ed.stringToUint8Array(e),
   *       r = new Zlib.Inflate(i).decompress(),
   *       n = ed.rpc.downMsgRoot.lookupType(t).decode(r).toJSON();
   *     return cc.log('decompress data:', n), n;
   */
  const dataBuffer = Buffer.from(data, 'base64');
  const decompressedData = inflateSync(dataBuffer);

  return messageType.decode(decompressedData).toJSON();
};

const convertLongKeysToString = (obj: Record<string, any>) => {
  const newObject: Record<string, string> = {};

  Object.keys(obj).forEach((hashedUid) => {
    const uid = protobuf.util.longFromHash(hashedUid).toString();
    newObject[uid] = obj[hashedUid];
  });

  return newObject;
};

export const decodeDownMessage = (encodeMessage: string): DownMessage<any> => {
  const buffer = Buffer.from(encodeMessage, 'base64');
  const decodedMessage = DownMsgDefinition.decode(buffer).toJSON() as DownMessage<any>;

  if (typeof decodedMessage.reply_svr_ts !== 'string') {
    throw new Error('Invalid replySvrTs');
  }
  if (typeof decodedMessage.reply_seq !== 'number') {
    throw new Error('Invalid replySeq');
  }

  if (isReplySlgQueryMap(decodedMessage) && typeof decodedMessage.reply_slg.query_map === 'string') {
    try {
      const queryMapBuffer = Buffer.from(decodedMessage.reply_slg.query_map, 'base64');
      const decompressedQueryMap = inflateSync(queryMapBuffer);
      // @ts-ignore
      decodedMessage.reply_slg.query_map = ReplyMMapDefinition.decode(decompressedQueryMap).toJSON();
    } catch (e) {
      console.error(e);
    }
  } else if (isReplyGuildManorDownMessage(decodedMessage)) {
    const data = decompressNetData(
      decodedMessage.reply_guild_manor.zlib_query_glory_statue,
      downRoot.lookupType('reply_guild_manor_query_glory_statue'),
    );

    data.damages = convertLongKeysToString(data.damages);

    decodedMessage.reply_guild_manor.query_glory_statue = data;
  }

  return decodedMessage;
};

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
      decodedMessage.req_slg._query_map = decompressNetDataWithCRC(
        decodedMessage.req_slg.query_map.bin_zlib,
        upRoot.lookupType(decodedMessage.req_slg.query_map.msg_name),
      );
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};
