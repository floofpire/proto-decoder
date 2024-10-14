import { and, eq, notInArray, sql } from 'drizzle-orm';
import { bigint, int, mysqlTable, primaryKey, varchar } from 'drizzle-orm/mysql-core';

import { getDbClient } from '../client';
import { slgWarband } from './slgWarband';

export const slgWarbandRanking = mysqlTable(
  'slg__warband_ranking',
  {
    warband_id: int('warband_id')
      .references(() => slgWarband.id)
      .notNull(),
    season: varchar('season', { length: 4 }).notNull(),
    slg_coins_rank: int('slg_coins_rank'),
    slg_coins_point: bigint('slg_coins_point', { mode: 'number' }),
    slg_boss_damage_rank: int('slg_boss_damage_rank'),
    slg_boss_damage_point: bigint('slg_boss_damage_point', { mode: 'number' }),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.warband_id, table.season] }),
    };
  },
);

export type SLGWarbandRanking = typeof slgWarbandRanking.$inferSelect;
export type NewSLGWarbandRanking = typeof slgWarbandRanking.$inferInsert;

export const upsertSLGWarbandRankings = async (newSLGWarbandRankings: NewSLGWarbandRanking[]) => {
  return (await getDbClient())
    .insert(slgWarbandRanking)
    .values(newSLGWarbandRankings)
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

export const clearCoinsRankingOfWarbandNotInList = async (season: string, warbandIds: number[]) => {
  return (await getDbClient())
    .update(slgWarbandRanking)
    .set({ slg_coins_rank: sql`NULL`, slg_coins_point: sql`NULL`, updated_at: sql`UNIX_TIMESTAMP()` })
    .where(and(eq(slgWarbandRanking.season, season), notInArray(slgWarbandRanking.warband_id, warbandIds)));
};

export const clearDamageRankingOfWarbandNotInList = async (season: string, warbandIds: number[]) => {
  return (await getDbClient())
    .update(slgWarbandRanking)
    .set({ slg_boss_damage_rank: sql`NULL`, slg_boss_damage_point: sql`NULL`, updated_at: sql`UNIX_TIMESTAMP()` })
    .where(and(eq(slgWarbandRanking.season, season), notInArray(slgWarbandRanking.warband_id, warbandIds)));
};
