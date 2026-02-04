import { Form, redirect, useActionData, useOutletContext, Link } from "react-router";
import type { Route } from "./+types/dev.users.create";
import { parseSessionCookie, getUserFromSession } from "~/lib/auth.server";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type ContextType = {
  user: { id: string; username: string; email: string; isAdmin: boolean };
};

export async function action({ request }: Route.ActionArgs) {
  const sessionId = parseSessionCookie(request.headers.get("Cookie"));
  const currentUser = await getUserFromSession(sessionId);

  if (!currentUser || !currentUser.isAdmin) {
    return { error: "Unauthorized" };
  }

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const isAdmin = formData.get("isAdmin") === "on";

  if (!email || !username || !password) {
    return { error: "All fields are required" };
  }

  // Check if email already exists
  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingEmail) {
    return { error: "Email already registered" };
  }

  // Check if username already exists
  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (existingUsername) {
    return { error: "Username already taken" };
  }

  const passwordHash = Buffer.from(password).toString("base64");

  await db.insert(users).values({
    id: nanoid(),
    email,
    username,
    passwordHash,
    isAdmin,
  });

  return redirect("/dev/users");
}

export function meta() {
  return [{ title: "Create User - notscared" }];
}

export default function DevUsersCreate() {
  const actionData = useActionData<typeof action>();
  const { user: currentUser } = useOutletContext<ContextType>();

  if (!currentUser.isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-red-600">You don't have permission to create users.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link to="/dev/users" className="text-sm underline decoration-black/50 hover:decoration-black/25">
          Back to Users
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Create User</h1>

      {actionData?.error && <div className="alert alert-error">{actionData.error}</div>}

      <Form method="post" className="max-w-sm flex flex-col gap-4">
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

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isAdmin" name="isAdmin" className="cursor-pointer" />
          <label htmlFor="isAdmin" className="text-sm cursor-pointer">
            Admin
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Create User
        </button>
      </Form>
    </div>
  );
}
