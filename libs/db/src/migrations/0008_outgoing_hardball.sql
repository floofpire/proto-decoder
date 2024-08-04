ALTER TABLE `gvg__warband_member_snapshot` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` MODIFY COLUMN `warband_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` ADD PRIMARY KEY(`dump_time`,`uid`,`warband_id`);--> statement-breakpoint
ALTER TABLE `gvg__warband_member` DROP FOREIGN KEY `gvg__warband_member_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `gvg__warband_member` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gvg__warband_member` MODIFY COLUMN `warband_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `gvg__warband_member` ADD PRIMARY KEY(`uid`,`warband_id`);--> statement-breakpoint
ALTER TABLE `gvg__warband_member` ADD CONSTRAINT `gvg__warband_member_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;
