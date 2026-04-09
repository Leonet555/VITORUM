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

export function migrateHomeHeroExtraSlots(db: Database) {
  if (!tableHasColumn(db, "user_home_custom", "hero_image_path_2")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN hero_image_path_2 TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "hero_image_path_3")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN hero_image_path_3 TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "hero_image_path_4")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN hero_image_path_4 TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "hero_event_date")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN hero_event_date TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "slot_subtitles_json")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN slot_subtitles_json TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "slot_links_json")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN slot_links_json TEXT`);
  }
  if (!tableHasColumn(db, "user_home_custom", "extra_images_json")) {
    db.run(`ALTER TABLE user_home_custom ADD COLUMN extra_images_json TEXT`);
  }
}
