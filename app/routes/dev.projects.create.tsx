import { Form, redirect, useActionData, useLoaderData, useOutletContext, Link } from "react-router";
import type { Route } from "./+types/dev.projects.create";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";
import { db } from "~/db";
import { projects, projectMembers, users, configValues } from "~/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { useState } from "react";
import { UserSelect } from "~/components/UserSelect";
import { Select } from "~/components/Select";
import { logEvent } from "~/lib/events.server";

type ContextType = {
  user: { id: string; username: string; email: string; isAdmin: boolean };
};

export async function loader() {
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

  return { stages, priorities, users: allUsers };
}

export async function action({ request }: Route.ActionArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const currentUser = await getUserFromSession(sessionId);

  if (!currentUser) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const stage = formData.get("stage") as string;
  const priority = formData.get("priority") as string;
  const memberIds = formData.getAll("members") as string[];

  const projectName = name?.trim();
  if (!projectName) {
    return { error: "Name is required" };
  }

  // Check if name already exists
  const existing = await db.query.projects.findFirst({
    where: eq(projects.name, projectName),
  });
  if (existing) {
    return { error: "A project with this name already exists" };
  }

  const projectId = nanoid();
  const now = new Date();

  await db.insert(projects).values({
    id: projectId,
    name: projectName,
    stage: stage || "idea",
    priority: priority || null,
    createdBy: currentUser.id,
    createdAt: now,
    updatedAt: now,
  });

  // Add members
  if (memberIds.length > 0) {
    await Promise.all(
      memberIds.map((userId) =>
        db.insert(projectMembers).values({
          id: nanoid(),
          projectId,
          userId,
          createdAt: now,
        })
      )
    );
  }

  // Log project created event
  await logEvent({
    type: "project.created",
    actorId: currentUser.id,
    metadata: {},
    projectId,
  });

  return redirect(`/dev/projects/${encodeURIComponent(projectName)}`);
}

export function meta() {
  return [{ title: "New Project - notscared" }];
}

export default function DevProjectsCreate() {
  const { stages, priorities, users: allUsers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { user: currentUser } = useOutletContext<ContextType>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);
  const [selectedStage, setSelectedStage] = useState(stages[0]?.value || "idea");
  const [selectedPriority, setSelectedPriority] = useState("");

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link to="/dev/projects" className="text-sm underline decoration-black/50 hover:decoration-black/25">
          Back to Projects
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">New Project</h1>

      {actionData?.error && <div className="alert alert-error">{actionData.error}</div>}

      <Form method="post" className="max-w-md flex flex-col gap-4">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input type="text" id="name" name="name" required className="input" />
        </div>

        <div className="form-group">
          <label className="form-label">Stage</label>
          <Select
            options={stages.map((s) => ({ value: s.value, label: s.label }))}
            value={selectedStage}
            onChange={setSelectedStage}
            name="stage"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <Select
            options={[
              { value: "", label: "None" },
              ...priorities.map((p) => ({ value: p.value, label: p.label })),
            ]}
            value={selectedPriority}
            onChange={setSelectedPriority}
            name="priority"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Members</label>
          <UserSelect
            users={allUsers}
            selectedIds={selectedMembers}
            onChange={setSelectedMembers}
            name="members"
            placeholder="Select members..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Project
        </button>
      </Form>
    </div>
  );
}
