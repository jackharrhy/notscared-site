CREATE TABLE `config_values` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `value` text NOT NULL,
  `label` text NOT NULL,
  `sort_order` integer NOT NULL DEFAULT 0,
  `color` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `state` text,
  `stage` text NOT NULL DEFAULT 'idea',
  `priority` text,
  `created_by` text NOT NULL REFERENCES `users`(`id`),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_members` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_idea', 'project_stage', 'idea', 'Idea', 0, NULL, 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_planning', 'project_stage', 'planning', 'Planning', 1, NULL, 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_active', 'project_stage', 'active', 'Active', 2, 'green', 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_paused', 'project_stage', 'paused', 'Paused', 3, 'amber', 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_shipped', 'project_stage', 'shipped', 'Shipped', 4, 'green', 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_archived', 'project_stage', 'archived', 'Archived', 5, NULL, 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('ps_shelved', 'project_stage', 'shelved', 'Shelved', 6, NULL, 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('pp_low', 'project_priority', 'low', 'Low', 0, NULL, 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('pp_medium', 'project_priority', 'medium', 'Medium', 1, 'amber', 1769480100000);
--> statement-breakpoint
INSERT INTO `config_values` (`id`, `type`, `value`, `label`, `sort_order`, `color`, `created_at`) VALUES ('pp_high', 'project_priority', 'high', 'High', 2, 'red', 1769480100000);
