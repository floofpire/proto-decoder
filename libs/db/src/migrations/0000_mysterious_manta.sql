CREATE TABLE `user_summary` (
	`uid` int NOT NULL,
	`svr_id` smallint,
	`name` varchar(16),
	`level` smallint,
	`gender` enum('male','female','invisible'),
	`avatar` varchar(256),
	`frame` smallint,
	`country_or_region` varchar(15),
	`lang` varchar(2),
	`guild_id` mediumint,
	`guild_name` varchar(30),
	`guild_title` enum('chairman','leader','member'),
	`full_gs` varchar(30),
	`top_gs` varchar(30),
	`last_offline` bigint,
	`is_online` boolean,
	`is_unknown` boolean,
	`cur_stage` smallint,
	`cur_tower` smallint,
	`city` varchar(30),
	`is_deleted` boolean,
	`pg_lv` smallint,
	`homeland_gs_radio` smallint,
	`exhibited_emblems` json,
	`create_ts` bigint,
	`nameplate` json,
	`display_opt` varchar(10),
	`nameplates` json,
	CONSTRAINT `user_summary_uid` PRIMARY KEY(`uid`)
);
--> statement-breakpoint
CREATE TABLE `warband` (
	`id` int NOT NULL,
	`name` varchar(16) NOT NULL,
	`name_modify_ts` bigint,
	`icon` tinyint,
	`map_end_ts` bigint NOT NULL,
	`name_prohibited_ts` bigint NOT NULL,
	CONSTRAINT `warband_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warband_user` (
	`uid` int NOT NULL,
	`warband_id` int,
	`gs` varchar(16),
	`nobility` tinyint,
	`title` enum('chairman','leader','member'),
	`guild_id` mediumint,
	CONSTRAINT `warband_user_uid` PRIMARY KEY(`uid`)
);
--> statement-breakpoint
ALTER TABLE `warband_user` ADD CONSTRAINT `warband_user_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warband_user` ADD CONSTRAINT `warband_user_warband_id_warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `warband`(`id`) ON DELETE no action ON UPDATE no action;