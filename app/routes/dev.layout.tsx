import { redirect, Form, useLoaderData, Outlet, NavLink } from "react-router";
import type { Route } from "./+types/dev.layout";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const user = await getUserFromSession(sessionId);

  if (!user) {
    return redirect("/login");
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  };
}

export default function DevLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold">notscared</span>
          <div className="flex gap-4">
            <NavLink
              to="/dev"
              end
              className={({ isActive }) =>
                isActive ? "text-black font-medium" : "text-gray-500 hover:text-black"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/dev/users"
              className={({ isActive }) =>
                isActive ? "text-black font-medium" : "text-gray-500 hover:text-black"
              }
            >
              Users
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">{user.username}</span>
          <Form method="post" action="/logout">
            <button type="submit" className="underline decoration-black/50 hover:decoration-black/25">
              Logout
            </button>
          </Form>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet context={{ user }} />
      </main>
      <footer className="px-4 py-3 text-center">
        <NavLink
          to="/dev/design"
          className={({ isActive }) =>
            isActive
              ? "text-black font-medium text-sm"
              : "text-gray-400 hover:text-gray-600 text-sm"
          }
        >
          Design System
        </NavLink>
      </footer>
    </div>
  );
}
