import { int, mysqlTable, bigint, primaryKey, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { getDbClient } from '../client';
import { userSummary } from './userSummary';
import { slgWarband } from './slgWarband';

export const slgWarbandMemberRanking = mysqlTable(
  'slg__warband_member_ranking',
  {
    uid: int('uid')
      .references(() => userSummary.uid)
      .notNull(),
    season: varchar('season', { length: 4 }).notNull(),
    warband_id: int('warband_id')
      .references(() => slgWarband.id)
      .notNull(),
    slg_coins_rank: int('slg_coins_rank'),
    slg_coins_point: bigint('slg_coins_point', { mode: 'number' }),
    slg_boss_damage_rank: int('slg_boss_damage_rank'),
    slg_boss_damage_point: bigint('slg_boss_damage_point', { mode: 'number' }),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
  },
  (table) => {
    return {
      pk: primaryKey(table.uid, table.season),
    };
  },
);

export type SLGWarbandMemberRanking = typeof slgWarbandMemberRanking.$inferSelect;
export type NewSLGWarbandMemberRanking = typeof slgWarbandMemberRanking.$inferInsert;

export const upsertSLGWarbandMemberRankings = async (newSLGWarbandMemberRankings: NewSLGWarbandMemberRanking[]) => {
  return (await getDbClient())
    .insert(slgWarbandMemberRanking)
    .values(newSLGWarbandMemberRankings)
    .onDuplicateKeyUpdate({
      set: {
        slg_coins_rank: sql`COALESCE(VALUES(${sql.identifier('slg_coins_rank')}), ${sql.identifier('slg_coins_rank')})`,
        slg_coins_point: sql`COALESCE(VALUES(${sql.identifier('slg_coins_point')}), ${sql.identifier(
          'slg_coins_point',
        )})`,
        slg_boss_damage_rank: sql`COALESCE(VALUES(${sql.identifier('slg_boss_damage_rank')}), ${sql.identifier(
          'slg_boss_damage_rank',
        )})`,
        slg_boss_damage_point: sql`COALESCE(VALUES(${sql.identifier('slg_boss_damage_point')}), ${sql.identifier(
          'slg_boss_damage_point',
        )})`,
        updated_at: sql`UNIX_TIMESTAMP()`,
      },
    });
};
