/**
 * Remove todas as contas (users) e criações associadas do SQLite em data/vitorum.db
 * Uso: node scripts/clear-accounts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dbPath = path.join(root, "data", "vitorum.db");

if (!fs.existsSync(dbPath)) {
  console.log("Nenhum ficheiro de base de dados em:", dbPath);
  process.exit(0);
}

const SQL = await initSqlJs({
  locateFile: (file) => path.join(root, "node_modules", "sql.js", "dist", file),
});

const buf = fs.readFileSync(dbPath);
const db = new SQL.Database(buf);
db.run("PRAGMA foreign_keys = ON");
db.run("DELETE FROM user_creations");
db.run("DELETE FROM users");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.writeFileSync(dbPath, Buffer.from(db.export()));
console.log("Todas as contas foram removidas de", dbPath);
