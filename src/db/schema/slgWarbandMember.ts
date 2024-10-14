import { asc, eq, sql } from 'drizzle-orm';
import { int, mediumint, mysqlEnum, mysqlTable, primaryKey, tinyint, varchar } from 'drizzle-orm/mysql-core';

import { getDbClient } from '../client';
import { slgWarband } from './slgWarband';
import { type UserSummary, userSummary } from './userSummary';

export const slgWarbandMember = mysqlTable(
  'slg__warband_member',
  {
    uid: int('uid')
      .primaryKey()
      .references(() => userSummary.uid),
    warband_id: int('warband_id').references(() => slgWarband.id),
    gs: varchar('gs', { length: 16 }),
    nobility: tinyint('nobility'),
    title: mysqlEnum('title', ['chairman', 'leader', 'member']),
    guild_id: mediumint('guild_id'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.uid, table.warband_id] }),
    };
  },
);

export type SLGWarbandMember = typeof slgWarbandMember.$inferSelect;
export type NewSLGWarbandMember = typeof slgWarbandMember.$inferInsert;

export const upsertWarbandUsers = async (newSLGWarbandUsers: NewSLGWarbandMember[]) => {
  return (await getDbClient())
    .insert(slgWarbandMember)
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
  slg__warband_member: SLGWarbandMember;
  user_summary: UserSummary | null;
}

export const getAllMembersOfSLGWarband = async (warbandId: number): Promise<WarbandUserAndSummary[]> => {
  return (await getDbClient())
    .select()
    .from(slgWarbandMember)
    .leftJoin(userSummary, eq(slgWarbandMember.uid, userSummary.uid))
    .where(eq(slgWarbandMember.warband_id, warbandId))
    .orderBy(asc(userSummary.name));
};
