import type { hgame } from './afkprotos';
import { type NewGuild, upsertGuilds } from './db/schema/guild.ts';
import { upsertGuildMembers } from './db/schema/guildMember.ts';
import { upsertGVGBlockHistory } from './db/schema/gvgBlockHistory.ts';
import { upsertGVGWarband } from './db/schema/gvgWarband.ts';
import {
  type NewGVGWarbandMember,
  updateGVGWarbandMemberRanking,
  upsertGVGWarbandMembers,
} from './db/schema/gvgWarbandMember.ts';
import { type SLGNewBlock, upsertSLGBlocks } from './db/schema/slgBlock.ts';
import {
  type NewSLGWarband,
  setSLGWarbandGuildId,
  upsertSLGWarband,
  upsertSLGWarbands,
} from './db/schema/slgWarband.ts';
import {
  type NewSLGWarbandMemberRanking,
  upsertSLGWarbandMemberRankings,
} from './db/schema/slgWarbandMemberRanking.ts';
import {
  type NewSLGWarbandRanking,
  clearCoinsRankingOfWarbandNotInList,
  clearDamageRankingOfWarbandNotInList,
  upsertSLGWarbandRankings,
} from './db/schema/slgWarbandRanking.ts';
import { type NewSLGWarbandUser, upsertWarbandUsers } from './db/schema/slgWarbandUser.ts';
import { type NewUserSummary, upsertUserSummaries } from './db/schema/userSummary.ts';
import { logger } from './logger.ts';
import {
  type Message,
  isReplyExtraGvgMapChangeChangedBlocks,
  isReplyGuildMembers,
  isReplyGuildSearchGuild,
  isReplyGvgOpenRank,
  isReplyGvgWarbandDeal,
  isReplySlgOpenMiniMap,
  isReplySlgOpenPanel,
  isReplySlgQueryBlocks,
  isReplySlgQueryMapWithBlocks,
  isReplySlgWarbandDownMessage,
  isReplySlgWarbandOpenRankBoard,
  isReplySlgWarbandOpenRankBoardSubPanel,
  isReqGvgOpenRank,
  isReqSlgWarbandOpenRankBoardSubPanel,
} from './protos.ts';
import type { RequireKeysDeep } from './types.ts';

const COORD_Z = 1e6;
const COORD_X = 1e3;
const COORD_Y = 1;
const getBlockCoord = (blockId: number) => {
  const floor = Math.floor(blockId / COORD_Z);
  blockId %= floor * COORD_Z;
  return {
    x: Math.floor(blockId / COORD_X),
    y: blockId % COORD_X,
    z: floor,
  };
};

const tidToInitialScore = {
  '1': 7200,
  '2': 21600,
  '3': 64800,
} as const;

const slgWarbandBySender: Record<string, number> = {
  majestic: 345215,
  murder: 345274,
  foxhound: 644,
  'test/tartaros': 664,
};

const SLG_SEASON = 'B13';
const GVG_SEASON = 'S2R1';

export const saveMessageInDatabase = async (
  downMessage: Message,
  sender: string,
  upMessage?: Message,
  forcedTime?: number,
): Promise<void> => {
  if (isReplySlgWarbandDownMessage(downMessage)) {
    logger.debug('Found `reply_slg_warband.open_panel`');
    const panel = downMessage.reply_slg_warband.open_panel;

    await upsertSLGWarband({
      id: Number(panel.id),
      icon: Number(panel.icon),
      name: `${panel.name}`,
      map_end_ts: Number(panel.map_end_ts),
      name_modify_ts: Number.isNaN(Number(panel.name_modify_ts)) ? null : Number(panel.name_modify_ts),
      name_prohibited_ts: Number(panel.name_prohibited_ts),
      season: SLG_SEASON,
    });

    await upsertUserSummaries(
      (panel.users as unknown as Array<NewSLGWarbandUser & { summary: NewUserSummary }>).map((user) => {
        return {
          ...user.summary,
          uid: Number(user.summary.uid),
        };
      }),
    );

    await upsertWarbandUsers(
      (panel.users as unknown as Array<NewSLGWarbandUser & { summary: NewUserSummary }>).map((user) => {
        return {
          uid: Number(user.summary.uid),
          warband_id: Number(panel.id),
          gs: user.gs,
          nobility: user.nobility,
          title: user.title,
          guild_id: user.guild_id,
        };
      }),
    );
  } else if (isReplySlgOpenPanel(downMessage)) {
    logger.debug('Found `reply_slg.open_panel`');
    const occupiedBlocks = downMessage.reply_slg.open_panel.occupied_blocks as unknown as SLGNewBlock[];

    await upsertSLGBlocks(
      occupiedBlocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
          warband_id: sender in slgWarbandBySender ? slgWarbandBySender[sender] : 0,
        };
      }),
    );
  } else if (isReplySlgQueryBlocks(downMessage)) {
    logger.debug('Found `reply_slg.query_blocks.blocks`');
    const blocks = downMessage.reply_slg.query_blocks.blocks as unknown as SLGNewBlock[];

    await upsertSLGBlocks(
      blocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
          warband_id: sender in slgWarbandBySender ? slgWarbandBySender[sender] : 0,
        };
      }),
    );
  } else if (isReplySlgQueryMapWithBlocks(downMessage)) {
    logger.debug('Found `reply_slg.query_map.blocks`');
    const blocks = downMessage.reply_slg._query_map.blocks;

    await upsertSLGBlocks(
      blocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          bonus_param: block.active_bonus_param,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
          warband_id: sender in slgWarbandBySender ? slgWarbandBySender[sender] : 0,
        };
      }),
    );
  } else if (isReplySlgOpenMiniMap(downMessage)) {
    logger.debug('Found `reply_slg.open_mini_map.occ_list`');
    const occList = downMessage.reply_slg.open_mini_map.occ_list;
    const newBlocks = occList.reduce<SLGNewBlock[]>((newBlocks, occupation) => {
      const owner = Number(occupation.uid);

      if (occupation.block_group_id_map) {
        return newBlocks.concat(
          Object.keys(occupation.block_group_id_map).map((blockId) => {
            const id = Number(blockId);
            const coords = getBlockCoord(id);
            return {
              id,
              owner,
              // @ts-ignore
              group: Number(occupation.block_group_id_map[blockId]),
              _x: coords.x,
              _y: coords.y,
              _z: coords.z,
              warband_id: sender in slgWarbandBySender ? slgWarbandBySender[sender] : 0,
            };
          }),
        );
      }

      return newBlocks;
    }, []);

    await upsertSLGBlocks(newBlocks);
  } else if (isReplyGvgWarbandDeal(downMessage)) {
    logger.debug('Found `reply_gvg.reply_gvg_warband_deal.open_warband`');
    const rawWarband = downMessage.reply_gvg.reply_gvg_warband_deal.open_warband;

    await upsertGVGWarband({
      id: Number(rawWarband.id),
      season: GVG_SEASON,
      tid: Number(rawWarband.tid),
      icon: Number(rawWarband.icon),
      frame: Number(rawWarband.frame),
      name: `${rawWarband.name}`,
      name_changed: rawWarband.name_changed,
      warband_last_settle_score: Number(rawWarband.warband_last_settle_score),
      settle_ts: Number(rawWarband.settle_ts),
    });

    await upsertUserSummaries(
      (rawWarband.members as unknown as Array<NewGVGWarbandMember & { member_summary: NewUserSummary }>).map((user) => {
        return {
          ...user.member_summary,
          uid: Number(user.member_summary.uid),
        };
      }),
    );

    if (rawWarband.members) {
      await upsertGVGWarbandMembers(
        rawWarband.members.map((user) => {
          return {
            uid: Number(user.member_summary.uid),
            season: GVG_SEASON,
            warband_id: Number.parseInt(rawWarband.id),
            gs: Number.parseInt(user.gs),
            last_settle_score: Number.parseInt(user.last_settle_score),
            dig_secs: Number.parseInt(user.dig_secs),
            title: user.title as unknown as NewGVGWarbandMember['title'],
            occ_block_id: user.occ_block_id ? Number.parseInt(user.occ_block_id) : undefined,
            is_robot: user.is_robot,
          };
        }),
      );
    }
  } else if (isReplyGvgOpenRank(downMessage) && isReqGvgOpenRank(upMessage)) {
    logger.debug('Found `reply_gvg.open_rank.rank_summaries`');
    const rawRanks = downMessage.reply_gvg.open_rank.rank_summaries;
    const rankType = upMessage.req_gvg.open_rank.rank as unknown as string;
    if (rankType !== 'kill_cnt') {
      return;
    }

    for (const ranking of rawRanks) {
      await updateGVGWarbandMemberRanking(
        {
          uid: Number(ranking.uid),
          kills: Number.parseInt(ranking.fraction),
        },
        GVG_SEASON,
      );
    }
  } else if (isReplyExtraGvgMapChangeChangedBlocks(downMessage) && sender === 'naji') {
    logger.debug('Found `reply_extra.reply_extra_gvg.map_change.changed_blocks`');
    const changedBlocks = downMessage.reply_extra.reply_extra_gvg.map_change.changed_blocks.filter(
      (block): block is RequireKeysDeep<hgame.Ireply_gvg_block, 'reply_gvg_object'> => {
        if (!block.reply_gvg_object) {
          return false;
        }
        if (block.reply_gvg_object.uid || block.reply_gvg_object.battle_ts_list) {
          return false;
        }

        return (
          block.reply_gvg_object.tid in tidToInitialScore &&
          Number.parseInt(block.reply_gvg_object.left_score) ===
            tidToInitialScore[block.reply_gvg_object.tid as keyof typeof tidToInitialScore]
        );
      },
    );

    if (changedBlocks.length === 0) {
      return;
    }

    await upsertGVGBlockHistory(
      changedBlocks.map((block) => ({
        time: forcedTime,
        block_id: Number.parseInt(block.id),
        object_tid: Number.parseInt(block.reply_gvg_object.tid),
        object_left_score: Number.parseInt(block.reply_gvg_object.left_score),
        object_mine_id: Number.parseInt(block.reply_gvg_object.mine_id),
        object_uid: block.reply_gvg_object.uid ? Number.parseInt(block.reply_gvg_object.uid) : undefined,
        object_warband_id: block.reply_gvg_object.warband_id
          ? Number.parseInt(block.reply_gvg_object.warband_id)
          : undefined,
        object_last_sync_ts: block.reply_gvg_object.last_sync_ts
          ? Number.parseInt(block.reply_gvg_object.last_sync_ts)
          : undefined,
        object_occ_ts: block.reply_gvg_object.occ_ts ? Number.parseInt(block.reply_gvg_object.occ_ts) : undefined,
      })),
    );

    logger.debug(changedBlocks);
  } else if (isReplyGuildSearchGuild(downMessage)) {
    logger.debug('Found `reply_guild.search_guild.guilds`');
    const guilds = downMessage.reply_guild.search_guild.guilds;

    if (guilds.length === 0) {
      return;
    }

    await upsertGuilds(
      guilds.map((guild) => ({
        ...guild,
        id: Number(guild.id),
        name: `${guild.name}`,
        lang: `${guild.lang}`,
        join_type: guild.join_type as unknown as NewGuild['join_type'],
        nameplates: guild.nameplates as unknown as NewGuild['nameplates'],
      })),
    );
  } else if (isReplyGuildMembers(downMessage)) {
    logger.debug('Found `reply_guild.guild_members.members`');
    const guildMembers = downMessage.reply_guild.guild_members.members;

    await upsertUserSummaries(
      (guildMembers as unknown as Array<NewGVGWarbandMember & { summary: NewUserSummary }>).map((user) => {
        return {
          ...user.summary,
          uid: Number(user.summary.uid),
        };
      }),
    );

    await upsertGuildMembers(
      guildMembers.map((guildMember) => {
        return {
          // biome-ignore lint/style/noNonNullAssertion: mandatory here
          uid: Number(guildMember.summary!.uid),
          // biome-ignore lint/style/noNonNullAssertion: mandatory here
          guild_id: Number(guildMember.summary!.guild_id),
          recent_active_point: guildMember.recent_active_point,
          enter_time: Number.parseInt(guildMember.enter_time),
        };
      }),
    );
  } else if (isReplySlgWarbandOpenRankBoard(downMessage)) {
    logger.debug('Found `reply_slg_warband.open_rank_board.rank_boards`');
    const rankBoards = downMessage.reply_slg_warband.open_rank_board.rank_boards;
    const damageWarbandIds: number[] = [];
    const coinWarbandIds: number[] = [];
    const slgWarbands: Record<number, NewSLGWarband> = {};
    const slgWarbandRankings: Record<number, NewSLGWarbandRanking> = {};

    const appendWarband = (
      type: 'slg_boss_damage' | 'slg_coins',
      warband: hgame.Ireply_slg_warband_rank_board_entry,
    ) => {
      const warbandId = Number.parseInt(warband.id);
      if (type === 'slg_boss_damage') {
        damageWarbandIds.push(warbandId);
      } else {
        coinWarbandIds.push(warbandId);
      }
      if (!(warbandId in slgWarbands)) {
        slgWarbands[warbandId] = {
          id: warbandId,
          season: SLG_SEASON,
          icon: warband.icon,
          name: warband.name,
        };
      }
      const point = type === 'slg_boss_damage' ? warband.point * 1e6 : warband.point;
      if (!(warbandId in slgWarbandRankings)) {
        slgWarbandRankings[warbandId] = {
          warband_id: warbandId,
          season: SLG_SEASON,
          [`${type}_rank`]: warband.rank,
          [`${type}_point`]: point,
        };
      } else {
        slgWarbandRankings[warbandId][`${type}_rank`] = warband.rank;
        slgWarbandRankings[warbandId][`${type}_point`] = point;
      }
    };

    rankBoards.forEach((rankBoard) => {
      const type = rankBoard.type as unknown as 'slg_boss_damage' | 'slg_coins';
      rankBoard.warbands?.forEach((warband) => {
        appendWarband(type, warband);
      });

      if (rankBoard.self) {
        appendWarband(type, rankBoard.self);
      }
    });

    if (Object.values(slgWarbands).length > 0) {
      await upsertSLGWarbands(Object.values(slgWarbands));
    }

    if (Object.values(slgWarbandRankings).length > 0) {
      await upsertSLGWarbandRankings(Object.values(slgWarbandRankings));
      await clearDamageRankingOfWarbandNotInList(SLG_SEASON, damageWarbandIds);
      await clearCoinsRankingOfWarbandNotInList(SLG_SEASON, coinWarbandIds);
    }
  } else if (isReplySlgWarbandOpenRankBoardSubPanel(downMessage) && isReqSlgWarbandOpenRankBoardSubPanel(upMessage)) {
    logger.debug('Found `reply_slg_warband.open_rank_board_sub_panel`');
    const openRankBoardSubPanelRequest = upMessage.req_slg_warband.open_rank_board_sub_panel;
    const warbandId = Number.parseInt(openRankBoardSubPanelRequest.warband_id);
    const type = openRankBoardSubPanelRequest.type as unknown as 'slg_boss_damage' | 'slg_coins';

    const { summaries, uid2params } = downMessage.reply_slg_warband.open_rank_board_sub_panel;
    if (summaries) {
      const guildIds: Record<number, number> = {};

      await upsertUserSummaries(
        (summaries as unknown as Array<NewSLGWarbandUser>).map((user) => {
          const guildId = user.guild_id;
          if (guildId) {
            if (!(guildId in guildIds)) {
              guildIds[guildId] = 0;
            }

            guildIds[guildId] += 1;
          }
          return {
            ...user,
            uid: Number(user.uid),
          };
        }),
      );

      const mostCommonGuildId = (Object.keys(guildIds) as unknown as Array<keyof typeof guildIds>).reduce(
        (mostCommonGuildId, guildId) => {
          if (mostCommonGuildId === 0) {
            return Number.parseInt(`${guildId}`);
          }
          if (guildIds[guildId] > guildIds[mostCommonGuildId]) {
            return Number.parseInt(`${guildId}`);
          }

          return mostCommonGuildId;
        },
        0,
      );
      if (mostCommonGuildId) {
        await setSLGWarbandGuildId(SLG_SEASON, warbandId, mostCommonGuildId);
      }
    }

    if (!uid2params) {
      return;
    }

    const slgWarbandMemberRankings: NewSLGWarbandMemberRanking[] = Object.keys(uid2params).reduce<
      NewSLGWarbandMemberRanking[]
    >((rankings, uid) => {
      rankings.push({
        uid: Number.parseInt(uid),
        warband_id: warbandId,
        season: SLG_SEASON,
        [`${type}_rank`]: undefined,
        [`${type}_point`]: Number.parseInt(uid2params[uid]),
      });
      return rankings;
    }, []);
    await upsertSLGWarbandMemberRankings(
      slgWarbandMemberRankings
        .sort((rankingA, rankingB) => {
          const pointA = rankingB[`${type}_point`] || 0;
          const pointB = rankingA[`${type}_point`] || 0;
          if (pointA === pointB) {
            return rankingA.uid - rankingB.uid;
          }
          return pointA - pointB;
        })
        .map((ranking, index) => {
          return {
            ...ranking,
            [`${type}_rank`]: index + 1,
          };
        }),
    );
  }
};
