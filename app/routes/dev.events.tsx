import { useLoaderData, Link } from "react-router";
import { db } from "~/db";
import { events, users, projects } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatEventDescription, type EventType } from "~/lib/events";

export async function loader() {
  const recentEvents = await db
    .select({
      id: events.id,
      type: events.type,
      metadata: events.metadata,
      createdAt: events.createdAt,
      actorId: events.actorId,
      actorUsername: users.username,
      projectId: events.projectId,
      projectName: projects.name,
    })
    .from(events)
    .leftJoin(users, eq(events.actorId, users.id))
    .leftJoin(projects, eq(events.projectId, projects.id))
    .orderBy(desc(events.createdAt))
    .limit(50);

  return { events: recentEvents };
}

export function meta() {
  return [{ title: "Activity - notscared" }];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DevEvents() {
  const { events: eventList } = useLoaderData<typeof loader>();

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Activity</h1>

      {eventList.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      ) : (
        <div className="flex flex-col divide-y border">
          {eventList.map((event) => {
            const metadata = event.metadata ? JSON.parse(event.metadata) : {};
            const description = formatEventDescription(
              event.type as EventType,
              metadata
            );

            return (
              <div key={event.id} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                  {event.actorUsername ? getInitials(event.actorUsername) : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{event.actorUsername || "Unknown"}</span>{" "}
                    {description}
                    {event.projectName && (
                      <>
                        {" "}
                        on{" "}
                        <Link
                          to={`/dev/projects/${encodeURIComponent(event.projectName)}`}
                          className="font-medium underline decoration-black/50 hover:decoration-black/25"
                        >
                          {event.projectName}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(new Date(event.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
