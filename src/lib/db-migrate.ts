import type { Database } from "sql.js";

function tableHasColumn(db: Database, table: string, column: string): boolean {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.name === column) return true;
    }
    return false;
  } finally {
    stmt.free();
  }
}

export function migrateUsersColumns(db: Database) {
  if (!tableHasColumn(db, "users", "password_hash")) {
    db.run(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
  }
  if (!tableHasColumn(db, "users", "profile_image_path")) {
    db.run(`ALTER TABLE users ADD COLUMN profile_image_path TEXT`);
  }
}
