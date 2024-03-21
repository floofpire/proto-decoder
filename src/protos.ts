import { hgame } from './afkprotos';
import { RequireKeysDeep } from './types';

declare module './afkprotos' {
  namespace hgame {
    export interface Ireply_slg {
      _query_map?: hgame.Ireply_m_map;
    }
    export interface Ireply_login {
      _d_test?: hgame.Id_test;
    }
    export interface Ireq_slg {
      _query_map?: Record<string, any>;
    }
  }
}

export type Message = hgame.Idown_msg | hgame.Iup_msg;

export const isReplyGuildManorDownMessage = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_guild_manor.zlib_query_glory_statue'> => {
  return (
    'reply_guild_manor' in message &&
    typeof message.reply_guild_manor === 'object' &&
    !!message.reply_guild_manor &&
    'zlib_query_glory_statue' in message.reply_guild_manor &&
    !!message.reply_guild_manor.zlib_query_glory_statue
  );
};

export const isReplyLoginDownMessage = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_login.zlib_user_info'> => {
  return (
    'reply_login' in message &&
    typeof message.reply_login === 'object' &&
    !!message.reply_login &&
    'zlib_user_info' in message.reply_login &&
    !!message.reply_login.zlib_user_info
  );
};

export const isReplyStageDownMessage = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_stage'> => {
  return 'reply_stage' in message && typeof message.reply_stage === 'object' && !!message.reply_stage;
};

export const isReplySlgDownMessage = (message: Message): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg'> => {
  return 'reply_slg' in message && typeof message.reply_slg === 'object';
};

export const isReplySlgQueryMap = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg.query_map'> => {
  return isReplySlgDownMessage(message) && 'query_map' in message.reply_slg;
};

export const isReplySlgQueryMapWithBlocks = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg._query_map.blocks'> => {
  return (
    isReplySlgQueryMap(message) &&
    typeof message.reply_slg._query_map === 'object' &&
    'blocks' in message.reply_slg._query_map &&
    typeof message.reply_slg._query_map.blocks === 'object' &&
    Array.isArray(message.reply_slg._query_map.blocks)
  );
};

export const isReplySlgOpenPanel = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg.open_panel.occupied_blocks'> => {
  return (
    isReplySlgDownMessage(message) &&
    'open_panel' in message.reply_slg &&
    typeof message.reply_slg.open_panel === 'object' &&
    !!message.reply_slg.open_panel &&
    'occupied_blocks' in message.reply_slg.open_panel &&
    Array.isArray(message.reply_slg.open_panel.occupied_blocks)
  );
};

export const isReplySlgQueryBlocks = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg.query_blocks.blocks'> => {
  return (
    isReplySlgDownMessage(message) &&
    'query_blocks' in message.reply_slg &&
    typeof message.reply_slg.query_blocks === 'object' &&
    !!message.reply_slg.query_blocks &&
    'blocks' in message.reply_slg.query_blocks &&
    Array.isArray(message.reply_slg.query_blocks.blocks)
  );
};

export const isReplySlgOpenMiniMap = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg.open_mini_map.occ_list'> => {
  return (
    isReplySlgDownMessage(message) &&
    'open_mini_map' in message.reply_slg &&
    typeof message.reply_slg.open_mini_map === 'object' &&
    !!message.reply_slg.open_mini_map &&
    'occ_list' in message.reply_slg.open_mini_map &&
    typeof message.reply_slg.open_mini_map.occ_list === 'object' &&
    Array.isArray(message.reply_slg.open_mini_map.occ_list)
  );
};

export const isReplySlgWarbandDownMessage = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg_warband.open_panel'> => {
  return (
    'reply_slg_warband' in message &&
    typeof message.reply_slg_warband === 'object' &&
    !!message.reply_slg_warband &&
    'open_panel' in message.reply_slg_warband &&
    typeof message.reply_slg_warband.open_panel === 'object' &&
    !Array.isArray(message.reply_slg_warband.open_panel)
  );
};

export const isReplySlgWarbandOpenRankBoard = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg_warband.open_rank_board.rank_boards'> => {
  return (
    'reply_slg_warband' in message &&
    typeof message.reply_slg_warband === 'object' &&
    !!message.reply_slg_warband &&
    'open_rank_board' in message.reply_slg_warband &&
    typeof message.reply_slg_warband.open_rank_board === 'object' &&
    !!message.reply_slg_warband.open_rank_board &&
    'rank_boards' in message.reply_slg_warband.open_rank_board &&
    Array.isArray(message.reply_slg_warband.open_rank_board.rank_boards)
  );
};

export const isReplySlgWarbandOpenRankBoardSubPanel = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_slg_warband.open_rank_board_sub_panel'> => {
  return (
    'reply_slg_warband' in message &&
    typeof message.reply_slg_warband === 'object' &&
    !!message.reply_slg_warband &&
    'open_rank_board_sub_panel' in message.reply_slg_warband &&
    typeof message.reply_slg_warband.open_rank_board_sub_panel === 'object' &&
    !!message.reply_slg_warband.open_rank_board_sub_panel
  );
};

export const isReqSlgWarbandOpenRankBoardSubPanel = (
  message?: Message,
): message is RequireKeysDeep<hgame.Iup_msg, 'req_slg_warband.open_rank_board_sub_panel'> => {
  return (
    !!message &&
    'req_slg_warband' in message &&
    typeof message.req_slg_warband === 'object' &&
    !!message.req_slg_warband &&
    'open_rank_board_sub_panel' in message.req_slg_warband &&
    typeof message.req_slg_warband.open_rank_board_sub_panel === 'object' &&
    !!message.req_slg_warband.open_rank_board_sub_panel
  );
};

export const isReplyGvgDownMessage = (message: Message): message is RequireKeysDeep<hgame.Idown_msg, 'reply_gvg'> => {
  return 'reply_gvg' in message && typeof message.reply_gvg === 'object';
};

export const isReplyGvgWarbandDeal = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_gvg.reply_gvg_warband_deal.open_warband'> => {
  return (
    isReplyGvgDownMessage(message) &&
    'reply_gvg_warband_deal' in message.reply_gvg &&
    typeof message.reply_gvg.reply_gvg_warband_deal === 'object' &&
    !!message.reply_gvg.reply_gvg_warband_deal &&
    'open_warband' in message.reply_gvg.reply_gvg_warband_deal &&
    typeof message.reply_gvg.reply_gvg_warband_deal.open_warband === 'object'
  );
};

export const isReplyGvgOpenRank = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_gvg.open_rank.rank_summaries'> => {
  return (
    isReplyGvgDownMessage(message) &&
    'open_rank' in message.reply_gvg &&
    typeof message.reply_gvg.open_rank === 'object' &&
    !!message.reply_gvg.open_rank &&
    'rank_summaries' in message.reply_gvg.open_rank &&
    Array.isArray(message.reply_gvg.open_rank.rank_summaries) &&
    message.reply_gvg.open_rank.rank_summaries.length > 0
  );
};

export const isReqGvgOpenRank = (
  message?: Message,
): message is RequireKeysDeep<hgame.Iup_msg, 'req_gvg.open_rank.rank'> => {
  return (
    !!message &&
    'req_gvg' in message &&
    typeof message.req_gvg === 'object' &&
    !!message.req_gvg &&
    'open_rank' in message.req_gvg &&
    typeof message.req_gvg.open_rank === 'object' &&
    !!message.req_gvg.open_rank &&
    'rank' in message.req_gvg.open_rank
  );
};

export const isReplyExtraGvgMapChangeChangedBlocks = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_extra.reply_extra_gvg.map_change.changed_blocks'> => {
  return (
    'reply_extra' in message &&
    typeof message.reply_extra === 'object' &&
    !!message.reply_extra &&
    'reply_extra_gvg' in message.reply_extra &&
    typeof message.reply_extra.reply_extra_gvg === 'object' &&
    !!message.reply_extra.reply_extra_gvg &&
    'map_change' in message.reply_extra.reply_extra_gvg &&
    typeof message.reply_extra.reply_extra_gvg.map_change === 'object' &&
    !!message.reply_extra.reply_extra_gvg.map_change &&
    'changed_blocks' in message.reply_extra.reply_extra_gvg.map_change &&
    Array.isArray(message.reply_extra.reply_extra_gvg.map_change.changed_blocks) &&
    message.reply_extra.reply_extra_gvg.map_change.changed_blocks.length > 0
  );
};

export const isReplyGuildSearchGuild = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_guild.search_guild.guilds'> => {
  return (
    'reply_guild' in message &&
    typeof message.reply_guild === 'object' &&
    !!message.reply_guild &&
    'search_guild' in message.reply_guild &&
    typeof message.reply_guild.search_guild === 'object' &&
    !!message.reply_guild.search_guild &&
    'guilds' in message.reply_guild.search_guild &&
    typeof message.reply_guild.search_guild.guilds === 'object' &&
    Array.isArray(message.reply_guild.search_guild.guilds)
  );
};

export const isReplyGuildMembers = (
  message: Message,
): message is RequireKeysDeep<hgame.Idown_msg, 'reply_guild.guild_members.members'> => {
  return (
    'reply_guild' in message &&
    typeof message.reply_guild === 'object' &&
    !!message.reply_guild &&
    'guild_members' in message.reply_guild &&
    typeof message.reply_guild.guild_members === 'object' &&
    !!message.reply_guild.guild_members &&
    'members' in message.reply_guild.guild_members &&
    typeof message.reply_guild.guild_members.members === 'object' &&
    Array.isArray(message.reply_guild.guild_members.members)
  );
};
