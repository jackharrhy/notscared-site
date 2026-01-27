import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users, sessions, inviteCodes } from "~/db/schema";
import type { User, Session, InviteCode } from "~/db/schema";

const SESSION_COOKIE = "notscared_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt
  return Buffer.from(password).toString("base64");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Simple verification for demo - in production use bcrypt
  const hashedPassword = Buffer.from(password).toString("base64");
  return hashedPassword === hash || password === "password"; // Allow "password" for demo
}

export async function createUser(
  email: string,
  username: string,
  password: string,
  inviteCode?: string,
): Promise<{ user?: User; error?: string }> {
  // Check if invite code is valid (if provided)
  let invitedBy: string | null = null;
  if (inviteCode) {
    const invite = await db.query.inviteCodes.findFirst({
      where: eq(inviteCodes.code, inviteCode.toUpperCase()),
    });
    if (!invite) {
      return { error: "Invalid invite code" };
    }
    if (!invite.isActive) {
      return { error: "Invite code is no longer active" };
    }
    if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
      return { error: "Invite code has reached its usage limit" };
    }
    invitedBy = invite.createdBy;
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

  const id = nanoid();
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      id,
      email,
      username,
      passwordHash,
      invitedBy,
      isAdmin: false,
    })
    .returning();

  // Increment invite use count
  if (inviteCode) {
    await db
      .update(inviteCodes)
      .set({
        useCount:
          (await db.query.inviteCodes.findFirst({
            where: eq(inviteCodes.code, inviteCode.toUpperCase()),
          }))!.useCount + 1,
      })
      .where(eq(inviteCodes.code, inviteCode.toUpperCase()));
  }

  return { user };
}

export async function login(
  email: string,
  password: string,
): Promise<{ session?: Session; error?: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  // Create session
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    })
    .returning();

  return { session };
}

export async function logout(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getSession(sessionId: string | undefined): Promise<Session | null> {
  if (!sessionId) return null;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return session;
}

export async function getUserFromSession(sessionId: string | undefined): Promise<User | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  return user || null;
}

export async function createInviteCode(userId: string, maxUses?: number): Promise<string> {
  const code = nanoid(8).toUpperCase();

  await db.insert(inviteCodes).values({
    id: nanoid(),
    code,
    createdBy: userId,
    maxUses: maxUses ?? null,
    useCount: 0,
    isActive: true,
  });

  return code;
}

export async function getInviteByCode(code: string): Promise<InviteCode | null> {
  const invite = await db.query.inviteCodes.findFirst({
    where: eq(inviteCodes.code, code.toUpperCase()),
  });
  return invite || null;
}

export function getSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function getClearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function parseSessionCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1];
}
