import { int, mysqlTable, bigint, mediumint, smallint, json, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';
import { getDbClient } from '../client.ts';
import { sql } from 'drizzle-orm';

interface RelicPic {
  hero_job: number;
  lv: number;
  relics: Record<number, number>;
}

interface BlockObject {
  id: number;
  relic_pics?: RelicPic[];
  debuff_ids?: number[];
  reset_ts?: number;
  deletable?: boolean;
}

interface HeroSummary {
  id: number;
  tid: number;
  quality: number;
  rank: number;
  level: number;
}

interface CD {
  id: number;
  cur_point: number;
  last_use_time: number;
  last_restore_time: number;
  extra_point?: number;
}

interface MMineHero {
  uid: number;
  bonus_heroes: HeroSummary[];
  contribute_time: number;
}

export const slgBlock = mysqlTable('slg__block', {
  id: int('id').primaryKey().notNull(),
  seq: mediumint('seq'),
  owner: int('owner'),
  group: smallint('group'),
  give_up_ts: bigint('give_up_ts', { mode: 'number' }),
  objects: json('objects').$type<BlockObject[]>(),
  bonus_param: smallint('bonus_param'),
  bonus_hero: json('bonus_hero').$type<HeroSummary>(),
  is_stationed: boolean('is_stationed'),
  privilege_finish_time: bigint('privilege_finish_time', { mode: 'number' }),
  occupy_ts: bigint('occupy_ts', { mode: 'number' }),
  battle_cd: json('battle_cd').$type<CD>(),
  mine_heroes: json('mine_heroes').$type<MMineHero[]>(),
  status: mysqlEnum('status', ['light', 'port', 'artifact', 'aircraft_unit', 'ladder', 'oxygen_bottles', 'arrow']),
  _x: smallint('_x'),
  _y: smallint('_y'),
  _z: smallint('_z'),
});

export type SLGBlock = typeof slgBlock.$inferSelect;
export type SLGNewBlock = typeof slgBlock.$inferInsert;

export const upsertSLGBlocks = async (newBlocks: SLGNewBlock[]) => {
  const db = await getDbClient();
  return db
    .insert(slgBlock)
    .values(newBlocks)
    .onDuplicateKeyUpdate({
      set: {
        seq: sql`COALESCE(VALUES(${sql.identifier('seq')}), ${sql.identifier('seq')})`,
        owner: sql`COALESCE(VALUES(${sql.identifier('owner')}), ${sql.identifier('owner')})`,
        group: sql`COALESCE(VALUES(${sql.identifier('group')}), ${sql.identifier('group')})`,
        give_up_ts: sql`COALESCE(VALUES(${sql.identifier('give_up_ts')}), ${sql.identifier('give_up_ts')})`,
        objects: sql`COALESCE(VALUES(${sql.identifier('objects')}), ${sql.identifier('objects')})`,
        bonus_param: sql`COALESCE(VALUES(${sql.identifier('bonus_param')}), ${sql.identifier('bonus_param')})`,
        bonus_hero: sql`COALESCE(VALUES(${sql.identifier('bonus_hero')}), ${sql.identifier('bonus_hero')})`,
        is_stationed: sql`COALESCE(VALUES(${sql.identifier('is_stationed')}), ${sql.identifier('is_stationed')})`,
        privilege_finish_time: sql`COALESCE(VALUES(${sql.identifier('privilege_finish_time')}), ${sql.identifier(
          'privilege_finish_time',
        )})`,
        occupy_ts: sql`COALESCE(VALUES(${sql.identifier('occupy_ts')}), ${sql.identifier('occupy_ts')})`,
        battle_cd: sql`COALESCE(VALUES(${sql.identifier('battle_cd')}), ${sql.identifier('battle_cd')})`,
        mine_heroes: sql`COALESCE(VALUES(${sql.identifier('mine_heroes')}), ${sql.identifier('mine_heroes')})`,
        status: sql`COALESCE(VALUES(${sql.identifier('status')}), ${sql.identifier('status')})`,
        _x: sql`VALUES(${sql.identifier('_x')})`,
        _y: sql`VALUES(${sql.identifier('_y')})`,
        _z: sql`VALUES(${sql.identifier('_z')})`,
      },
    });
};
