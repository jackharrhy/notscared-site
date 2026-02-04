#!/usr/bin/env npx tsx

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import { join } from "path";
import { users } from "../app/db/schema";

const DATA_DIR = process.env.DATA_DIR || "./data";
const DB_NAME = process.env.DB_NAME || "notscared.db";
const DB_PATH = join(DATA_DIR, DB_NAME);

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error("Usage: pnpm create-user <email> <username> <password> [--admin]");
  process.exit(1);
}

const [email, username, password] = args;
const isAdmin = args.includes("--admin");

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

const passwordHash = Buffer.from(password).toString("base64");

try {
  const id = nanoid();
  db.insert(users)
    .values({
      id,
      email,
      username,
      passwordHash,
      isAdmin,
    })
    .run();

  console.log(`Created user: ${username} (${email})${isAdmin ? " [admin]" : ""}`);
} catch (error: unknown) {
  if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
    console.error("Error: Email or username already exists");
  } else {
    console.error("Error:", error);
  }
  process.exit(1);
}
