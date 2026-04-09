"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getDb, persistDb } from "@/lib/db";
import type { Database } from "sql.js";
import { getCreation, getUserByEmail, getUserById, getUserHomeCustom } from "@/lib/queries";
import { isValidCPF, normalizeCPF } from "@/lib/cpf";
import type { HomeBlock } from "@/lib/home-blocks";
import { parseHomeBlocks, serializeHomeBlocks } from "@/lib/home-blocks";

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

async function requireUserId(): Promise<number | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(userId) && userId > 0 ? userId : null;
}

async function saveUserUpload(
  userId: number,
  file: File,
  namePrefix: string,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (file.size > MAX_UPLOAD) return { ok: false, error: "A imagem deve ter no máximo 4 MB." };
  if (!ALLOWED_TYPES.has(file.type)) return { ok: false, error: "Use JPG, PNG, WebP ou GIF." };
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
  const filename = `${namePrefix}-${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsRoot, filename), buf);
  return { ok: true, path: `/uploads/${userId}/${filename}` };
}

export type UpdateProfileState = { error?: string; ok?: boolean };

export async function updateProfile(
  _prev: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const userId = await requireUserId();
  if (!userId) return { error: "Sessão expirada. Faça login novamente." };

  const user = await getUserById(userId);
  if (!user) return { error: "Usuário não encontrado." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const faixa = String(formData.get("faixa") ?? "").trim();
  const pesoStr = String(formData.get("peso") ?? "");
  const idadeStr = String(formData.get("idade") ?? "");
  const academia = String(formData.get("academia") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();

  if (!fullName || !phone || !faixa || !academia || !gender) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const peso = Number.parseFloat(pesoStr.replace(",", "."));
  if (!Number.isFinite(peso) || peso <= 0 || peso > 500) {
    return { error: "Informe um peso válido (kg)." };
  }
  const idade = Number.parseInt(idadeStr, 10);
  if (!Number.isFinite(idade) || idade < 3 || idade > 120) {
    return { error: "Informe uma idade válida." };
  }

  let profileImagePath: string | null = user.profile_image_path;

  const pic = formData.get("profileImage");
  if (pic instanceof File && pic.size > 0) {
    const up = await saveUserUpload(userId, pic, "profile");
    if (!up.ok) return { error: up.error };
    profileImagePath = up.path;
  }

  const db = await getDb();
  try {
    db.run(
      `UPDATE users SET full_name = ?, phone = ?, faixa = ?, peso = ?, idade = ?, academia = ?, gender = ?, profile_image_path = ? WHERE id = ?`,
      [fullName, phone, faixa, peso, idade, academia, gender, profileImagePath, userId],
    );
    persistDb(db);
  } catch {
    return { error: "Não foi possível salvar. Tente novamente." };
  }
  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard/perfil/editar");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export type SaveHomeCustomState = { error?: string; ok?: boolean };

export async function saveHomeCustom(
  _prev: SaveHomeCustomState | undefined,
  formData: FormData,
): Promise<SaveHomeCustomState> {
  const userId = await requireUserId();
  if (!userId) return { error: "Sessão expirada. Faça login novamente." };

  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();
  const rawBlocks = String(formData.get("blocksJson") ?? "[]");

  const slotSubtitles = [0, 1, 2, 3].map((i) => String(formData.get(`slotSubtitle${i}`) ?? "").trim());
  const slotLinks = [0, 1, 2, 3].map((i) => String(formData.get(`slotLink${i}`) ?? "").trim());
  const slotSubtitlesJson = JSON.stringify(slotSubtitles);
  const slotLinksJson = JSON.stringify(slotLinks);

  let extraPaths: string[] = [];
  try {
    extraPaths = JSON.parse(String(formData.get("extraImagesJson") ?? "[]")) as string[];
    if (!Array.isArray(extraPaths)) extraPaths = [];
    extraPaths = extraPaths.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    extraPaths = [];
  }

  let blocks: HomeBlock[];
  try {
    blocks = parseHomeBlocks(rawBlocks);
  } catch {
    return { error: "Dados dos blocos inválidos." };
  }

  const existing = await getUserHomeCustom(userId);
  let heroImagePath: string | null = existing?.hero_image_path ?? null;
  let heroImagePath2: string | null = existing?.hero_image_path_2 ?? null;
  let heroImagePath3: string | null = existing?.hero_image_path_3 ?? null;
  let heroImagePath4: string | null = existing?.hero_image_path_4 ?? null;

  const heroFile = formData.get("heroImage");
  if (heroFile instanceof File && heroFile.size > 0) {
    const up = await saveUserUpload(userId, heroFile, "hero");
    if (!up.ok) return { error: up.error };
    heroImagePath = up.path;
  }
  const heroFile2 = formData.get("heroImage2");
  if (heroFile2 instanceof File && heroFile2.size > 0) {
    const up = await saveUserUpload(userId, heroFile2, "hero2");
    if (!up.ok) return { error: up.error };
    heroImagePath2 = up.path;
  }
  const heroFile3 = formData.get("heroImage3");
  if (heroFile3 instanceof File && heroFile3.size > 0) {
    const up = await saveUserUpload(userId, heroFile3, "hero3");
    if (!up.ok) return { error: up.error };
    heroImagePath3 = up.path;
  }
  const heroFile4 = formData.get("heroImage4");
  if (heroFile4 instanceof File && heroFile4.size > 0) {
    const up = await saveUserUpload(userId, heroFile4, "hero4");
    if (!up.ok) return { error: up.error };
    heroImagePath4 = up.path;
  }

  if (String(formData.get("removeHeroImage") ?? "") === "1") heroImagePath = null;
  if (String(formData.get("removeHeroImage2") ?? "") === "1") heroImagePath2 = null;
  if (String(formData.get("removeHeroImage3") ?? "") === "1") heroImagePath3 = null;
  if (String(formData.get("removeHeroImage4") ?? "") === "1") heroImagePath4 = null;

  for (const [key, val] of formData.entries()) {
    if (typeof key === "string" && key.startsWith("extraNew_") && val instanceof File && val.size > 0) {
      const up = await saveUserUpload(userId, val, "extra");
      if (!up.ok) return { error: up.error };
      extraPaths.push(up.path);
    }
  }
  const extraImagesJson = JSON.stringify(extraPaths);

  const merged: HomeBlock[] = [];
  for (const block of blocks) {
    if (block.type === "link") {
      merged.push({
        id: block.id,
        type: "link",
        label: String(block.label ?? "").trim() || "Link",
        url: String(block.url ?? "").trim(),
      });
    } else if (block.type === "date") {
      merged.push({
        id: block.id,
        type: "date",
        label: String(block.label ?? "").trim() || "Data",
        date: String(block.date ?? "").trim(),
      });
    } else if (block.type === "photo") {
      let imagePath = String(block.image_path ?? "").trim();
      const key = `block_image_${block.id}`;
      const f = formData.get(key);
      if (f instanceof File && f.size > 0) {
        const up = await saveUserUpload(userId, f, `block-${block.id}`);
        if (!up.ok) return { error: up.error };
        imagePath = up.path;
      }
      if (!imagePath) {
        const prev = existing ? parseHomeBlocks(existing.blocks_json) : [];
        const old = prev.find((b) => b.id === block.id && b.type === "photo");
        if (old && old.type === "photo") imagePath = old.image_path;
      }
      merged.push({
        id: block.id,
        type: "photo",
        label: String(block.label ?? "").trim() || "Foto",
        image_path: imagePath,
      });
    }
  }

  const db = await getDb();
  const json = serializeHomeBlocks(merged);
  try {
    if (existing) {
      db.run(
        `UPDATE user_home_custom SET hero_title = ?, hero_subtitle = ?, hero_image_path = ?, hero_image_path_2 = ?, hero_image_path_3 = ?, hero_image_path_4 = ?, slot_subtitles_json = ?, slot_links_json = ?, extra_images_json = ?, blocks_json = ?, updated_at = datetime('now') WHERE user_id = ?`,
        [
          heroTitle,
          heroSubtitle,
          heroImagePath,
          heroImagePath2,
          heroImagePath3,
          heroImagePath4,
          slotSubtitlesJson,
          slotLinksJson,
          extraImagesJson,
          json,
          userId,
        ],
      );
    } else {
      db.run(
        `INSERT INTO user_home_custom (user_id, hero_title, hero_subtitle, hero_image_path, hero_image_path_2, hero_image_path_3, hero_image_path_4, slot_subtitles_json, slot_links_json, extra_images_json, blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          heroTitle,
          heroSubtitle,
          heroImagePath,
          heroImagePath2,
          heroImagePath3,
          heroImagePath4,
          slotSubtitlesJson,
          slotLinksJson,
          extraImagesJson,
          json,
        ],
      );
    }
    persistDb(db);
  } catch {
    return { error: "Não foi possível salvar. Tente novamente." };
  }
  revalidatePath("/dashboard/principal");
  revalidatePath("/dashboard/personalizar");
  revalidatePath("/dashboard/campeonatos");
  revalidatePath("/dashboard/campeonatos/ver");
  revalidatePath("/dashboard/ver-tudo");
  return { ok: true };
}
