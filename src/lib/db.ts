import initSqlJs from "sql.js";
import type { Database } from "sql.js";
import fs from "fs";
import path from "path";
import { migrateHomeHeroExtraSlots, migrateUsersColumns } from "@/lib/db-migrate";

const dbPath = path.join(process.cwd(), "data", "vitorum.db");

function ensureDataDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

function migrate(db: Database) {
  db.run(`PRAGMA foreign_keys = ON;`);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      faixa TEXT NOT NULL,
      peso REAL NOT NULL,
      idade INTEGER NOT NULL,
      academia TEXT NOT NULL,
      gender TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_creations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      slot INTEGER NOT NULL CHECK(slot >= 1 AND slot <= 3),
      image_path TEXT,
      link_url TEXT,
      event_date TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, slot),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_home_custom (
      user_id INTEGER PRIMARY KEY,
      hero_title TEXT NOT NULL DEFAULT '',
      hero_subtitle TEXT NOT NULL DEFAULT '',
      hero_image_path TEXT,
      blocks_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  migrateUsersColumns(db);
  migrateHomeHeroExtraSlots(db);
}

export function persistDb(db: Database) {
  ensureDataDir();
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

async function createDatabase(): Promise<Database> {
  ensureDataDir();
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
  });

  let db: Database;
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  migrate(db);
  persistDb(db);
  return db;
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = createDatabase().then((d) => {
      dbInstance = d;
      return d;
    });
  }
  return initPromise;
}

export type UserRow = {
  id: number;
  full_name: string;
  email: string;
  cpf: string;
  phone: string;
  faixa: string;
  peso: number;
  idade: number;
  academia: string;
  gender: string;
  created_at: string;
  password_hash: string | null;
  profile_image_path: string | null;
};

export type CreationRow = {
  id: number;
  user_id: number;
  slot: number;
  image_path: string | null;
  link_url: string | null;
  event_date: string | null;
  updated_at: string;
};

export type HomeCustomRow = {
  user_id: number;
  hero_title: string;
  hero_subtitle: string;
  hero_event_date?: string | null;
  /** JSON ["","","",""] — legenda por slot */
  slot_subtitles_json?: string | null;
  /** JSON ["","","",""] — URL ao tocar na foto */
  slot_links_json?: string | null;
  /** JSON string[] — mais imagens (galeria) */
  extra_images_json?: string | null;
  hero_image_path: string | null;
  hero_image_path_2?: string | null;
  hero_image_path_3?: string | null;
  hero_image_path_4?: string | null;
  blocks_json: string;
  updated_at: string;
};
