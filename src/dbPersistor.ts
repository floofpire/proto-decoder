import { upsertSLGWarband } from './db/schema/slgWarband.ts';
import { NewUserSummary, upsertUserSummaries } from './db/schema/userSummary.ts';
import { NewSLGWarbandUser, upsertWarbandUsers } from './db/schema/slgWarbandUser.ts';
import { SLGNewBlock, upsertSLGBlocks } from './db/schema/slgBlock.ts';
import {
  isReplyExtraGvgMapChangeChangedBlocks,
  isReplyGvgOpenRank,
  isReplyGvgWarbandDeal,
  isReplySlgOpenMiniMap,
  isReplySlgOpenPanel,
  isReplySlgQueryBlocks,
  isReplySlgQueryMapWithBlocks,
  isReplySlgWarbandDownMessage,
  Message,
} from './protos.ts';
import { upsertGVGWarband } from './db/schema/gvgWarband.ts';
import {
  NewGVGWarbandMember,
  updateGVGWarbandMemberRanking,
  upsertGVGWarbandMembers,
} from './db/schema/gvgWarbandMember.ts';
import { logger } from './logger.ts';
import { upsertGVGBlockHistory } from './db/schema/gvgBlockHistory.ts';
import { RequireKeysDeep } from './types.ts';
import { hgame } from './afkprotos';

const COORD_Z = 1e6,
  COORD_X = 1e3,
  COORD_Y = 1;
const getBlockCoord = function (blockId: number) {
  const floor = Math.floor(blockId / COORD_Z);
  blockId %= floor * COORD_Z;
  return {
    x: Math.floor(blockId / COORD_X) - 1,
    y: (blockId % COORD_X) - 1,
    z: floor,
  };
};

const tidToInitialScore = {
  '1': 7200,
  '2': 21600,
  '3': 64800,
} as const;

export const saveMessageInDatabase = async (message: Message, sender: string, forcedTime?: number): Promise<void> => {
  if (isReplySlgWarbandDownMessage(message)) {
    logger.debug('Found `reply_slg_warband.open_panel`');
    const panel = message.reply_slg_warband.open_panel;

    await upsertSLGWarband({
      id: Number(panel.id),
      icon: Number(panel.icon),
      name: `${panel.name}`,
      map_end_ts: Number(panel.map_end_ts),
      name_modify_ts: Number(panel.name_modify_ts),
      name_prohibited_ts: Number(panel.name_prohibited_ts),
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
  } else if (isReplySlgOpenPanel(message)) {
    logger.debug('Found `reply_slg.open_panel`');
    const occupiedBlocks = message.reply_slg.open_panel.occupied_blocks as unknown as SLGNewBlock[];

    await upsertSLGBlocks(
      occupiedBlocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
        };
      }),
    );
  } else if (isReplySlgQueryBlocks(message)) {
    logger.debug('Found `reply_slg.query_blocks.blocks`');
    const blocks = message.reply_slg.query_blocks.blocks as unknown as SLGNewBlock[];

    await upsertSLGBlocks(
      blocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
        };
      }),
    );
  } else if (isReplySlgQueryMapWithBlocks(message)) {
    logger.debug('Found `reply_slg.query_map.blocks`');
    const blocks = message.reply_slg._query_map.blocks;

    await upsertSLGBlocks(
      blocks.map((block) => {
        const coords = getBlockCoord(block.id);

        return {
          ...block,
          bonus_param: block.active_bonus_param,
          _x: coords.x,
          _y: coords.y,
          _z: coords.z,
        };
      }),
    );
  } else if (isReplySlgOpenMiniMap(message)) {
    logger.debug('Found `reply_slg.open_mini_map.occ_list`');
    const occList = message.reply_slg.open_mini_map.occ_list;
    const newBlocks = occList.reduce<SLGNewBlock[]>((newBlocks, occupation) => {
      const owner = Number(occupation.uid);

      if (occupation.block_group_id_map) {
        newBlocks = newBlocks.concat(
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
            };
          }),
        );
      }

      return newBlocks;
    }, []);

    await upsertSLGBlocks(newBlocks);
  } else if (isReplyGvgWarbandDeal(message)) {
    logger.debug('Found `reply_gvg.reply_gvg_warband_deal.open_warband`');
    const rawWarband = message.reply_gvg.reply_gvg_warband_deal.open_warband;

    await upsertGVGWarband({
      id: Number(rawWarband.id),
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
            warband_id: parseInt(rawWarband.id),
            gs: parseInt(user.gs),
            last_settle_score: parseInt(user.last_settle_score),
            dig_secs: parseInt(user.dig_secs),
            title: user.title as unknown as NewGVGWarbandMember['title'],
            occ_block_id: user.occ_block_id ? parseInt(user.occ_block_id) : undefined,
            is_robot: user.is_robot,
          };
        }),
      );
    }
  } else if (isReplyGvgOpenRank(message)) {
    logger.debug('Found `reply_gvg.open_rank.rank_summaries`');
    const rawRanks = message.reply_gvg.open_rank.rank_summaries;

    for (const ranking of rawRanks) {
      if (parseInt(ranking.fraction) > 100) {
        continue;
      }
      await updateGVGWarbandMemberRanking({
        uid: Number(ranking.uid),
        kills: parseInt(ranking.fraction),
      });
    }
  } else if (isReplyExtraGvgMapChangeChangedBlocks(message) && sender === 'naji') {
    logger.debug('Found `reply_extra.reply_extra_gvg.map_change.changed_blocks`');
    const changedBlocks = message.reply_extra.reply_extra_gvg.map_change.changed_blocks.filter(
      (block): block is RequireKeysDeep<hgame.Ireply_gvg_block, 'reply_gvg_object'> => {
        if (!block.reply_gvg_object) {
          return false;
        }
        if (block.reply_gvg_object.uid || block.reply_gvg_object.battle_ts_list) {
          return false;
        }

        return (
          block.reply_gvg_object.tid in tidToInitialScore &&
          parseInt(block.reply_gvg_object.left_score) ===
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
        block_id: parseInt(block.id),
        object_tid: parseInt(block.reply_gvg_object.tid),
        object_left_score: parseInt(block.reply_gvg_object.left_score),
        object_mine_id: parseInt(block.reply_gvg_object.mine_id),
        object_uid: block.reply_gvg_object.uid ? parseInt(block.reply_gvg_object.uid) : undefined,
        object_warband_id: block.reply_gvg_object.warband_id ? parseInt(block.reply_gvg_object.warband_id) : undefined,
        object_last_sync_ts: block.reply_gvg_object.last_sync_ts
          ? parseInt(block.reply_gvg_object.last_sync_ts)
          : undefined,
        object_occ_ts: block.reply_gvg_object.occ_ts ? parseInt(block.reply_gvg_object.occ_ts) : undefined,
      })),
    );

    logger.debug(changedBlocks);
  }
};
