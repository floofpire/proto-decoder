RENAME TABLE `slg__warband_user` TO `slg__warband_member`;--> statement-breakpoint
ALTER TABLE `slg__warband_member` DROP FOREIGN KEY `slg__warband_user_uid_user_summary_uid_fk`;
--> statement-breakpoint
ALTER TABLE `slg__warband_member` DROP FOREIGN KEY `slg__warband_user_warband_id_slg__warband_id_fk`;
--> statement-breakpoint
ALTER TABLE `slg__warband_member` DROP CONSTRAINT `slg__warband_user_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `slg__warband_member` DROP CONSTRAINT `slg__warband_user_warband_id_slg__warband_id_fk`;--> statement-breakpoint
ALTER TABLE `slg__warband_member` ADD CONSTRAINT `slg__warband_member_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_member` ADD CONSTRAINT `slg__warband_member_warband_id_slg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `slg__warband`(`id`) ON DELETE no action ON UPDATE no action;
