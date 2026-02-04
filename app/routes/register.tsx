import { Form, redirect, useActionData, useLoaderData, Link } from "react-router";
import type { Route } from "./+types/register";
import {
  createUser,
  getSessionCookie,
  login,
  parseSessionCookie,
  getUserFromSession,
  getInviteByCode,
} from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const user = await getUserFromSession(sessionId);
  if (user) {
    return redirect("/dev");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Validate invite code if provided
  if (code) {
    const invite = await getInviteByCode(code);
    if (!invite || !invite.isActive) {
      return redirect("/login?error=invalid_invite");
    }
    if (invite.maxUses !== null && (invite.useCount ?? 0) >= invite.maxUses) {
      return redirect("/login?error=invite_exhausted");
    }
  }

  return { code };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const inviteCode = formData.get("inviteCode") as string;

  if (!inviteCode) {
    return { error: "Invite code is required" };
  }

  const result = await createUser(email, username, password, inviteCode);

  if (result.error) {
    return { error: result.error };
  }

  // Auto-login after registration
  const loginResult = await login(email, password);

  if (loginResult.error) {
    return redirect("/login");
  }

  return redirect("/dev", {
    headers: {
      "Set-Cookie": getSessionCookie(loginResult.session!.id),
    },
  });
}

export function meta() {
  return [{ title: "Register - notscared" }];
}

export default function Register() {
  const { code } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xs">
        <h1 className="text-xl font-medium text-center pb-6">Register</h1>

        {actionData?.error && <div className="alert alert-error">{actionData.error}</div>}

        <Form method="post">
          <input type="hidden" name="inviteCode" value={code || ""} />

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input type="email" id="email" name="email" required className="input" />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              pattern="[a-zA-Z0-9_]+"
              className="input"
            />
            <div className="form-help">Letters, numbers, and underscores only</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="input"
            />
            <div className="form-help">At least 8 characters</div>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Create Account
          </button>
        </Form>

        <p className="pt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="underline decoration-black/50 hover:decoration-black/25">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
