ALTER TABLE `gvg__warband_member` DROP FOREIGN KEY `gvg__warband_member_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` DROP FOREIGN KEY `gvg__warband_member_snapshot_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `slg__warband_member_ranking` DROP FOREIGN KEY `slg__warband_member_ranking_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` DROP FOREIGN KEY `slg__warband_ranking_warband_id_slg__warband_id_fk`;--> statement-breakpoint
ALTER TABLE `slg__warband_user` DROP FOREIGN KEY `slg__warband_user_uid_user_summary_uid_fk`;--> statement-breakpoint
ALTER TABLE `gvg__block_history` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gvg__warband_member` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `slg__block` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `slg__warband_member_ranking` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `slg__warband_user` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gvg__block_history` ADD PRIMARY KEY(`time`,`block_id`);--> statement-breakpoint
ALTER TABLE `gvg__warband_member` ADD PRIMARY KEY(`uid`,`warband_id`);--> statement-breakpoint
ALTER TABLE `gvg__warband_member_snapshot` ADD PRIMARY KEY(`uid`,`warband_id`,`dump_time`);--> statement-breakpoint
ALTER TABLE `slg__block` ADD PRIMARY KEY(`id`,`warband_id`);--> statement-breakpoint
ALTER TABLE `slg__warband_member_ranking` ADD PRIMARY KEY(`uid`,`season`);--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` ADD PRIMARY KEY(`warband_id`,`season`);--> statement-breakpoint
ALTER TABLE `slg__warband_user` ADD PRIMARY KEY(`uid`,`warband_id`);
