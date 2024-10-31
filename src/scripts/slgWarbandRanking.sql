SELECT test.*
FROM (SELECT warband.name,
             warband.guild_id                                                  as "Guild ID",
             ranking.slg_boss_damage_rank                                      as "Damage Rank",
             ranking.slg_boss_damage_point                                     as "Damage",
             ranking.slg_coins_rank                                            as "Blessed Essence Rank",
             ranking.slg_coins_point                                           as "Blessed Essence",
             CEILING((AVG(user_summary.pg_lv) - 249) / 10 + 240)               as "Average RC",
             CONCAT("=CEILING(MEDIAN(", GROUP_CONCAT(CEILING((user_summary.pg_lv - 249) / 10 + 240) SEPARATOR ";"),
                    "))")                                                      as "Median RC",
             SUM(user_summary.top_gs)                                          as "Total Combat Rating",
             SUM(IF(member.slg_boss_damage_point = 0, 1, 0))                   as Zeroers,
             SUM(IF(member.slg_boss_damage_point = 0, 0, user_summary.top_gs)) as "Total Combat Rating (No Zeroers)",
             warband.id                                                        as "Militia ID"
      FROM slg__warband_ranking ranking
               LEFT JOIN afkarena.slg__warband warband ON warband.id = ranking.warband_id
               LEFT JOIN slg__warband_member_ranking member ON member.warband_id = warband.id
               LEFT JOIN user_summary ON user_summary.uid = member.uid
      WHERE ranking.season = "S13"
        AND (ranking.slg_boss_damage_rank IS NOT NULL
          OR ranking.slg_coins_rank IS NOT NULL)
      GROUP BY ranking.warband_id) test
ORDER BY -test.`Damage Rank` DESC;
