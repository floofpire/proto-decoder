CREATE TABLE `gvg__warband` (
	`id` int NOT NULL,
	`tid` tinyint NOT NULL,
	`icon` tinyint,
	`frame` tinyint,
	`name` varchar(16) NOT NULL,
	`name_changed` boolean NOT NULL,
	`warband_last_settle_score` bigint NOT NULL,
	`settle_ts` bigint NOT NULL,
	CONSTRAINT `gvg__warband_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvg__warband_member` (
	`uid` int NOT NULL,
	`warband_id` int,
	`gs` bigint NOT NULL,
	`last_settle_score` mediumint NOT NULL,
	`dig_secs` mediumint NOT NULL,
	`title` enum('chairman','leader','member') NOT NULL,
	`occ_block_id` int,
	`is_robot` boolean,
	CONSTRAINT `gvg__warband_member_uid` PRIMARY KEY(`uid`)
);
--> statement-breakpoint
ALTER TABLE `gvg__warband_member` ADD CONSTRAINT `gvg__warband_member_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gvg__warband_member` ADD CONSTRAINT `gvg__warband_member_warband_id_gvg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `gvg__warband`(`id`) ON DELETE no action ON UPDATE no action;