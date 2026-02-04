import { db } from "~/db";
import { events } from "~/db/schema";
import { nanoid } from "nanoid";
import { EventSchemas, type EventType, type EventMetadata } from "./events";

// Re-export shared types for convenience
export { EventSchemas, type EventType, type EventMetadata } from "./events";
export { formatEventDescription } from "./events";

// Log event options
type LogEventOptions<T extends EventType> = {
  type: T;
  actorId: string;
  metadata: EventMetadata<T>;
  projectId?: string;
  taskId?: string;
};

/**
 * Log an event to the database with Zod validation
 */
export async function logEvent<T extends EventType>(
  options: LogEventOptions<T>
): Promise<void> {
  const { type, actorId, metadata, projectId } = options;

  // Validate metadata against schema
  const schema = EventSchemas[type];
  const validatedMetadata = schema.parse(metadata);

  await db.insert(events).values({
    id: nanoid(),
    type,
    actorId,
    metadata: JSON.stringify(validatedMetadata),
    projectId: projectId ?? null,
    createdAt: new Date(),
  });
}

/**
 * Parse event metadata with type safety
 */
export function parseEventMetadata<T extends EventType>(
  type: T,
  metadataJson: string | null
): EventMetadata<T> | null {
  if (!metadataJson) return null;
  try {
    const parsed = JSON.parse(metadataJson);
    return EventSchemas[type].parse(parsed) as EventMetadata<T>;
  } catch {
    return null;
  }
}
