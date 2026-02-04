import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { parseSessionCookie, getClearSessionCookie, logout } from "~/lib/auth.server";

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

export async function loader() {
  return redirect("/");
}
