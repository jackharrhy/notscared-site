import {
  Form,
  useLoaderData,
  useOutletContext,
  Link,
  redirect,
  useFetcher,
  useNavigate,
} from "react-router";
import type { Route } from "./+types/dev.projects.$name";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";
import { db } from "~/db";
import { projects, projectMembers, users, configValues, events } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { useRef, useState, useEffect } from "react";
import { UserSelect } from "~/components/UserSelect";
import { Select } from "~/components/Select";
import { logEvent } from "~/lib/events.server";
import { formatEventDescription, type EventType } from "~/lib/events";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

type ContextType = {
  user: { id: string; username: string; email: string; isAdmin: boolean };
};

export async function loader({ params }: Route.LoaderArgs) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.name, params.name),
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const members = await db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, project.id));

  const stages = await db
    .select()
    .from(configValues)
    .where(eq(configValues.type, "project_stage"))
    .orderBy(configValues.sortOrder);

  const priorities = await db
    .select()
    .from(configValues)
    .where(eq(configValues.type, "project_priority"))
    .orderBy(configValues.sortOrder);

  const allUsers = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .orderBy(users.username);

  const creator = await db.query.users.findFirst({
    where: eq(users.id, project.createdBy),
    columns: { username: true },
  });

  // Get recent activity for this project
  const recentActivity = await db
    .select({
      id: events.id,
      type: events.type,
      metadata: events.metadata,
      createdAt: events.createdAt,
      actorUsername: users.username,
    })
    .from(events)
    .leftJoin(users, eq(events.actorId, users.id))
    .where(eq(events.projectId, project.id))
    .orderBy(desc(events.createdAt))
    .limit(5);

  return {
    project: { ...project, members, creatorName: creator?.username },
    stages,
    priorities,
    allUsers,
    recentActivity,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const currentUser = await getUserFromSession(sessionId);

  if (!currentUser) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  const project = await db.query.projects.findFirst({
    where: eq(projects.name, params.name),
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  if (intent === "delete") {
    // Log before deleting (so we have the project name)
    await logEvent({
      type: "project.deleted",
      actorId: currentUser.id,
      metadata: { name: project.name },
      projectId: project.id,
    });
    await db.delete(projects).where(eq(projects.id, project.id));
    return redirect("/dev/projects");
  }

  if (intent === "update-field") {
    const field = formData.get("field") as string;
    const value = formData.get("value") as string;

    if (field === "name") {
      const newName = value?.trim();
      if (!newName) {
        return { error: "Name is required" };
      }
      if (newName !== project.name) {
        // Check for duplicate
        const existing = await db.query.projects.findFirst({
          where: eq(projects.name, newName),
        });
        if (existing) {
          return { error: "A project with this name already exists" };
        }
        await db
          .update(projects)
          .set({ name: newName, updatedAt: new Date() })
          .where(eq(projects.id, project.id));
        await logEvent({
          type: "project.name_changed",
          actorId: currentUser.id,
          metadata: { from: project.name, to: newName },
          projectId: project.id,
        });
        return { redirect: `/dev/projects/${encodeURIComponent(newName)}` };
      }
    } else if (field === "stage") {
      if (value !== project.stage) {
        await db
          .update(projects)
          .set({ stage: value, updatedAt: new Date() })
          .where(eq(projects.id, project.id));
        await logEvent({
          type: "project.stage_changed",
          actorId: currentUser.id,
          metadata: { from: project.stage, to: value },
          projectId: project.id,
        });
      }
    } else if (field === "priority") {
      const newPriority = value || null;
      if (newPriority !== project.priority) {
        await db
          .update(projects)
          .set({ priority: newPriority, updatedAt: new Date() })
          .where(eq(projects.id, project.id));
        await logEvent({
          type: "project.priority_changed",
          actorId: currentUser.id,
          metadata: { from: project.priority, to: newPriority },
          projectId: project.id,
        });
      }
    } else if (field === "state") {
      const newState = value || null;
      if (newState !== project.state) {
        await db
          .update(projects)
          .set({ state: newState, updatedAt: new Date() })
          .where(eq(projects.id, project.id));
        await logEvent({
          type: "project.status_updated",
          actorId: currentUser.id,
          metadata: {},
          projectId: project.id,
        });
      }
    } else if (field === "description") {
      const newDescription = value || null;
      if (newDescription !== project.description) {
        await db
          .update(projects)
          .set({ description: newDescription, updatedAt: new Date() })
          .where(eq(projects.id, project.id));
        await logEvent({
          type: "project.description_updated",
          actorId: currentUser.id,
          metadata: {},
          projectId: project.id,
        });
      }
    }

    return { success: true };
  }

  if (intent === "update-members") {
    const memberIds = formData.getAll("members") as string[];

    // Get current members to calculate diff
    const currentMembers = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, project.id));
    const currentMemberIds = currentMembers.map((m) => m.userId);

    const added = memberIds.filter((id) => !currentMemberIds.includes(id));
    const removed = currentMemberIds.filter((id) => !memberIds.includes(id));

    // Only update if there are changes
    if (added.length > 0 || removed.length > 0) {
      await db.delete(projectMembers).where(eq(projectMembers.projectId, project.id));
      if (memberIds.length > 0) {
        await Promise.all(
          memberIds.map((userId) =>
            db.insert(projectMembers).values({
              id: nanoid(),
              projectId: project.id,
              userId,
              createdAt: new Date(),
            })
          )
        );
      }
      await db
        .update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, project.id));

      await logEvent({
        type: "project.members_changed",
        actorId: currentUser.id,
        metadata: { added, removed },
        projectId: project.id,
      });
    }

    return { success: true };
  }

  return { error: "Unknown action" };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.project?.name ? `${data.project.name} - notscared` : "Project - notscared" }];
}

function getStageColor(stage: string, stages: { value: string; color: string | null }[]) {
  const stageConfig = stages.find((s) => s.value === stage);
  if (stageConfig?.color === "green") return "text-green-600";
  if (stageConfig?.color === "amber") return "text-amber-600";
  if (stageConfig?.color === "red") return "text-red-600";
  return "text-gray-500";
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

export default function DevProjectDetail() {
  const { project, stages, priorities, allUsers, recentActivity } = useLoaderData<typeof loader>();
  const { user: currentUser } = useOutletContext<ContextType>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const nameRef = useRef<HTMLHeadingElement>(null);
  const stateInputRef = useRef<HTMLTextAreaElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    project.members.map((m) => m.id)
  );
  const [editingState, setEditingState] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [stateValue, setStateValue] = useState(project.state || "");
  const [descriptionValue, setDescriptionValue] = useState(project.description || "");

  // Sync selected members when project data changes (e.g., after save)
  useEffect(() => {
    setSelectedMembers(project.members.map((m) => m.id));
  }, [project.members]);

  // Sync state/description values when project data changes
  useEffect(() => {
    setStateValue(project.state || "");
    setDescriptionValue(project.description || "");
  }, [project.state, project.description]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingState && stateInputRef.current) {
      stateInputRef.current.focus();
    }
  }, [editingState]);

  useEffect(() => {
    if (editingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [editingDescription]);

  const updateField = (field: string, value: string) => {
    fetcher.submit({ intent: "update-field", field, value }, { method: "post" });
  };

  // Handle redirect after name change
  if (fetcher.data?.redirect) {
    navigate(fetcher.data.redirect);
  }

  const handleNameBlur = () => {
    const newName = nameRef.current?.textContent?.trim() || "";
    if (newName && newName !== project.name) {
      updateField("name", newName);
    } else if (nameRef.current) {
      nameRef.current.textContent = project.name;
    }
  };

  const handleStateSave = () => {
    if (stateValue !== (project.state || "")) {
      updateField("state", stateValue);
    }
    setEditingState(false);
  };

  const handleDescriptionSave = () => {
    if (descriptionValue !== (project.description || "")) {
      updateField("description", descriptionValue);
    }
    setEditingDescription(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, onSave: () => void) => {
    if (e.key === "Escape") {
      onSave();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to="/dev/projects" className="text-sm underline decoration-black/50 hover:decoration-black/25">
          Back to Projects
        </Link>
        <Form method="post" className="inline">
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            className="text-red-600 underline decoration-red-600/50 hover:decoration-red-600/25 text-sm"
            onClick={(e) => {
              if (!confirm(`Delete project "${project.name}"?`)) {
                e.preventDefault();
              }
            }}
          >
            Delete
          </button>
        </Form>
      </div>

      {fetcher.data?.error && <div className="alert alert-error">{fetcher.data.error}</div>}

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-6">
          <h1
            ref={nameRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleNameBlur}
            onKeyDown={(e) => handleKeyDown(e, handleNameBlur)}
            className="text-2xl font-semibold outline-none focus:bg-gray-50 px-1 -mx-1"
          >
            {project.name}
          </h1>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status</span>
              {!editingState && (
                <button
                  onClick={() => setEditingState(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon />
                </button>
              )}
            </div>
            {editingState ? (
              <div className="flex flex-col gap-2">
                <textarea
                  ref={stateInputRef}
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleStateSave)}
                  className="input min-h-[60px] text-sm resize-none"
                  placeholder="Where is this project at?"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleStateSave}
                    className="text-sm underline decoration-black/50 hover:decoration-black/25"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setStateValue(project.state || "");
                      setEditingState(false);
                    }}
                    className="text-sm text-gray-500 underline decoration-gray-500/50 hover:decoration-gray-500/25"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {project.state || <span className="text-gray-400">No status set</span>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Description</span>
              {!editingDescription && (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon />
                </button>
              )}
            </div>
            {editingDescription ? (
              <div className="flex flex-col gap-2">
                <textarea
                  ref={descriptionInputRef}
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleDescriptionSave)}
                  className="input min-h-[100px] text-sm resize-none"
                  placeholder="Project description..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDescriptionSave}
                    className="text-sm underline decoration-black/50 hover:decoration-black/25"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDescriptionValue(project.description || "");
                      setEditingDescription(false);
                    }}
                    className="text-sm text-gray-500 underline decoration-gray-500/50 hover:decoration-gray-500/25"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {project.description || <span className="text-gray-400">No description</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex flex-col gap-4 border-l pl-8">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Stage</span>
            <Select
              options={stages.map((s) => ({ value: s.value, label: s.label }))}
              value={project.stage}
              onChange={(value) => updateField("stage", value)}
              variant="inline"
              className={getStageColor(project.stage, stages)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Priority</span>
            <Select
              options={[
                { value: "", label: "None" },
                ...priorities.map((p) => ({ value: p.value, label: p.label })),
              ]}
              value={project.priority || ""}
              onChange={(value) => updateField("priority", value)}
              variant="inline"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Members</span>
            <UserSelect
              users={allUsers}
              selectedIds={selectedMembers}
              onChange={(ids) => {
                setSelectedMembers(ids);
                const formData = new FormData();
                formData.set("intent", "update-members");
                ids.forEach((id) => formData.append("members", id));
                fetcher.submit(formData, { method: "post" });
              }}
              placeholder="None"
              variant="inline"
            />
          </div>
        </div>
      </div>

      {/* Activity footer */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-500">Activity</h2>
          <Link
            to={`/dev/events?project=${encodeURIComponent(project.name)}`}
            className="text-sm underline decoration-black/50 hover:decoration-black/25"
          >
            View all
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentActivity.map((event) => {
              const metadata = event.metadata ? JSON.parse(event.metadata) : {};
              const description = formatEventDescription(
                event.type as EventType,
                metadata
              );

              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                    {event.actorUsername ? getInitials(event.actorUsername) : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{event.actorUsername || "Unknown"}</span>{" "}
                      {description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(new Date(event.createdAt))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
