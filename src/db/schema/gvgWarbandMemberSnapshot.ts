import { int, mysqlTable, mediumint, bigint, smallint, primaryKey } from 'drizzle-orm/mysql-core';

import { userSummary } from './userSummary';
import { gvgWarband } from './gvgWarband';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';
import { gvgWarbandMember } from './gvgWarbandMember.ts';

export const gvgWarbandMemberSnapshot = mysqlTable(
  'gvg__warband_member_snapshot',
  {
    uid: int('uid').references(() => userSummary.uid),
    warband_id: int('warband_id').references(() => gvgWarband.id),
    dump_time: bigint('dump_time', { mode: 'number' }),
    gs: bigint('gs', { mode: 'number' }).notNull(),
    last_settle_score: mediumint('last_settle_score').notNull(),
    dig_secs: mediumint('dig_secs').notNull(),
    kills: smallint('kills'),
  },
  (table) => {
    return {
      pk: primaryKey(table.uid, table.dump_time),
    };
  },
);

export type GVGWarbandMemberSnapshot = typeof gvgWarbandMemberSnapshot.$inferSelect;
export type NewGVGWarbandMemberSnapshot = typeof gvgWarbandMemberSnapshot.$inferInsert;

export const snapshotGVGWarbandMembers = async () => {
  return (await getDbClient()).execute(sql`
    INSERT ignore
    INTO ${gvgWarbandMemberSnapshot} (${gvgWarbandMemberSnapshot.uid}, ${gvgWarbandMemberSnapshot.dump_time}, ${gvgWarbandMemberSnapshot.gs}, ${gvgWarbandMemberSnapshot.last_settle_score}, ${gvgWarbandMemberSnapshot.dig_secs}, ${gvgWarbandMemberSnapshot.kills})
    SELECT ${gvgWarbandMember.uid}, CURRENT_TIMESTAMP(), ${gvgWarbandMember.gs}, ${gvgWarbandMember.last_settle_score}, ${gvgWarbandMember.dig_secs}, ${gvgWarbandMember.kills}
    FROM ${gvgWarbandMember};
  `);
};
