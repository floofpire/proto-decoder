ALTER TABLE `slg__block` ADD `warband_id` int AFTER `id`;--> statement-breakpoint
UPDATE slg__block SET warband_id=334369 WHERE warband_id IS NULL;--> statement-breakpoint
ALTER TABLE `slg__block` ADD CONSTRAINT `slg__block_warband_id_slg__warband_id_fk` FOREIGN KEY (`warband_id`) REFERENCES `slg__warband`(`id`) ON DELETE no action ON UPDATE no action;
