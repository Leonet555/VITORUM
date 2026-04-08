"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getDb, persistDb } from "@/lib/db";
import type { Database } from "sql.js";
import { getCreation, getUserByEmail } from "@/lib/queries";
import { isValidCPF, normalizeCPF } from "@/lib/cpf";

const SESSION_COOKIE = "vitorum_session";
const MAX_UPLOAD = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type RegisterState = { error?: string };
export type LoginState = { error?: string };

function lastInsertRowid(db: Database): number {
  const r = db.exec("SELECT last_insert_rowid() AS id");
  const v = r[0]?.values[0]?.[0];
  return typeof v === "number" ? v : Number(v);
}

export async function registerUser(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const cpfRaw = String(formData.get("cpf") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const faixa = String(formData.get("faixa") ?? "").trim();
  const pesoStr = String(formData.get("peso") ?? "");
  const idadeStr = String(formData.get("idade") ?? "");
  const academia = String(formData.get("academia") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!fullName || !email || !phone || !faixa || !academia || !gender) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  if (password !== passwordConfirm) return { error: "As senhas não coincidem." };

  const cpf = normalizeCPF(cpfRaw);
  if (!isValidCPF(cpf)) return { error: "CPF inválido." };

  const peso = Number.parseFloat(pesoStr.replace(",", "."));
  if (!Number.isFinite(peso) || peso <= 0 || peso > 500) {
    return { error: "Informe um peso válido (kg)." };
  }
  const idade = Number.parseInt(idadeStr, 10);
  if (!Number.isFinite(idade) || idade < 3 || idade > 120) {
    return { error: "Informe uma idade válida." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const db = await getDb();

  try {
    db.run(
      `INSERT INTO users (full_name, email, cpf, phone, faixa, peso, idade, academia, gender, password_hash, profile_image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [fullName, email, cpf, phone, faixa, peso, idade, academia, gender, passwordHash],
    );
    const newId = lastInsertRowid(db);
    persistDb(db);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, String(newId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.toLowerCase().includes("constraint")) {
      if (msg.toLowerCase().includes("email")) return { error: "Este e-mail já está cadastrado." };
      return { error: "Este CPF já está cadastrado." };
    }
    return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  redirect("/dashboard/principal");
}

export async function loginUser(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || !password) return { error: "Preencha nome, e-mail e senha." };

  const user = await getUserByEmail(email);
  if (!user?.password_hash) return { error: "E-mail ou senha incorretos." };
  if (user.full_name.trim().toLowerCase() !== name.trim().toLowerCase()) {
    return { error: "Nome não confere com o cadastro." };
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { error: "E-mail ou senha incorretos." };

  (await cookies()).set(SESSION_COOKIE, String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/dashboard/principal");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export type SaveCreationState = { error?: string; ok?: boolean };

export async function saveCreation(
  _prev: SaveCreationState | undefined,
  formData: FormData,
): Promise<SaveCreationState> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = raw ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(userId) || userId <= 0) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const slot = Number.parseInt(String(formData.get("slot") ?? ""), 10);
  if (slot !== 1 && slot !== 2 && slot !== 3) return { error: "Área inválida." };

  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const file = formData.get("image");
  let imagePath: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD) return { error: "A imagem deve ter no máximo 4 MB." };
    if (!ALLOWED_TYPES.has(file.type)) return { error: "Use JPG, PNG, WebP ou GIF." };
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", String(userId));
    if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
    const filename = `${slot}-${randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(uploadsRoot, filename), Buffer.from(await file.arrayBuffer()));
    imagePath = `/uploads/${userId}/${filename}`;
  }

  const db = await getDb();
  const existing = await getCreation(userId, slot);
  if (imagePath === null && existing?.image_path) imagePath = existing.image_path;

  try {
    if (existing) {
      db.run(
        `UPDATE user_creations SET image_path = ?, link_url = ?, event_date = ?, updated_at = datetime('now') WHERE user_id = ? AND slot = ?`,
        [imagePath, linkUrl || null, eventDate || null, userId, slot],
      );
    } else {
      db.run(
        `INSERT INTO user_creations (user_id, slot, image_path, link_url, event_date) VALUES (?, ?, ?, ?, ?)`,
        [userId, slot, imagePath, linkUrl || null, eventDate || null],
      );
    }
    persistDb(db);
  } catch {
    return { error: "Não foi possível salvar. Tente novamente." };
  }
  return { ok: true };
}
