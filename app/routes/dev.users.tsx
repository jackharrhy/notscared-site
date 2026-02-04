import { Form, useLoaderData, useOutletContext, Link } from "react-router";
import type { Route } from "./+types/dev.users";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

type ContextType = {
  user: { id: string; username: string; email: string; isAdmin: boolean };
};

export async function loader() {
  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      email: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return { users: allUsers };
}

export async function action({ request }: Route.ActionArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const currentUser = await getUserFromSession(sessionId);

  if (!currentUser || !currentUser.isAdmin) {
    return { error: "Unauthorized" };
  }

  const formData = await request.formData();
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID required" };
  }

  // Prevent deleting yourself
  if (userId === currentUser.id) {
    return { error: "Cannot delete yourself" };
  }

  // Check if target user is an admin
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!targetUser) {
    return { error: "User not found" };
  }

  if (targetUser.isAdmin) {
    return { error: "Cannot delete other admins" };
  }

  // Delete user (sessions will cascade)
  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}

export function meta() {
  return [{ title: "Users - notscared" }];
}

export default function DevUsers() {
  const { users } = useLoaderData<typeof loader>();
  const { user: currentUser } = useOutletContext<ContextType>();

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        {currentUser.isAdmin && (
          <Link to="/dev/users/create" className="btn btn-primary">
            New User
          </Link>
        )}
      </div>

      <div className="border overflow-hidden">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Username</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
              {currentUser.isAdmin && (
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm">
                  {user.username}
                  {user.id === currentUser.id && (
                    <span className="ml-2 text-gray-400">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-sm">
                  {user.isAdmin ? (
                    <span className="text-amber-600 font-medium">Admin</span>
                  ) : (
                    <span className="text-gray-500">User</span>
                  )}
                </td>
                {currentUser.isAdmin && (
                  <td className="px-4 py-3 text-sm text-right">
                    {!user.isAdmin && user.id !== currentUser.id && (
                      <Form method="post" className="inline">
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="text-red-600 underline decoration-red-600/50 hover:decoration-red-600/25 text-sm"
                          onClick={(e) => {
                            if (!confirm(`Delete user ${user.username}?`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </Form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        {users.length} user{users.length !== 1 && "s"} total
      </p>
    </div>
  );
}
