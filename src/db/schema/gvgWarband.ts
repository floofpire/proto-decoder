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
        icon: sql`VALUES(${sql.identifier('icon')})`,
        frame: sql`VALUES(${sql.identifier('frame')})`,
        name: sql`VALUES(${sql.identifier('name')})`,
        name_changed: sql`VALUES(${sql.identifier('name_changed')})`,
        warband_last_settle_score: sql`VALUES(${sql.identifier('warband_last_settle_score')})`,
        settle_ts: sql`VALUES(${sql.identifier('settle_ts')})`,
      },
    });
};
