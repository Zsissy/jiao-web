CREATE TABLE `content_blocks` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `love_wishes` ADD `image_url` text DEFAULT '' NOT NULL;
