import { useLoaderData, useOutletContext, Link } from "react-router";
import type { Route } from "./+types/dev.projects";
import { db } from "~/db";
import { projects, projectMembers, users, configValues } from "~/db/schema";
import { eq, desc } from "drizzle-orm";

type ContextType = {
  user: { id: string; username: string; email: string; isAdmin: boolean };
};

export async function loader() {
  const allProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      stage: projects.stage,
      priority: projects.priority,
      createdAt: projects.createdAt,
      createdBy: projects.createdBy,
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt));

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

  // Get members for each project
  const projectsWithMembers = await Promise.all(
    allProjects.map(async (project) => {
      const members = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .where(eq(projectMembers.projectId, project.id));

      return { ...project, members };
    })
  );

  return {
    projects: projectsWithMembers,
    stages,
    priorities,
  };
}

export function meta() {
  return [{ title: "Projects - notscared" }];
}

function getStageColor(stage: string, stages: { value: string; color: string | null }[]) {
  const stageConfig = stages.find((s) => s.value === stage);
  if (stageConfig?.color === "green") return "text-green-600";
  if (stageConfig?.color === "amber") return "text-amber-600";
  if (stageConfig?.color === "red") return "text-red-600";
  return "text-gray-500";
}

function getPriorityColor(priority: string | null, priorities: { value: string; color: string | null }[]) {
  if (!priority) return "text-gray-400";
  const priorityConfig = priorities.find((p) => p.value === priority);
  if (priorityConfig?.color === "green") return "text-green-600";
  if (priorityConfig?.color === "amber") return "text-amber-600";
  if (priorityConfig?.color === "red") return "text-red-600";
  return "text-gray-500";
}

export default function DevProjects() {
  const { projects, stages, priorities } = useLoaderData<typeof loader>();
  const { user: currentUser } = useOutletContext<ContextType>();

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link to="/dev/projects/create" className="btn btn-primary">
          New Project
        </Link>
      </div>

      <div className="border overflow-hidden">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Stage</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Priority</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Members</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-sm text-gray-500 text-center">
                  No projects yet.{" "}
                  <Link
                    to="/dev/projects/create"
                    className="underline decoration-black/50 hover:decoration-black/25"
                  >
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const stageLabel = stages.find((s) => s.value === project.stage)?.label || project.stage;
                const priorityLabel = priorities.find((p) => p.value === project.priority)?.label;

                return (
                  <tr key={project.id}>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/dev/projects/${encodeURIComponent(project.name)}`}
                        className="underline decoration-black/50 hover:decoration-black/25 font-medium"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getStageColor(project.stage, stages)}`}>
                        {stageLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {priorityLabel ? (
                        <span className={`font-medium ${getPriorityColor(project.priority, priorities)}`}>
                          {priorityLabel}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.members.length > 0
                        ? project.members.map((m) => m.username).join(", ")
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        {projects.length} project{projects.length !== 1 && "s"} total
      </p>
    </div>
  );
}
