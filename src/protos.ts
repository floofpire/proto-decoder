import { JSONArray, JSONObject, JSONValue } from './types.ts';

export interface ReplySlgOccupation {
  uid: number;
  block_group_id_map: Record<string, number>;
}

export interface ReplySlgOpenMiniMap {
  open_mini_map: {
    occ_list: ReplySlgOccupation[];
  };
}

export interface ReplySlgQueryMapBlocks {
  blocks: JSONArray;
}

export interface ReplySlgQueryMap<T> {
  query_map: T;
}

export interface ReplySlgOpenPanel {
  open_panel: {
    occupied_blocks: JSONArray;
  };
}

export interface ReplySlgQueryBlocks {
  query_blocks: {
    blocks: JSONArray;
  };
}

export type ReplySlg =
  | ReplySlgQueryMap<string>
  | ReplySlgQueryMap<ReplySlgQueryMapBlocks>
  | ReplySlgOpenPanel
  | ReplySlgQueryBlocks
  | ReplySlgOpenMiniMap;

export interface CommonDownMessage {
  reply_svr_ts: string;
  reply_seq: number;
}

export interface GenericDownMessage extends CommonDownMessage {
  [key: string]: JSONValue;
}

export interface ReplySlgDownMessage<T extends ReplySlg> extends CommonDownMessage {
  reply_slg: T;
}

export interface ReplySlgWarbandDownMessage extends CommonDownMessage {
  reply_slg_warband: {
    open_panel: JSONObject;
  };
}

export interface ReplyGuildManorDownMessage extends CommonDownMessage {
  reply_guild_manor: {
    zlib_query_glory_statue: string;
    query_glory_statue: JSONObject;
  };
}

export interface ReplyLoginDownMessage extends CommonDownMessage {
  reply_login: {
    zlib_user_info: string;
    user_info: JSONObject;
    d_test: string;
    _d_test: JSONObject;
  };
}

export interface ReplyGvgWarbandDealOpenWarband {
  reply_gvg_warband_deal: {
    open_warband: {
      id: string;
      tid: string;
      icon?: string;
      frame?: string;
      name?: string;
      name_changed: boolean;
      warband_last_settle_score: string;
      settle_ts: string;
      members: {
        member_summary: JSONObject;
        gs: string;
        last_settle_score: string;
        dig_secs: string;
        title: string;
        is_robot?: boolean;
        occ_block_id?: string;
      }[];
    };
  };
}

export interface ReplyGvgOpenRank {
  open_rank: {
    rank_summaries: {
      rank: string;
      fraction: string;
      warband_tid: string;
      warband_icon: string;
      user_summary: JSONObject;
      uid: string;
      ts: string;
      is_robot: boolean;
      warband_frame: string;
    }[];
  };
}

export type ReplyGvg = ReplyGvgWarbandDealOpenWarband | ReplyGvgOpenRank;

export interface ReplyGvgDownMessage<T extends ReplyGvg> extends CommonDownMessage {
  reply_gvg: T;
}

// @ts-ignore
export type DownMessage<T> =
  | GenericDownMessage
  | ReplySlgDownMessage<T>
  | ReplyGvgDownMessage<T>
  | ReplySlgWarbandDownMessage
  | ReplyLoginDownMessage
  | ReplyGuildManorDownMessage;

export const isReplySlgDownMessage = (message: Message): message is ReplySlgDownMessage<any> => {
  return 'reply_slg' in message && typeof message.reply_slg === 'object';
};

export const isReplyGuildManorDownMessage = (message: Message): message is ReplyGuildManorDownMessage => {
  return (
    'reply_guild_manor' in message &&
    typeof message.reply_guild_manor === 'object' &&
    !!message.reply_guild_manor &&
    'zlib_query_glory_statue' in message.reply_guild_manor &&
    !!message.reply_guild_manor.zlib_query_glory_statue
  );
};

export const isReplyLoginDownMessage = (message: Message): message is ReplyLoginDownMessage => {
  return (
    'reply_login' in message &&
    typeof message.reply_login === 'object' &&
    !!message.reply_login &&
    'zlib_user_info' in message.reply_login &&
    !!message.reply_login.zlib_user_info
  );
};

export const isReplySlgQueryMap = (message: Message): message is ReplySlgDownMessage<ReplySlgQueryMap<any>> => {
  return isReplySlgDownMessage(message) && 'query_map' in message.reply_slg;
};

export const isReplySlgQueryMapWithBlocks = (
  message: Message,
): message is ReplySlgDownMessage<ReplySlgQueryMap<ReplySlgQueryMapBlocks>> => {
  return (
    isReplySlgQueryMap(message) &&
    typeof message.reply_slg.query_map === 'object' &&
    'blocks' in message.reply_slg.query_map &&
    typeof message.reply_slg.query_map.blocks === 'object' &&
    Array.isArray(message.reply_slg.query_map.blocks)
  );
};

export const isReplySlgOpenPanel = (message: Message): message is ReplySlgDownMessage<ReplySlgOpenPanel> => {
  return (
    isReplySlgDownMessage(message) &&
    'open_panel' in message.reply_slg &&
    typeof message.reply_slg.open_panel === 'object' &&
    'occupied_blocks' in message.reply_slg.open_panel &&
    Array.isArray(message.reply_slg.open_panel.occupied_blocks)
  );
};

export const isReplySlgQueryBlocks = (message: Message): message is ReplySlgDownMessage<ReplySlgQueryBlocks> => {
  return (
    isReplySlgDownMessage(message) &&
    'query_blocks' in message.reply_slg &&
    typeof message.reply_slg.query_blocks === 'object' &&
    'blocks' in message.reply_slg.query_blocks &&
    Array.isArray(message.reply_slg.query_blocks.blocks)
  );
};

export const isReplySlgWarbandDownMessage = (message: Message): message is ReplySlgWarbandDownMessage => {
  return (
    'reply_slg_warband' in message &&
    typeof message.reply_slg_warband === 'object' &&
    !!message.reply_slg_warband &&
    'open_panel' in message.reply_slg_warband &&
    typeof message.reply_slg_warband.open_panel === 'object' &&
    !Array.isArray(message.reply_slg_warband.open_panel)
  );
};

export const isReplySlgOpenMiniMap = (message: Message): message is ReplySlgDownMessage<ReplySlgOpenMiniMap> => {
  return (
    isReplySlgDownMessage(message) &&
    'open_mini_map' in message.reply_slg &&
    typeof message.reply_slg.open_mini_map === 'object' &&
    'occ_list' in message.reply_slg.open_mini_map &&
    typeof message.reply_slg.open_mini_map.occ_list === 'object' &&
    Array.isArray(message.reply_slg.open_mini_map.occ_list)
  );
};

export const isReplyGvgDownMessage = (message: Message): message is ReplyGvgDownMessage<any> => {
  return 'reply_gvg' in message && typeof message.reply_gvg === 'object';
};

export const isReplyGvgWarbandDeal = (
  message: Message,
): message is ReplyGvgDownMessage<ReplyGvgWarbandDealOpenWarband> => {
  return (
    isReplyGvgDownMessage(message) &&
    'reply_gvg_warband_deal' in message.reply_gvg &&
    typeof message.reply_gvg.reply_gvg_warband_deal === 'object' &&
    'open_warband' in message.reply_gvg.reply_gvg_warband_deal &&
    typeof message.reply_gvg.reply_gvg_warband_deal.open_warband === 'object'
  );
};

export const isReplyGvgOpenRank = (message: Message): message is ReplyGvgDownMessage<ReplyGvgOpenRank> => {
  return (
    isReplyGvgDownMessage(message) &&
    'open_rank' in message.reply_gvg &&
    typeof message.reply_gvg.open_rank === 'object' &&
    'rank_summaries' in message.reply_gvg.open_rank &&
    Array.isArray(message.reply_gvg.open_rank.rank_summaries) &&
    message.reply_gvg.open_rank.rank_summaries.length > 0
  );
};

export interface UpMessage {
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

export type Message = DownMessage<any> | UpMessage;
