#!/bin/sh
# Run against a built image; no production data or network access.
set -eu
container=$(docker run -d --network none --tmpfs /app/data \
  -v "$PWD/drizzle:/fixtures:ro" "${1:?built image required}")
trap 'docker logs "$container"; docker rm -f "$container" >/dev/null' EXIT

docker exec -i "$container" node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
assert.equal(process.versions.node.split('.')[0], '26');
assert.equal(process.config.variables.v8_enable_pointer_compression, 1);
const db = new Database('/app/data/notscared.db');
migrate(drizzle(db), { migrationsFolder: '/fixtures' });
migrate(drizzle(db), { migrationsFolder: '/fixtures' });
db.exec('CREATE TABLE runtime_probe(value INTEGER); INSERT INTO runtime_probe VALUES (26)');
assert.equal(db.prepare('SELECT value FROM runtime_probe').get().value, 26);
db.close();
for (const path of ['/', '/login', '/register']) {
  let response;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { response = await fetch(`http://127.0.0.1:3000${path}`); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  assert.equal(response?.status, 200, path);
  assert.match(await response.text(), /notscared/i);
  console.log(path, response.status);
}
console.log(process.version, 'pointer compression=1; SQLite migrations and round-trip OK');
JS
