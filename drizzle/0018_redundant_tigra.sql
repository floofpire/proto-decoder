ALTER TABLE `slg__warband_member_ranking` MODIFY COLUMN `season` varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__warband_ranking` MODIFY COLUMN `season` varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__warband` ADD `season` varchar(4) DEFAULT '11' NOT NULL AFTER `name`;
