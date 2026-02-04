CREATE TABLE `events` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `actor_id` text NOT NULL REFERENCES `users`(`id`),
  `metadata` text,
  `created_at` integer NOT NULL,
  `project_id` text REFERENCES `projects`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `events_created_at` ON `events`(`created_at` DESC);
--> statement-breakpoint
CREATE INDEX `events_project_id` ON `events`(`project_id`);
