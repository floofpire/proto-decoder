RENAME TABLE `block` TO `slg__block`;--> statement-breakpoint
RENAME TABLE `warband` TO `slg__warband`;--> statement-breakpoint
RENAME TABLE `warband_user` TO `slg__warband_user`;--> statement-breakpoint
ALTER TABLE `slg__warband_user` DROP FOREIGN KEY `warband_user_uid_user_summary_uid_fk`;
--> statement-breakpoint
ALTER TABLE `slg__warband_user` DROP FOREIGN KEY `warband_user_warband_id_warband_id_fk`;
--> statement-breakpoint
ALTER TABLE `slg__warband_user` ADD CONSTRAINT `slg__warband_user_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_user` ADD CONSTRAINT `slg__warband_user_warband_id_slg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `slg__warband`(`id`) ON DELETE no action ON UPDATE no action;
