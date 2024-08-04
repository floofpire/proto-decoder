import { int, mysqlTable, bigint, tinyint, smallint, primaryKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { getDbClient } from '../client';

export const gvgBlockHistory = mysqlTable(
  'gvg__block_history',
  {
    time: bigint('time', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
    block_id: int('block_id').notNull(),
    object_tid: tinyint('object_tid').notNull(),
    object_left_score: int('object_left_score').notNull(),
    object_mine_id: smallint('object_mine_id').notNull(),
    object_uid: int('object_uid'),
    object_warband_id: int('object_warband_id'),
    object_last_sync_ts: bigint('object_last_sync_ts', { mode: 'number' }),
    object_occ_ts: bigint('object_occ_ts', { mode: 'number' }),
  },
  (table) => {
    return {
      pk: primaryKey(table.time, table.block_id),
    };
  },
);

export type GVGBlockHistory = typeof gvgBlockHistory.$inferSelect;
export type NewGVGBlockHistory = typeof gvgBlockHistory.$inferInsert;

export const upsertGVGBlockHistory = async (newGVGBlockHistory: NewGVGBlockHistory[]) => {
  return (await getDbClient())
    .insert(gvgBlockHistory)
    .values(newGVGBlockHistory)
    .onDuplicateKeyUpdate({
      set: {
        object_tid: sql`VALUES(${sql.identifier('object_tid')})`,
        object_left_score: sql`VALUES(${sql.identifier('object_left_score')})`,
        object_mine_id: sql`VALUES(${sql.identifier('object_mine_id')})`,
        object_uid: sql`VALUES(${sql.identifier('object_uid')})`,
        object_warband_id: sql`VALUES(${sql.identifier('object_warband_id')})`,
        object_last_sync_ts: sql`VALUES(${sql.identifier('object_last_sync_ts')})`,
        object_occ_ts: sql`VALUES(${sql.identifier('object_occ_ts')})`,
      },
    });
};
