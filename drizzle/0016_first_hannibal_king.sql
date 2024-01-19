ALTER TABLE `slg__block` ADD `created_at` bigint DEFAULT UNIX_TIMESTAMP() NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__block` ADD `updated_at` bigint DEFAULT UNIX_TIMESTAMP() NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__warband` ADD `created_at` bigint DEFAULT UNIX_TIMESTAMP() NOT NULL;--> statement-breakpoint
ALTER TABLE `slg__warband` ADD `updated_at` bigint DEFAULT UNIX_TIMESTAMP() NOT NULL;