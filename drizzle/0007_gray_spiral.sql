CREATE TABLE `gvg__block_history` (
	`time` bigint NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`block_id` int NOT NULL,
	`object_tid` tinyint NOT NULL,
	`object_left_score` int NOT NULL,
	`object_mine_id` smallint NOT NULL,
	`object_uid` int,
	`object_warband_id` int,
	`object_last_sync_ts` bigint,
	`object_occ_ts` bigint,
	CONSTRAINT `gvg__block_history_block_id_time` PRIMARY KEY(`block_id`,`time`)
);
