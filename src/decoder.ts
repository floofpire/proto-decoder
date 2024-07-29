import { inflateSync } from 'node:zlib';
import CRC32 from 'crc-32';
import protobuf from 'protobufjs';

import type { hgame } from './afkprotos';
import {
  isReplyGuildManorDownMessage,
  isReplyLoginDownMessage,
  isReplySlgQueryMap,
  isReplyStageDownMessage,
} from './protos.ts';

const protobufRoot = new protobuf.Root();

const downRoot = await protobufRoot.load('./csproto/down.proto', { keepCase: true });
const DownMsgDefinition = downRoot.lookupType('down_msg');
const ReplyMMapDefinition = downRoot.lookupType('reply_m_map');
const ReplyExtraMsgDefinition = DownMsgDefinition.lookupType('reply_extra');

const upRoot = await protobufRoot.load('./csproto/up.proto', { keepCase: true });
const UpMsgDefinition = upRoot.lookupType('up_msg');

const toObjectOptions = {
  enums: String, // enums as string names
  longs: String, // longs as strings (requires long.js)
  // bytes: String, // bytes as base64 encoded strings
  defaults: false, // includes default values
  oneofs: false, // includes virtual oneof fields set to the present field's name
};

const decompressNetDataWithCRC = (data: Uint8Array, messageType: protobuf.Type) => {
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
  const dataBuffer = Buffer.from(data);
  const compressedDataLength = dataBuffer.subarray(1, 5).readUInt32LE(0);
  const compressedData = dataBuffer.subarray(5, 5 + compressedDataLength);
  const crc32 = dataBuffer.readUInt32LE(5 + compressedDataLength);
  const compressedDataCRC32 = CRC32.buf(compressedData);
  if (crc32 !== compressedDataCRC32) {
    console.warn('CRC32 mismatch');
  }

  const decompressedData = inflateSync(compressedData);
  return messageType.toObject(messageType.decode(decompressedData), toObjectOptions);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const decompressNetData = <T extends { [p: string]: any }>(dataBuffer: Uint8Array, messageType: protobuf.Type): T => {
  /**
   *    var i = ed.stringToUint8Array(e),
   *       r = new Zlib.Inflate(i).decompress(),
   *       n = ed.rpc.downMsgRoot.lookupType(t).decode(r).toJSON();
   *     return cc.log('decompress data:', n), n;
   */
  // const dataBuffer = Buffer.from(data, 'base64');
  const decompressedData = inflateSync(dataBuffer);

  return messageType.toObject(messageType.decode(decompressedData), toObjectOptions) as unknown as T;
};

export const decodeDownMessage = (encodedMessage: string | Buffer, encodedExtra?: string | Buffer): hgame.down_msg => {
  const buffer = typeof encodedMessage === 'string' ? Buffer.from(encodedMessage, 'base64') : encodedMessage;
  const decodedMessage = DownMsgDefinition.toObject(
    DownMsgDefinition.decode(buffer),
    toObjectOptions,
  ) as hgame.down_msg;

  if (encodedExtra) {
    const extraBuffer = typeof encodedExtra === 'string' ? Buffer.from(encodedExtra, 'base64') : encodedExtra;
    const replyExtra = ReplyExtraMsgDefinition.toObject(
      ReplyExtraMsgDefinition.decode(extraBuffer),
      toObjectOptions,
    ) as hgame.Ireply_extra;
    if (!decodedMessage.reply_extra) {
      decodedMessage.reply_extra = replyExtra;
    } else {
      // @ts-ignore
      decodedMessage._reply_extra = replyExtra;
    }
  }

  if (typeof decodedMessage.reply_svr_ts !== 'string') {
    throw new Error('Invalid replySvrTs');
  }

  if (isReplySlgQueryMap(decodedMessage)) {
    try {
      const queryMapBuffer = Buffer.from(decodedMessage.reply_slg.query_map);
      const decompressedQueryMap = inflateSync(queryMapBuffer);
      decodedMessage.reply_slg._query_map = ReplyMMapDefinition.toObject(
        ReplyMMapDefinition.decode(decompressedQueryMap),
        toObjectOptions,
      ) as hgame.Ireply_m_map;
      (decodedMessage.reply_slg.query_map as unknown) = queryMapBuffer.toString('base64');
    } catch (e) {
      console.error(e);
    }
  } else if (isReplyGuildManorDownMessage(decodedMessage)) {
    const queryGloryStatue = decompressNetData<hgame.Ireply_guild_manor_query_glory_statue>(
      decodedMessage.reply_guild_manor.zlib_query_glory_statue,
      downRoot.lookupType('reply_guild_manor_query_glory_statue'),
    );
    (decodedMessage.reply_guild_manor.zlib_query_glory_statue as unknown) = Buffer.from(
      decodedMessage.reply_guild_manor.zlib_query_glory_statue,
    ).toString('base64');

    decodedMessage.reply_guild_manor.query_glory_statue = queryGloryStatue;
  } else if (isReplyLoginDownMessage(decodedMessage)) {
    decodedMessage.reply_login.user_info = decompressNetData<hgame.Ireply_user>(
      decodedMessage.reply_login.zlib_user_info,
      downRoot.lookupType('reply_user'),
    );
    (decodedMessage.reply_login.zlib_user_info as unknown) = Buffer.from(
      decodedMessage.reply_login.zlib_user_info,
    ).toString('base64');

    if (decodedMessage.reply_login.d_test) {
      decodedMessage.reply_login._d_test = decompressNetData<hgame.Id_test>(
        decodedMessage.reply_login.d_test,
        downRoot.lookupType('d_test'),
      );
      decodedMessage.reply_login.d_test = undefined;
    }
  } else if (isReplyStageDownMessage(decodedMessage)) {
    if (decodedMessage.reply_stage.zlib_query_records) {
      decodedMessage.reply_stage.query_records = decompressNetData<hgame.Ireply_stage_records>(
        decodedMessage.reply_stage.zlib_query_records,
        downRoot.lookupType('reply_stage_records'),
      );
      (decodedMessage.reply_stage.zlib_query_records as unknown) = Buffer.from(
        decodedMessage.reply_stage.zlib_query_records,
      ).toString('base64');
    }

    if (decodedMessage.reply_stage.zlib_query_assist_summaries) {
      decodedMessage.reply_stage.query_assist_summaries = decompressNetData<hgame.Iassist_summaries>(
        decodedMessage.reply_stage.zlib_query_assist_summaries,
        downRoot.lookupType('assist_summaries'),
      );
      (decodedMessage.reply_stage.zlib_query_assist_summaries as unknown) = Buffer.from(
        decodedMessage.reply_stage.zlib_query_assist_summaries,
      ).toString('base64');
    }

    if (decodedMessage.reply_stage.zlib_end_battle) {
      decodedMessage.reply_stage.end_battle = decompressNetData<hgame.Ireply_stage_end_battle>(
        decodedMessage.reply_stage.zlib_end_battle,
        downRoot.lookupType('reply_stage_end_battle'),
      );
      (decodedMessage.reply_stage.zlib_end_battle as unknown) = Buffer.from(
        decodedMessage.reply_stage.zlib_end_battle,
      ).toString('base64');
    }
  }

  return decodedMessage;
};

export const decodeUpMessage = (encodedMessage: string | Buffer): hgame.Iup_msg => {
  const buffer = typeof encodedMessage === 'string' ? Buffer.from(encodedMessage, 'base64') : encodedMessage;
  const decodedMessage = UpMsgDefinition.toObject(UpMsgDefinition.decode(buffer), toObjectOptions) as hgame.Iup_msg;

  if (typeof decodedMessage.sign !== 'string') {
    throw new Error('Invalid sign');
  }

  if (decodedMessage.req_slg?.query_map?.bin_zlib) {
    try {
      decodedMessage.req_slg._query_map = decompressNetDataWithCRC(
        decodedMessage.req_slg.query_map.bin_zlib,
        upRoot.lookupType(decodedMessage.req_slg.query_map.msg_name),
      );
      decodedMessage.req_slg.query_map.bin_zlib = undefined;
    } catch (e) {
      console.error(e);
    }
  }

  return decodedMessage;
};

interface WebsocketMessage {
  prefixData: {
    crc32: number;
    control: number;
    seq: number;
    repeat: number;
    moduleId: number;
    sign?: string;
  };
  protoData?: Buffer | undefined;
  extraData?: Buffer | undefined;
}

export const decodeWebsocketMessage = (encodeMessage: string, fromServer = true): WebsocketMessage => {
  const binaryData = Buffer.from(encodeMessage, 'base64');
  const dataView = new DataView(binaryData.buffer);
  const prefixData: WebsocketMessage['prefixData'] = {
    crc32: dataView.getInt32(0),
    control: dataView.getInt8(4),
    seq: dataView.getInt32(5),
    repeat: dataView.getInt32(9),
    moduleId: dataView.getInt32(13),
  };

  const payloadSize = dataView.getInt16(17);
  if (payloadSize > 0) {
    const hash = binaryData.slice(19, 19 + payloadSize);
    prefixData.sign = hash.toString('utf8');
  }

  let payload = binaryData.buffer.slice(19 + payloadSize);
  const isCompressed = prefixData.control === 1;
  if (isCompressed) {
    payload = inflateSync(Buffer.from(payload)).buffer;
  }

  let protoData: Buffer | undefined;
  let extraData: Buffer | undefined;
  const payloadDataView = new DataView(payload);

  let offset = 0;
  const protoDataSize = payloadDataView.getInt32(offset);
  offset += 4;
  if (protoDataSize > 0) {
    protoData = Buffer.from(payload.slice(offset, offset + protoDataSize));
  }

  if (fromServer) {
    offset += protoDataSize;
    const extraDataSize = payloadDataView.getInt32(offset);
    offset += 4;
    if (extraDataSize > 0) {
      extraData = Buffer.from(payload.slice(offset, offset + extraDataSize));
    }
  }
  return { prefixData, protoData, extraData };
};

export const decodeUpWebsocketMessage = (encodeMessage: string): [WebsocketMessage, hgame.Iup_msg | undefined] => {
  const websocketMessage = decodeWebsocketMessage(encodeMessage, false);

  return [websocketMessage, websocketMessage.protoData ? decodeUpMessage(websocketMessage.protoData) : undefined];
};

export const decodeDownWebsocketMessage = (encodeMessage: string): [WebsocketMessage, hgame.Idown_msg | undefined] => {
  const websocketMessage = decodeWebsocketMessage(encodeMessage, true);

  return [
    websocketMessage,
    websocketMessage.protoData ? decodeDownMessage(websocketMessage.protoData, websocketMessage.extraData) : undefined,
  ];
};
