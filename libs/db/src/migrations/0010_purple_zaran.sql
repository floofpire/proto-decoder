CREATE TABLE `guild` (
	`id` int NOT NULL,
	`svr_id` tinyint,
	`name` varchar(20) NOT NULL,
	`icon` tinyint,
	`lang` varchar(2),
	`apply_desc` varchar(200),
	`join_type` enum('open','closed','approval'),
	`level` smallint,
	`require_lv` smallint,
	`member_count` tinyint,
	`active_point` smallint,
	`active_point_his_list` json,
	`frame` tinyint,
	`nameplates` json,
	`created_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updated_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `guild_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guild_member` (
	`uid` int NOT NULL,
	`guild_id` int,
	`recent_active_point` smallint,
	`enter_time` bigint,
	`created_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updated_at` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `guild_member_uid` PRIMARY KEY(`uid`)
);
--> statement-breakpoint
ALTER TABLE `guild_member` ADD CONSTRAINT `guild_member_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guild_member` ADD CONSTRAINT `guild_member_guild_id_guild_id_fk` FOREIGN KEY (`guild_id`) REFERENCES `guild`(`id`) ON DELETE no action ON UPDATE no action;