ALTER TABLE `slg__block` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `slg__block` MODIFY COLUMN `warband_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__block` ADD PRIMARY KEY(`id`,`warband_id`);