import { z } from "zod";

// Event type schemas - validated before storing
export const EventSchemas = {
  // Projects
  "project.created": z.object({}),
  "project.deleted": z.object({ name: z.string() }),
  "project.name_changed": z.object({ from: z.string(), to: z.string() }),
  "project.stage_changed": z.object({ from: z.string(), to: z.string() }),
  "project.priority_changed": z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
  }),
  "project.status_updated": z.object({}),
  "project.description_updated": z.object({}),
  "project.members_changed": z.object({
    added: z.array(z.string()),
    removed: z.array(z.string()),
  }),
} as const;

export type EventType = keyof typeof EventSchemas;

// Infer metadata type from schema
export type EventMetadata<T extends EventType> = z.infer<(typeof EventSchemas)[T]>;

/**
 * Format event for display
 */
export function formatEventDescription(
  type: EventType,
  metadata: unknown
): string {
  switch (type) {
    case "project.created":
      return "created this project";
    case "project.deleted": {
      const m = metadata as { name: string };
      return `deleted project "${m.name}"`;
    }
    case "project.name_changed": {
      const m = metadata as { from: string; to: string };
      return `renamed project from "${m.from}" to "${m.to}"`;
    }
    case "project.stage_changed": {
      const m = metadata as { from: string; to: string };
      return `changed stage from ${m.from} to ${m.to}`;
    }
    case "project.priority_changed": {
      const m = metadata as { from: string | null; to: string | null };
      if (!m.from && m.to) return `set priority to ${m.to}`;
      if (m.from && !m.to) return `removed priority`;
      return `changed priority from ${m.from} to ${m.to}`;
    }
    case "project.status_updated":
      return "updated the status";
    case "project.description_updated":
      return "updated the description";
    case "project.members_changed": {
      const m = metadata as { added: string[]; removed: string[] };
      const parts: string[] = [];
      if (m.added.length > 0) parts.push(`added ${m.added.length} member(s)`);
      if (m.removed.length > 0) parts.push(`removed ${m.removed.length} member(s)`);
      return parts.join(" and ") || "updated members";
    }
    default:
      return "performed an action";
  }
}
