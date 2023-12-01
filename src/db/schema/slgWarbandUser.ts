import { int, mysqlEnum, mysqlTable, varchar, mediumint, tinyint } from 'drizzle-orm/mysql-core';
import { userSummary } from './userSummary.ts';
import { slgWarband } from './slgWarband.ts';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

export const slgWarbandUser = mysqlTable('slg__warband_user', {
  uid: int('uid')
    .primaryKey()
    .references(() => userSummary.uid),
  warband_id: int('warband_id').references(() => slgWarband.id),
  gs: varchar('gs', { length: 16 }),
  nobility: tinyint('nobility'),
  title: mysqlEnum('title', ['chairman', 'leader', 'member']),
  guild_id: mediumint('guild_id'),
});

export type SLGWarbandUser = typeof slgWarbandUser.$inferSelect;
export type NewSLGWarbandUser = typeof slgWarbandUser.$inferInsert;

export const upsertWarbandUsers = async (newSLGWarbandUsers: NewSLGWarbandUser[]) => {
  return (await getDbClient())
    .insert(slgWarbandUser)
    .values(newSLGWarbandUsers)
    .onDuplicateKeyUpdate({
      set: {
        gs: sql`COALESCE(VALUES(${sql.identifier('gs')}), ${sql.identifier('gs')})`,
        nobility: sql`COALESCE(VALUES(${sql.identifier('nobility')}), ${sql.identifier('nobility')})`,
        title: sql`COALESCE(VALUES(${sql.identifier('title')}), ${sql.identifier('title')})`,
        guild_id: sql`COALESCE(VALUES(${sql.identifier('guild_id')}), ${sql.identifier('guild_id')})`,
      },
    });
};
