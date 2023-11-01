import { upsertWarband } from './db/schema/warband.ts';
import { NewUserSummary, upsertUserSummaries } from './db/schema/userSummary.ts';
import { NewWarbandUser, upsertWarbandUsers } from './db/schema/warbandUser.ts';
import { JSONObject } from './types.ts';

  if (
    'reply_slg_warband' in message &&
    typeof message.reply_slg_warband === 'object' &&
    'open_panel' in message.reply_slg_warband &&
    typeof message.reply_slg_warband.open_panel === 'object' &&
    !Array.isArray(message.reply_slg_warband.open_panel)
  ) {
export const saveMessageInDatabase = async (message: JSONObject, logMatch = false): Promise<void> => {
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
  }
};
