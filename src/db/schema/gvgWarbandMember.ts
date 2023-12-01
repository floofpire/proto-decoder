import { int, mysqlEnum, mysqlTable, mediumint, bigint, boolean, smallint } from 'drizzle-orm/mysql-core';
import { sql, eq, asc } from 'drizzle-orm';

import { UserSummary, userSummary } from './userSummary';
import { gvgWarband } from './gvgWarband';
import { getDbClient } from '../client';

export const gvgWarbandMember = mysqlTable('gvg__warband_member', {
  uid: int('uid')
    .primaryKey()
    .references(() => userSummary.uid),
  warband_id: int('warband_id').references(() => gvgWarband.id),
  gs: bigint('gs', { mode: 'number' }).notNull(),
  last_settle_score: mediumint('last_settle_score').notNull(),
  dig_secs: mediumint('dig_secs').notNull(),
  title: mysqlEnum('title', ['chairman', 'leader', 'member']).notNull(),
  occ_block_id: int('occ_block_id'),
  kills: smallint('kills'),
  is_robot: boolean('is_robot'),
});

export type GVGWarbandMember = typeof gvgWarbandMember.$inferSelect;
export type NewGVGWarbandMember = typeof gvgWarbandMember.$inferInsert;

export const upsertGVGWarbandMembers = async (newGVGWarbandMembers: NewGVGWarbandMember[]) => {
  return (await getDbClient())
    .insert(gvgWarbandMember)
    .values(newGVGWarbandMembers)
    .onDuplicateKeyUpdate({
      set: {
        gs: sql`COALESCE(VALUES(${sql.identifier('gs')}), ${sql.identifier('gs')})`,
        last_settle_score: sql`COALESCE(VALUES(${sql.identifier('last_settle_score')}), ${sql.identifier(
          'last_settle_score',
        )})`,
        dig_secs: sql`COALESCE(VALUES(${sql.identifier('dig_secs')}), ${sql.identifier('dig_secs')})`,
        occ_block_id: sql`COALESCE(VALUES(${sql.identifier('occ_block_id')}), ${sql.identifier('occ_block_id')})`,
        kills: sql`COALESCE(VALUES(${sql.identifier('kills')}), ${sql.identifier('kills')})`,
      },
    });
};

export const updateGVGWarbandMemberRanking = async (
  newGVGWarbandMember: Pick<NewGVGWarbandMember, 'uid' | 'kills'>,
) => {
  return (await getDbClient())
    .update(gvgWarbandMember)
    .set({ kills: newGVGWarbandMember.kills })
    .where(eq(gvgWarbandMember.uid, newGVGWarbandMember.uid));
};

interface WarbandUserAndSummary {
  gvg__warband_member: GVGWarbandMember;
  user_summary: UserSummary | null;
}

export const getAllMembersOfGVGWarband = async (warbandId: number): Promise<WarbandUserAndSummary[]> => {
  return (await getDbClient())
    .select()
    .from(gvgWarbandMember)
    .leftJoin(userSummary, eq(gvgWarbandMember.uid, userSummary.uid))
    .where(eq(gvgWarbandMember.warband_id, warbandId))
    .orderBy(asc(gvgWarbandMember.uid));
};
