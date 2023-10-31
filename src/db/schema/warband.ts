import { int, mysqlTable, bigint, varchar, tinyint } from 'drizzle-orm/mysql-core';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

export const warband = mysqlTable('warband', {
  id: int('id').primaryKey().notNull(),
  name: varchar('name', { length: 16 }).notNull(),
  name_modify_ts: bigint('name_modify_ts', { mode: 'number' }),
  icon: tinyint('icon'),
  map_end_ts: bigint('map_end_ts', { mode: 'number' }).notNull(),
  name_prohibited_ts: bigint('name_prohibited_ts', { mode: 'number' }).notNull(),
});

export type Warband = typeof warband.$inferSelect;
export type NewWarband = typeof warband.$inferInsert;

export const upsertWarband = async (newWarband: NewWarband) => {
  return (await getDbClient())
    .insert(warband)
    .values(newWarband)
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
