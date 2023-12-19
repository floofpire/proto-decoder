import { int, mysqlTable, bigint, smallint } from 'drizzle-orm/mysql-core';
import { sql, eq, asc } from 'drizzle-orm';

import { UserSummary, userSummary } from './userSummary';
import { getDbClient } from '../client';
import { guild } from './guild';

export const guildMember = mysqlTable('guild_member', {
  uid: int('uid')
    .primaryKey()
    .references(() => userSummary.uid),
  guild_id: int('guild_id').references(() => guild.id),
  recent_active_point: smallint('recent_active_point'),
  enter_time: bigint('enter_time', { mode: 'number' }),
  created_at: bigint('created_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
  updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
});

export type GuildMember = typeof guildMember.$inferSelect;
export type NewGuildMember = Exclude<typeof guildMember.$inferInsert, 'created_at' | 'updated_at'>;

export const upsertGuildMembers = async (newGuildMembers: NewGuildMember[]) => {
  return (await getDbClient())
    .insert(guildMember)
    .values(newGuildMembers)
    .onDuplicateKeyUpdate({
      set: {
        guild_id: sql`COALESCE(VALUES(${sql.identifier('guild_id')}), ${sql.identifier('guild_id')})`,
        recent_active_point: sql`COALESCE(VALUES(${sql.identifier('recent_active_point')}), ${sql.identifier(
          'recent_active_point',
        )})`,
        enter_time: sql`COALESCE(VALUES(${sql.identifier('enter_time')}), ${sql.identifier('enter_time')})`,
        updated_at: sql`UNIX_TIMESTAMP()`,
      },
    });
};

interface GuildMemberAndSummary {
  guild_member: GuildMember;
  user_summary: UserSummary | null;
}

export const getAllGuildMembers = async (guildId: number): Promise<GuildMemberAndSummary[]> => {
  const guildMembers = await (
    await getDbClient()
  )
    .select()
    .from(guildMember)
    .leftJoin(userSummary, eq(guildMember.uid, userSummary.uid))
    .where(eq(guildMember.guild_id, guildId))
    .orderBy(asc(userSummary.name));

  guildMembers.forEach((guildMember) => {
    if (guildMember.user_summary?.nameplate) {
      guildMember.user_summary.nameplate = JSON.parse(guildMember.user_summary.nameplate as string);
    }
    if (guildMember.user_summary?.nameplates) {
      guildMember.user_summary.nameplates = JSON.parse(guildMember.user_summary.nameplates as unknown as string);
    }
    if (guildMember.user_summary?.exhibited_emblems) {
      guildMember.user_summary.exhibited_emblems = JSON.parse(
        guildMember.user_summary.exhibited_emblems as unknown as string,
      );
    }
    if (guildMember.user_summary?.astrolabe) {
      guildMember.user_summary.astrolabe = JSON.parse(guildMember.user_summary.astrolabe as unknown as string);
    }
  });

  return guildMembers;
};
