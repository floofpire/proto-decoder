import { int, mysqlEnum, mysqlTable, mediumint, bigint, boolean } from 'drizzle-orm/mysql-core';
import { userSummary } from './userSummary.ts';
import { gvgWarband } from './gvgWarband.ts';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

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
  is_robot: boolean('is_robot'),
});

export type GVGWarbandMember = typeof gvgWarbandMember.$inferSelect;
export type NewGVGWarbandMember = typeof gvgWarbandMember.$inferInsert;

export const upsertWarbandMembers = async (newGVGWarbandMembers: NewGVGWarbandMember[]) => {
  return (await getDbClient())
    .insert(gvgWarbandMember)
    .values(newGVGWarbandMembers)
    .onDuplicateKeyUpdate({
      set: {
        uid: sql`uid`,
        warband_id: sql`warband_id`,
        gs: sql`gs`,
        last_settle_score: sql`last_settle_score`,
        dig_secs: sql`dig_secs`,
        title: sql`title`,
        occ_block_id: sql`occ_block_id`,
        is_robot: sql`is_robot`,
      },
    });
};
