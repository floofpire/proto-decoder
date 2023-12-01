import { upsertSLGWarband } from './db/schema/slgWarband.ts';
import { NewUserSummary, upsertUserSummaries } from './db/schema/userSummary.ts';
import { NewSLGWarbandUser, upsertWarbandUsers } from './db/schema/slgWarbandUser.ts';
import { SLGNewBlock, upsertSLGBlocks } from './db/schema/slgBlock.ts';
import {
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

export const saveMessageInDatabase = async (message: Message): Promise<void> => {
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
    const blocks = message.reply_slg.query_map.blocks as unknown as SLGNewBlock[];

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

      newBlocks = newBlocks.concat(
        Object.keys(occupation.block_group_id_map).map((blockId) => {
          const id = Number(blockId);
          const coords = getBlockCoord(id);
          return {
            id,
            owner,
            group: Number(occupation.block_group_id_map[blockId]),
            _x: coords.x,
            _y: coords.y,
            _z: coords.z,
          };
        }),
      );

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

    await upsertGVGWarbandMembers(
      rawWarband.members.map((user) => {
        return {
          uid: Number(user.member_summary.uid),
          warband_id: parseInt(rawWarband.id),
          gs: parseInt(user.gs),
          last_settle_score: parseInt(user.last_settle_score),
          dig_secs: parseInt(user.dig_secs),
          title: user.title as NewGVGWarbandMember['title'],
          occ_block_id: user.occ_block_id ? parseInt(user.occ_block_id) : undefined,
          is_robot: user.is_robot,
        };
      }),
    );
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
  }
};
