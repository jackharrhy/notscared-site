# Agent Style

## Database Migrations

This project uses Drizzle ORM with SQLite. When adding/modifying database schema:

1. Update the Schema, edit `app/db/schema.ts` with your changes.
2. Create Migration SQL File, create a new file in `drizzle/` with the naming pattern `NNNN_description.sql` (e.g., `0001_add_username_field.sql`).

**Important SQL syntax rules:**
- Use backticks around table and column names: `` ALTER TABLE `users` ADD `column_name` ... ``
- NOT double quotes (those will cause "no such column" errors)
- Follow the style of existing migrations in `drizzle/`

Example:
```sql
ALTER TABLE `users` ADD `requires_signup` integer NOT NULL DEFAULT 0;
```

### 3. Register in Journal

Add an entry to `drizzle/meta/_journal.json`:
```json
{
  "idx": 1,
  "version": "6", 
  "when": 1768703000000,
  "tag": "0001_add_username_field",
  "breakpoints": true
}
```
- `idx`: Next sequential number
- `tag`: Must match the SQL filename (without `.sql`)
- `when`: Timestamp (can increment from previous)

### 4. Run Migration

```bash
npm run db:migrate
```

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until your work is in the local main branch.

1. **Run quality gates** (if code changed) - `npm run build`.
2. **Commit** - Write a simple commit message, have some lines of bullet point description if it makes sense.
3. **Verify** - All changes committed to main
