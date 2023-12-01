import { int, mysqlTable, bigint, varchar, tinyint, boolean } from 'drizzle-orm/mysql-core';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

export const gvgWarband = mysqlTable('gvg__warband', {
  id: int('id').primaryKey().notNull(),
  tid: tinyint('tid').notNull(),
  icon: tinyint('icon'),
  frame: tinyint('frame'),
  name: varchar('name', { length: 16 }).notNull(),
  name_changed: boolean('name_changed').notNull(),
  warband_last_settle_score: bigint('warband_last_settle_score', { mode: 'number' }).notNull(),
  settle_ts: bigint('settle_ts', { mode: 'number' }).notNull(),
});

export type GVGWarband = typeof gvgWarband.$inferSelect;
export type NewGVGWarband = typeof gvgWarband.$inferInsert;

export const upsertGVGWarband = async (newGVGWarband: NewGVGWarband) => {
  return (await getDbClient())
    .insert(gvgWarband)
    .values(newGVGWarband)
    .onDuplicateKeyUpdate({
      set: {
        id: sql`id`,
        tid: sql`tid`,
        icon: sql`icon`,
        frame: sql`frame`,
        name: sql`name`,
        name_changed: sql`name_changed`,
        warband_last_settle_score: sql`warband_last_settle_score`,
        settle_ts: sql`settle_ts`,
      },
    });
};
