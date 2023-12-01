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
import { sql } from 'drizzle-orm';

import { getDbClient } from '../client';

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
        name: sql`COALESCE(VALUES(${sql.identifier('name')}), ${sql.identifier('name')})`,
        level: sql`COALESCE(VALUES(${sql.identifier('level')}), ${sql.identifier('level')})`,
        gender: sql`COALESCE(VALUES(${sql.identifier('gender')}), ${sql.identifier('gender')})`,
        avatar: sql`COALESCE(VALUES(${sql.identifier('avatar')}), ${sql.identifier('avatar')})`,
        frame: sql`COALESCE(VALUES(${sql.identifier('frame')}), ${sql.identifier('frame')})`,
        country_or_region: sql`COALESCE(VALUES(${sql.identifier('country_or_region')}), ${sql.identifier(
          'country_or_region',
        )})`,
        lang: sql`COALESCE(VALUES(${sql.identifier('lang')}), ${sql.identifier('lang')})`,
        guild_id: sql`COALESCE(VALUES(${sql.identifier('guild_id')}), ${sql.identifier('guild_id')})`,
        guild_name: sql`COALESCE(VALUES(${sql.identifier('guild_name')}), ${sql.identifier('guild_name')})`,
        guild_title: sql`COALESCE(VALUES(${sql.identifier('guild_title')}), ${sql.identifier('guild_title')})`,
        full_gs: sql`COALESCE(VALUES(${sql.identifier('full_gs')}), ${sql.identifier('full_gs')})`,
        top_gs: sql`COALESCE(VALUES(${sql.identifier('top_gs')}), ${sql.identifier('top_gs')})`,
        last_offline: sql`COALESCE(VALUES(${sql.identifier('last_offline')}), ${sql.identifier('last_offline')})`,
        is_online: sql`COALESCE(VALUES(${sql.identifier('is_online')}), ${sql.identifier('is_online')})`,
        is_unknown: sql`COALESCE(VALUES(${sql.identifier('is_unknown')}), ${sql.identifier('is_unknown')})`,
        cur_stage: sql`COALESCE(VALUES(${sql.identifier('cur_stage')}), ${sql.identifier('cur_stage')})`,
        cur_tower: sql`COALESCE(VALUES(${sql.identifier('cur_tower')}), ${sql.identifier('cur_tower')})`,
        city: sql`COALESCE(VALUES(${sql.identifier('city')}), ${sql.identifier('city')})`,
        is_deleted: sql`COALESCE(VALUES(${sql.identifier('is_deleted')}), ${sql.identifier('is_deleted')})`,
        pg_lv: sql`COALESCE(VALUES(${sql.identifier('pg_lv')}), ${sql.identifier('pg_lv')})`,
        homeland_gs_radio: sql`COALESCE(VALUES(${sql.identifier('homeland_gs_radio')}), ${sql.identifier(
          'homeland_gs_radio',
        )})`,
        exhibited_emblems: sql`COALESCE(VALUES(${sql.identifier('exhibited_emblems')}), ${sql.identifier(
          'exhibited_emblems',
        )})`,
        create_ts: sql`COALESCE(VALUES(${sql.identifier('create_ts')}), ${sql.identifier('create_ts')})`,
        nameplate: sql`COALESCE(VALUES(${sql.identifier('nameplate')}), ${sql.identifier('nameplate')})`,
        display_opt: sql`COALESCE(VALUES(${sql.identifier('display_opt')}), ${sql.identifier('display_opt')})`,
        nameplates: sql`COALESCE(VALUES(${sql.identifier('nameplates')}), ${sql.identifier('nameplates')})`,
      },
    });
};
