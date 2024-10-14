ALTER TABLE `gvg__warband_member` ADD CONSTRAINT `gvg__warband_member_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` ADD CONSTRAINT `gvg__warband_member_snapshot_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_member_ranking` ADD CONSTRAINT `slg__warband_member_ranking_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` ADD CONSTRAINT `slg__warband_ranking_warband_id_slg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `slg__warband`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slg__warband_user` ADD CONSTRAINT `slg__warband_user_uid_user_summary_uid_fk` FOREIGN KEY (`uid`) REFERENCES `user_summary`(`uid`) ON DELETE no action ON UPDATE no action;