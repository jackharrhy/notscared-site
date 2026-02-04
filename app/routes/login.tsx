import { Form, redirect, useActionData, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/login";
import { login, getSessionCookie, parseSessionCookie, getUserFromSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const user = await getUserFromSession(sessionId);
  if (user) {
    return redirect("/dev");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await login(email, password);

  if (result.error) {
    return { error: result.error };
  }

  return redirect("/dev", {
    headers: {
      "Set-Cookie": getSessionCookie(result.session!.id),
    },
  });
}

export function meta() {
  return [{ title: "Login - notscared" }];
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");

  let errorMessage = actionData?.error;
  if (errorParam === "invalid_invite") {
    errorMessage = "Invalid or expired invite link";
  } else if (errorParam === "invite_exhausted") {
    errorMessage = "This invite link has reached its usage limit";
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xs">
        {errorMessage && <div className="alert alert-error mb-4">{errorMessage}</div>}

        <Form method="post">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input type="email" id="email" name="email" required className="input" />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input type="password" id="password" name="password" required className="input" />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Login
          </button>
        </Form>

        <p className="mt-4 text-sm text-center">
          <Link to="/" className="underline hover:no-underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
