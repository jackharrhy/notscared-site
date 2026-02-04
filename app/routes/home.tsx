import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const user = await getUserFromSession(sessionId);
  return { user: user ? { username: user.username } : null };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "notscared" }, { name: "description", content: "notscared - coming soon" }];
}

export default function Home() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-semibold tracking-tight">notscared</h1>
      <p className="text-lg text-gray-600">coming soon</p>
      {user ? (
        <Link to="/dev" className="text-sm underline decoration-black/50 hover:decoration-black/25 mt-6">
          hello {user.username}, head to /dev
        </Link>
      ) : (
        <Link to="/login" className="text-sm underline decoration-black/50 hover:decoration-black/25 mt-6">
          login
        </Link>
      )}
    </main>
  );
}
