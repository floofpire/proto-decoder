import { upsertWarband } from './db/schema/warband.ts';
import { NewUserSummary, upsertUserSummaries } from './db/schema/userSummary.ts';
import { NewWarbandUser, upsertWarbandUsers } from './db/schema/warbandUser.ts';
import { NewBlock, upsertBlocks } from './db/schema/block.ts';
import {
  isReplySlgOpenMiniMap,
  isReplySlgOpenPanel,
  isReplySlgQueryBlocks,
  isReplySlgQueryMapWithBlocks,
  isReplySlgWarbandDownMessage,
  Message,
} from './protos.ts';

const COORD_Z = 1e6,
  COORD_X = 1e3,
  COORD_Y = 1;
const getBlockCoord = function (blockId: number) {
  const floor = Math.floor(blockId / COORD_Z);
  blockId %= floor * COORD_Z;
  return { x: Math.floor(blockId / COORD_X) - 1, y: (blockId % COORD_X) - 1, z: floor };
};

export const saveMessageInDatabase = async (message: Message, logMatch = false): Promise<void> => {
  if (isReplySlgWarbandDownMessage(message)) {
    if (logMatch) {
      console.log('Found `reply_slg_warband.open_panel`');
    }
    const panel = message.reply_slg_warband.open_panel;

    await upsertWarband({
      id: Number(panel.id),
      icon: Number(panel.icon),
      name: `${panel.name}`,
      map_end_ts: Number(panel.map_end_ts),
      name_modify_ts: Number(panel.name_modify_ts),
      name_prohibited_ts: Number(panel.name_prohibited_ts),
    });

    await upsertUserSummaries(
      (panel.users as unknown as Array<NewWarbandUser & { summary: NewUserSummary }>).map((user) => {
        return {
          ...user.summary,
          uid: Number(user.summary.uid),
        };
      }),
    );

    await upsertWarbandUsers(
      (panel.users as unknown as Array<NewWarbandUser & { summary: NewUserSummary }>).map((user) => {
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
    if (logMatch) {
      console.log('Found `reply_slg.open_panel`');
    }
    const occupiedBlocks = message.reply_slg.open_panel.occupied_blocks as unknown as NewBlock[];

    await upsertBlocks(
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
    if (logMatch) {
      console.log('Found `reply_slg.query_blocks.blocks`');
    }
    const blocks = message.reply_slg.query_blocks.blocks as unknown as NewBlock[];

    await upsertBlocks(
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
    if (logMatch) {
      console.log('Found `reply_slg.query_map.blocks`');
    }
    const blocks = message.reply_slg.query_map.blocks as unknown as NewBlock[];

    await upsertBlocks(
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
    if (logMatch) {
      console.log('Found `reply_slg.open_mini_map.occ_list`');
    }
    const occList = message.reply_slg.open_mini_map.occ_list;
    const newBlocks = occList.reduce<NewBlock[]>((newBlocks, occupation) => {
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

    await upsertBlocks(newBlocks);
  }
};
