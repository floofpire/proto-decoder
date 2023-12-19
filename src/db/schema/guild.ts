import { int, mysqlTable, varchar, tinyint, mysqlEnum, smallint, json, bigint } from 'drizzle-orm/mysql-core';
import { sql, eq, inArray } from 'drizzle-orm';

import { getDbClient } from '../client';
import { hgame } from '../../afkprotos';
import { guildMember } from './guildMember';

type Nameplate = Exclude<hgame.Inameplate, 'type'> & { type?: keyof typeof hgame.t_nameplate_type | null };

export const guild = mysqlTable('guild', {
  id: int('id').primaryKey().notNull(),
  svr_id: smallint('svr_id'),
  name: varchar('name', { length: 20 }).notNull(),
  icon: tinyint('icon'),
  lang: varchar('lang', { length: 2 }),
  apply_desc: varchar('apply_desc', { length: 200 }),
  join_type: mysqlEnum('join_type', ['open', 'closed', 'approval']),
  level: smallint('level'),
  require_lv: smallint('require_lv'),
  member_count: tinyint('member_count'),
  active_point: smallint('active_point'),
  active_point_his_list: json('active_point_his_list').$type<number[]>(),
  frame: tinyint('frame'),
  nameplates: json('nameplates').$type<Nameplate[]>(),
  created_at: bigint('created_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
  updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(sql`UNIX_TIMESTAMP()`),
});

export type Guild = typeof guild.$inferSelect;
export type NewGuild = Exclude<typeof guild.$inferInsert, 'created_at' | 'updated_at'>;

export const upsertGuilds = async (newGuilds: NewGuild[]) => {
  return (await getDbClient())
    .insert(guild)
    .values(newGuilds)
    .onDuplicateKeyUpdate({
      set: {
        svr_id: sql`VALUES(${sql.identifier('svr_id')})`,
        name: sql`VALUES(${sql.identifier('name')})`,
        icon: sql`VALUES(${sql.identifier('icon')})`,
        lang: sql`VALUES(${sql.identifier('lang')})`,
        apply_desc: sql`VALUES(${sql.identifier('apply_desc')})`,
        join_type: sql`VALUES(${sql.identifier('join_type')})`,
        level: sql`VALUES(${sql.identifier('level')})`,
        require_lv: sql`VALUES(${sql.identifier('require_lv')})`,
        member_count: sql`VALUES(${sql.identifier('member_count')})`,
        active_point: sql`VALUES(${sql.identifier('active_point')})`,
        active_point_his_list: sql`VALUES(${sql.identifier('active_point_his_list')})`,
        frame: sql`VALUES(${sql.identifier('frame')})`,
        nameplates: sql`VALUES(${sql.identifier('nameplates')})`,
        updated_at: sql`UNIX_TIMESTAMP()`,
      },
    });
};

export const getAllGuilds = async (): Promise<Guild[]> => {
  return (await getDbClient())
    .select()
    .from(guild)
    .where(inArray(guild.id, sql`(SELECT DISTINCT guild_id FROM ${guildMember})`));
};

export const getOneGuildById = async (id: number): Promise<Guild> => {
  const guilds = await (await getDbClient()).select().from(guild).where(eq(guild.id, id)).limit(1);

  return guilds[0];
};
