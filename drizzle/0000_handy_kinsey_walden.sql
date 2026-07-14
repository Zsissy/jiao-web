CREATE TABLE `love_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`event_date` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `love_wishes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`url` text NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quarter_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quarter` text NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT '进行中' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `travel_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`destination` text NOT NULL,
	`time_range` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '计划中' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`item_date` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
