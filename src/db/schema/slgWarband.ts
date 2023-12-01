import { int, mysqlTable, bigint, varchar, tinyint } from 'drizzle-orm/mysql-core';
import { sql, eq } from 'drizzle-orm';

import { getDbClient } from '../client';

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
        name: sql`VALUES(${sql.identifier('name')})`,
        name_modify_ts: sql`VALUES(${sql.identifier('name_modify_ts')})`,
        icon: sql`VALUES(${sql.identifier('icon')})`,
        map_end_ts: sql`VALUES(${sql.identifier('map_end_ts')})`,
        name_prohibited_ts: sql`VALUES(${sql.identifier('name_prohibited_ts')})`,
      },
    });
};

export const getAllSLGWarbands = async (): Promise<SLGWarband[]> => {
  return (await getDbClient()).select().from(slgWarband);
};

export const getSLGWarbandById = async (id: number): Promise<SLGWarband> => {
  const warbands = await (await getDbClient()).select().from(slgWarband).where(eq(slgWarband.id, id)).limit(1);

  return warbands[0];
};
