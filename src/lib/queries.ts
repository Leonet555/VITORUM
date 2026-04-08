import { getDb, type CreationRow, type UserRow } from "@/lib/db";

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  stmt.bind([email.toLowerCase().trim()]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as unknown as UserRow;
  stmt.free();
  return row;
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as unknown as UserRow;
  stmt.free();
  return row;
}

export async function getCreation(userId: number, slot: number): Promise<CreationRow | null> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM user_creations WHERE user_id = ? AND slot = ?`);
  stmt.bind([userId, slot]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as unknown as CreationRow;
  stmt.free();
  return row;
}
