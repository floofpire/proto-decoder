import {
  int,
  smallint,
  mysqlEnum,
  mysqlTable,
  bigint,
  varchar,
  mediumint,
  boolean,
  json,
} from 'drizzle-orm/mysql-core';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

interface ExhibitedEmblem {
  emblem_id: number;
  touched_times: number;
  expire_ts?: number;
  index: number;
}

interface Nameplate {
  rank?: number;
  expire_ts?: string;
  total?: number;
  percent?: number;
  type?:
    | 'curseland_govern'
    | 'curseland_minor'
    | 'idle_pvp'
    | 'side_endless_pet'
    | 'side_endless_normal'
    | 'race_dream'
    | 'side_endless_boss'
    | 'guild_level'
    | 'camp_pvp';
  param?: number;
  tid?: string;
}

export const userSummary = mysqlTable('user_summary', {
  uid: int('uid').primaryKey().notNull(),
  svr_id: smallint('svr_id'),
  name: varchar('name', { length: 16 }),
  level: smallint('level'),
  gender: mysqlEnum('gender', ['male', 'female', 'invisible']),
  avatar: varchar('avatar', { length: 256 }),
  frame: smallint('frame'),
  country_or_region: varchar('country_or_region', { length: 15 }),
  lang: varchar('lang', { length: 2 }),
  guild_id: mediumint('guild_id'),
  guild_name: varchar('guild_name', { length: 30 }),
  guild_title: mysqlEnum('guild_title', ['chairman', 'leader', 'member']),
  full_gs: varchar('full_gs', { length: 30 }),
  top_gs: varchar('top_gs', { length: 30 }),
  last_offline: bigint('last_offline', { mode: 'number' }),
  is_online: boolean('is_online'),
  is_unknown: boolean('is_unknown'),
  cur_stage: smallint('cur_stage'),
  cur_tower: smallint('cur_tower'),
  city: varchar('city', { length: 30 }),
  is_deleted: boolean('is_deleted'),
  pg_lv: smallint('pg_lv'),
  homeland_gs_radio: smallint('homeland_gs_radio'),
  exhibited_emblems: json('exhibited_emblems').$type<ExhibitedEmblem[]>(),
  create_ts: bigint('create_ts', { mode: 'number' }),
  nameplate: json('nameplate').$type<Nameplate>(),
  display_opt: varchar('display_opt', { length: 10 }),
  nameplates: json('nameplates').$type<Nameplate[]>(),
});

export type UserSummary = typeof userSummary.$inferSelect;
export type NewUserSummary = typeof userSummary.$inferInsert;

export const upsertUserSummaries = async (newUserSummaries: NewUserSummary[]) => {
  return (await getDbClient())
    .insert(userSummary)
    .values(newUserSummaries)
    .onDuplicateKeyUpdate({
      set: {
        uid: sql`uid`,
        svr_id: sql`svr_id`,
        name: sql`name`,
        level: sql`level`,
        gender: sql`gender`,
        avatar: sql`avatar`,
        frame: sql`frame`,
        country_or_region: sql`country_or_region`,
        lang: sql`lang`,
        guild_id: sql`guild_id`,
        guild_name: sql`guild_name`,
        guild_title: sql`guild_title`,
        full_gs: sql`full_gs`,
        top_gs: sql`top_gs`,
        last_offline: sql`last_offline`,
        is_online: sql`is_online`,
        is_unknown: sql`is_unknown`,
        cur_stage: sql`cur_stage`,
        cur_tower: sql`cur_tower`,
        city: sql`city`,
        is_deleted: sql`is_deleted`,
        pg_lv: sql`pg_lv`,
        homeland_gs_radio: sql`homeland_gs_radio`,
        exhibited_emblems: sql`exhibited_emblems`,
        create_ts: sql`create_ts`,
        nameplate: sql`nameplate`,
        display_opt: sql`display_opt`,
        nameplates: sql`nameplates`,
      },
    });
};
