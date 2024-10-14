import { and, asc, eq, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  int,
  mediumint,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  smallint,
  varchar,
} from 'drizzle-orm/mysql-core';

import { getDbClient } from '../client';
import { gvgWarband } from './gvgWarband';
import { type GVGWarbandMemberSnapshot, gvgWarbandMemberSnapshot } from './gvgWarbandMemberSnapshot';
import { type UserSummary, userSummary } from './userSummary';

export const gvgWarbandMember = mysqlTable(
  'gvg__warband_member',
  {
    uid: int('uid')
      .references(() => userSummary.uid)
      .notNull(),
    warband_id: int('warband_id').references(() => gvgWarband.id),
    season: varchar('season', { length: 4 }).notNull().default('S1'),
    gs: bigint('gs', { mode: 'number' }).notNull(),
    last_settle_score: mediumint('last_settle_score').notNull(),
    dig_secs: mediumint('dig_secs').notNull(),
    title: mysqlEnum('title', ['chairman', 'leader', 'member']).notNull(),
    occ_block_id: int('occ_block_id'),
    kills: smallint('kills'),
    is_robot: boolean('is_robot'),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.uid, table.warband_id] }),
    };
  },
);

export type GVGWarbandMember = typeof gvgWarbandMember.$inferSelect;
export type NewGVGWarbandMember = Exclude<typeof gvgWarbandMember.$inferInsert, 'created_at' | 'updated_at'>;

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
        updated_at: sql`UNIX_TIMESTAMP()`,
      },
    });
};

export const updateGVGWarbandMemberRanking = async (
  newGVGWarbandMember: Pick<NewGVGWarbandMember, 'uid' | 'kills'>,
  season: string,
) => {
  return (await getDbClient())
    .update(gvgWarbandMember)
    .set({ kills: newGVGWarbandMember.kills, updated_at: sql`UNIX_TIMESTAMP()` })
    .where(and(eq(gvgWarbandMember.uid, newGVGWarbandMember.uid), eq(gvgWarbandMember.season, season)));
};

interface WarbandUserAndSummary {
  gvg__warband_member: GVGWarbandMember;
  user_summary: UserSummary | null;
  gvg__warband_member_snapshot?: GVGWarbandMemberSnapshot | null;
}

export const getAllMembersOfGVGWarband = async (
  warbandId: number,
  timestamp?: number,
): Promise<WarbandUserAndSummary[]> => {
  const query = (await getDbClient())
    .select()
    .from(gvgWarbandMember)
    .leftJoin(userSummary, eq(gvgWarbandMember.uid, userSummary.uid))
    .where(eq(gvgWarbandMember.warband_id, warbandId))
    .orderBy(asc(userSummary.name));

  if (timestamp) {
    query.leftJoin(
      gvgWarbandMemberSnapshot,
      and(
        eq(gvgWarbandMember.uid, gvgWarbandMemberSnapshot.uid),
        eq(gvgWarbandMember.warband_id, gvgWarbandMemberSnapshot.warband_id),
        eq(gvgWarbandMemberSnapshot.dump_time, timestamp),
      ),
    );
  }

  return query;
};
