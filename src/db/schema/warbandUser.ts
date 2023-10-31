import { int, mysqlEnum, mysqlTable, varchar, mediumint, tinyint } from 'drizzle-orm/mysql-core';
import { userSummary } from './userSummary.ts';
import { warband } from './warband.ts';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

export const warbandUser = mysqlTable('warband_user', {
  uid: int('uid')
    .primaryKey()
    .references(() => userSummary.uid),
  warband_id: int('warband_id').references(() => warband.id),
  gs: varchar('gs', { length: 16 }),
  nobility: tinyint('nobility'),
  title: mysqlEnum('title', ['chairman', 'leader', 'member']),
  guild_id: mediumint('guild_id'),
});

export type WarbandUser = typeof warbandUser.$inferSelect;
export type NewWarbandUser = typeof warbandUser.$inferInsert;

export const upsertWarbandUsers = async (newWarbandUsers: NewWarbandUser[]) => {
  return (await getDbClient())
    .insert(warbandUser)
    .values(newWarbandUsers)
    .onDuplicateKeyUpdate({
      set: {
        uid: sql`uid`,
        warband_id: sql`warband_id`,
        gs: sql`gs`,
        nobility: sql`nobility`,
        title: sql`title`,
        guild_id: sql`guild_id`,
      },
    });
};
