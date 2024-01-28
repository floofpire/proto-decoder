CREATE TABLE `slg__warband_member_ranking` (
	`uid` int NOT NULL,
	`season` tinyint NOT NULL,
	`slg_coins_rank` int,
	`slg_coins_point` bigint,
	`slg_boss_damage_rank` int,
	`slg_boss_damage_point` bigint,
	`created_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updated_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `slg__warband_member_ranking_season_uid` PRIMARY KEY(`season`,`uid`)
);
--> statement-breakpoint
CREATE TABLE `slg__warband_ranking` (
	`warband_id` int NOT NULL,
	`season` tinyint NOT NULL,
	`slg_coins_rank` int,
	`slg_coins_point` bigint,
	`slg_boss_damage_rank` int,
	`slg_boss_damage_point` bigint,
	`created_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updated_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `slg__warband_ranking_season_warband_id` PRIMARY KEY(`season`,`warband_id`)
);
--> statement-breakpoint
ALTER TABLE `slg__warband` MODIFY COLUMN `map_end_ts` bigint;--> statement-breakpoint
ALTER TABLE `slg__warband` MODIFY COLUMN `name_prohibited_ts` bigint;--> statement-breakpoint
ALTER TABLE `slg__warband_member_ranking` ADD CONSTRAINT `slg__warband_member_ranking_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` ADD CONSTRAINT `slg__warband_ranking_warband_id_slg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `slg__warband`(`id`) ON DELETE no action ON UPDATE no action;