import { int, mysqlTable, mediumint, bigint, smallint, primaryKey } from 'drizzle-orm/mysql-core';

import { userSummary } from './userSummary';
import { getDbClient } from '../client';
import { eq, sql } from 'drizzle-orm';
import { gvgWarbandMember } from './gvgWarbandMember';
import { gvgWarband } from './gvgWarband';

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
      pk: primaryKey(table.uid, table.warband_id, table.dump_time),
    };
  },
);

export type GVGWarbandMemberSnapshot = typeof gvgWarbandMemberSnapshot.$inferSelect;
export type NewGVGWarbandMemberSnapshot = typeof gvgWarbandMemberSnapshot.$inferInsert;

export const snapshotGVGWarbandMembers = async () => {
  return (await getDbClient()).execute(sql`
    INSERT ignore
    INTO ${gvgWarbandMemberSnapshot} (${gvgWarbandMemberSnapshot.uid}, ${gvgWarbandMemberSnapshot.warband_id}, ${gvgWarbandMemberSnapshot.dump_time}, ${gvgWarbandMemberSnapshot.gs}, ${gvgWarbandMemberSnapshot.last_settle_score}, ${gvgWarbandMemberSnapshot.dig_secs}, ${gvgWarbandMemberSnapshot.kills})
    SELECT ${gvgWarbandMember.uid}, ${gvgWarbandMember.warband_id}, UNIX_TIMESTAMP(), ${gvgWarbandMember.gs}, ${gvgWarbandMember.last_settle_score}, ${gvgWarbandMember.dig_secs}, ${gvgWarbandMember.kills}
    FROM ${gvgWarbandMember};
  `);
};

export const getAllDumpedTimesOfGVGWarband = async (warbandId: number) => {
  const results = await (
    await getDbClient()
  )
    .selectDistinct({ dump_time: gvgWarbandMemberSnapshot.dump_time })
    .from(gvgWarbandMemberSnapshot)
    .where(eq(gvgWarbandMemberSnapshot.warband_id, warbandId));

  return results.map((row) => row.dump_time);
};
