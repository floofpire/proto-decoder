import { int, mysqlEnum, mysqlTable, varchar, mediumint, tinyint } from 'drizzle-orm/mysql-core';
import { sql, eq, asc } from 'drizzle-orm';

import { UserSummary, userSummary } from './userSummary';
import { slgWarband } from './slgWarband';
import { getDbClient } from '../client';

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

interface WarbandUserAndSummary {
  slg__warband_user: SLGWarbandUser;
  user_summary: UserSummary | null;
}

export const getAllMembersOfSLGWarband = async (warbandId: number): Promise<WarbandUserAndSummary[]> => {
  return (await getDbClient())
    .select()
    .from(slgWarbandUser)
    .leftJoin(userSummary, eq(slgWarbandUser.uid, userSummary.uid))
    .where(eq(slgWarbandUser.warband_id, warbandId))
    .orderBy(asc(userSummary.name));
};
