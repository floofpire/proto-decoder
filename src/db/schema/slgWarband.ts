import { int, mysqlTable, bigint, varchar, tinyint } from 'drizzle-orm/mysql-core';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

export const slgWarband = mysqlTable('slg__warband', {
  id: int('id').primaryKey().notNull(),
  name: varchar('name', { length: 16 }).notNull(),
  name_modify_ts: bigint('name_modify_ts', { mode: 'number' }),
  icon: tinyint('icon'),
  map_end_ts: bigint('map_end_ts', { mode: 'number' }).notNull(),
  name_prohibited_ts: bigint('name_prohibited_ts', { mode: 'number' }).notNull(),
});

export type SLGWarband = typeof slgWarband.$inferSelect;
export type NewSLGWarband = typeof slgWarband.$inferInsert;

export const upsertSLGWarband = async (newSLGWarband: NewSLGWarband) => {
  return (await getDbClient())
    .insert(slgWarband)
    .values(newSLGWarband)
    .onDuplicateKeyUpdate({
      set: {
        id: sql`id`,
        name: sql`name`,
        name_modify_ts: sql`name_modify_ts`,
        icon: sql`icon`,
        map_end_ts: sql`map_end_ts`,
        name_prohibited_ts: sql`name_prohibited_ts`,
      },
    });
};