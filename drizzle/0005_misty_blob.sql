CREATE TABLE `gvg__warband_member_snapshot` (
	`uid` int NOT NULL,
	`dump_time` bigint NOT NULL,
	`gs` bigint NOT NULL,
	`last_settle_score` mediumint NOT NULL,
	`dig_secs` mediumint NOT NULL,
	`kills` smallint,
	CONSTRAINT `gvg__warband_member_snapshot_dump_time_uid` PRIMARY KEY(`dump_time`,`uid`)
);
--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` ADD CONSTRAINT `gvg__warband_member_snapshot_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;