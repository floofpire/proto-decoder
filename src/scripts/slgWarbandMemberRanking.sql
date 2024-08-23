SELECT member_ranking.uid,
       user_summary.name,
       warband.name                                   as "Militia",
       user_summary.guild_id                          as "Guild ID",
       member_ranking.slg_boss_damage_point           as "Damage",
       member_ranking.slg_boss_damage_rank            as "In Militia D Rank",
       warband_ranking.slg_boss_damage_rank           as "Militia D Rank",
       member_ranking.slg_coins_point                 as "Blessed Essence",
       member_ranking.slg_coins_rank                  as "In Militia BE Rank",
       warband_ranking.slg_coins_rank                 as "Militia BE Rank",
       user_summary.top_gs                            as "Combat Rating",
       CEILING((user_summary.pg_lv - 249) / 10 + 240) as "RC"
FROM slg__warband_member_ranking member_ranking
         LEFT JOIN afkarena.user_summary user_summary ON user_summary.uid = member_ranking.uid
         LEFT JOIN afkarena.slg__warband_ranking warband_ranking
                   ON warband_ranking.warband_id = member_ranking.warband_id
         LEFT JOIN afkarena.slg__warband warband
                   ON warband.id = member_ranking.warband_id
WHERE member_ranking.season = "12"
  AND (warband_ranking.slg_boss_damage_rank IS NOT NULL
    OR warband_ranking.slg_coins_rank IS NOT NULL)
ORDER BY member_ranking.slg_boss_damage_point DESC;
