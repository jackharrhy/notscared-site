import { join } from "path";

export const DATA_DIR = process.env.DATA_DIR || "./data";
export const DB_NAME = process.env.DB_NAME || "notscared.db";
export const DB_PATH = join(DATA_DIR, DB_NAME);
