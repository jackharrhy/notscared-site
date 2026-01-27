import { redirect, Form, useLoaderData, Link } from "react-router";
import type { Route } from "./+types/dev";
import { parseSessionCookie, getUserFromSession, getClearSessionCookie, logout } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const user = await getUserFromSession(sessionId);
  
  if (!user) {
    return redirect("/login");
  }

  return { user: { username: user.username, email: user.email } };
}

export async function action({ request }: Route.ActionArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  
  if (sessionId) {
    await logout(sessionId);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": getClearSessionCookie(),
    },
  });
}

export function meta() {
  return [{ title: "Dev - notscared" }];
}

export default function Dev() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-2">you are logged in</h1>
      <p className="text-gray-600 mb-8">Welcome, {user.username}</p>
      
      <Form method="post">
        <button type="submit" className="btn btn-primary">
          Logout
        </button>
      </Form>
      
      <p className="mt-4 text-sm">
        <Link to="/" className="underline hover:no-underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
