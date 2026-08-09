"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne, withTransaction } from "./db";
import {
  getCurrentBreederId,
  setCurrentBreeder,
  clearCurrentBreeder,
} from "./auth";

function requireBreeder(id: string | null): asserts id is string {
  if (!id) throw new Error("Требуется вход селекционера");
}

// ---------------------------------------------------------------------
// Авторизация
// ---------------------------------------------------------------------
export async function loginAs(breederId: string) {
  await setCurrentBreeder(breederId);
  redirect("/dashboard");
}

export async function registerBreeder(formData: FormData) {
  const name = String(formData.get("name") || "").trim() || "Селекционер";
  const city = String(formData.get("city") || "").trim() || null;
  const id = randomUUID();
  await query(
    "INSERT INTO profiles (id, name, city) VALUES ($1, $2, $3)",
    [id, name, city]
  );
  await setCurrentBreeder(id);
  redirect("/dashboard");
}

export async function logout() {
  await clearCurrentBreeder();
  redirect("/");
}

export async function registerWithPassword(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const name = String(formData.get("name") || "").trim() || "Селекционер";
  const city = String(formData.get("city") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !email.includes("@")) return { error: "Укажите корректный email" };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов" };

  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM profiles WHERE lower(email) = $1",
    [email]
  );
  if (existing) return { error: "Пользователь с таким email уже зарегистрирован" };

  const passwordHash = await bcrypt.hash(password, 12);
  const id = randomUUID();
  await query(
    "INSERT INTO profiles (id, name, city, email, password_hash) VALUES ($1, $2, $3, $4, $5)",
    [id, name, city, email, passwordHash]
  );
  await setCurrentBreeder(id);
  redirect("/dashboard");
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function loginWithPassword(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email) return { error: "Неверный email или пароль" };

  const attempt = await queryOne<{ attempts: number; locked_until: string | null }>(
    "SELECT attempts, locked_until FROM login_attempts WHERE email = $1",
    [email]
  );
  if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
    return { error: `Слишком много попыток входа. Повторите через ${LOCKOUT_MINUTES} минут.` };
  }

  const profile = await queryOne<{ id: string; password_hash: string | null }>(
    "SELECT id, password_hash FROM profiles WHERE lower(email) = $1",
    [email]
  );
  const ok = profile?.password_hash
    ? await bcrypt.compare(password, profile.password_hash)
    : false;

  if (!ok) {
    const attempts = (attempt?.attempts ?? 0) + 1;
    const lockedUntil =
      attempts >= MAX_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
        : null;
    await query(
      `INSERT INTO login_attempts (email, attempts, locked_until) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET attempts = $2, locked_until = $3`,
      [email, attempts, lockedUntil]
    );
    return lockedUntil
      ? { error: `Слишком много попыток входа. Повторите через ${LOCKOUT_MINUTES} минут.` }
      : { error: "Неверный email или пароль" };
  }

  await query("DELETE FROM login_attempts WHERE email = $1", [email]);
  await setCurrentBreeder(profile!.id);
  redirect("/dashboard");
}

// ---------------------------------------------------------------------
// Сброс пароля
// ---------------------------------------------------------------------
const RESET_TOKEN_MINUTES = 30;

export async function requestPasswordReset(
  _prevState: { message?: string } | undefined,
  formData: FormData
): Promise<{ message?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const generic = { message: "Если аккаунт с таким email существует, ссылка для сброса отправлена." };
  if (!email) return generic;

  const profile = await queryOne<{ id: string }>(
    "SELECT id FROM profiles WHERE lower(email) = $1",
    [email]
  );
  if (!profile) return generic;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000);
  await query(
    "INSERT INTO password_resets (token, profile_id, expires_at) VALUES ($1, $2, $3)",
    [token, profile.id, expiresAt]
  );

  // Заглушка отправки письма: почтового сервиса пока нет, ссылка идёт в лог сервера.
  console.log(`[password-reset] ${email} -> /reset-password?token=${token}`);

  return generic;
}

export async function resetPassword(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов" };

  const reset = await queryOne<{ profile_id: string; expires_at: string; used_at: string | null }>(
    "SELECT profile_id, expires_at, used_at FROM password_resets WHERE token = $1",
    [token]
  );
  if (!reset || reset.used_at || new Date(reset.expires_at) < new Date()) {
    return { error: "Ссылка для сброса пароля недействительна или устарела" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await withTransaction(async (client) => {
    await client.query(
      "UPDATE profiles SET password_hash = $1 WHERE id = $2",
      [passwordHash, reset.profile_id]
    );
    await client.query(
      "UPDATE password_resets SET used_at = now() WHERE token = $1",
      [token]
    );
  });

  await setCurrentBreeder(reset.profile_id);
  redirect("/dashboard");
}

// ---------------------------------------------------------------------
// Профиль
// ---------------------------------------------------------------------
export async function updateProfile(formData: FormData) {
  const breederId = await getCurrentBreederId();
  requireBreeder(breederId);
  await query(
    "UPDATE profiles SET name = $1, city = $2, bio = $3, avatar_url = $4 WHERE id = $5",
    [
      String(formData.get("name") || "").trim() || "Селекционер",
      String(formData.get("city") || "").trim() || null,
      String(formData.get("bio") || "").trim() || null,
      String(formData.get("avatar_url") || "").trim() || null,
      breederId,
    ]
  );
  revalidatePath("/dashboard");
  revalidatePath(`/breeder/${breederId}`);
}

// ---------------------------------------------------------------------
// Сорта
// ---------------------------------------------------------------------
function parsePayload(formData: FormData) {
  const yearRaw = String(formData.get("year_created") || "").trim();
  const field = (key: string) =>
    String(formData.get(key) || "").trim() || null;
  return {
    name: String(formData.get("name") || "").trim(),
    species: String(formData.get("species") || "").trim(),
    year_created: yearRaw ? Number(yearRaw) : null,
    description: String(formData.get("description") || "").trim() || null,
    care_notes: String(formData.get("care_notes") || "").trim() || null,
    main_photo_url: String(formData.get("main_photo_url") || "").trim() || null,
    parent_a_id: String(formData.get("parent_a_id") || "").trim() || null,
    parent_b_id: String(formData.get("parent_b_id") || "").trim() || null,
    origin: field("origin"),
    pod_parent: field("pod_parent"),
    pollen_parent: field("pollen_parent"),
    bloom_type: field("bloom_type"),
    size_range: field("size_range"),
    hybridizer: field("hybridizer"),
    date_registered: field("date_registered"),
    grower: field("grower"),
    reg_mini: field("reg_mini"),
    color_group: field("color_group"),
    propagation: field("propagation"),
    bloom_colors: field("bloom_colors"),
    photographer: field("photographer"),
    pod_parent_registered: field("pod_parent_registered"),
    pollen_parent_registered: field("pollen_parent_registered"),
    grower_same: field("grower_same"),
    vein_color: field("vein_color"),
    spots_color: field("spots_color"),
    eye_color: field("eye_color"),
    num_colors: field("num_colors"),
    color_rings: field("color_rings"),
    pad_color: field("pad_color"),
    bloom_form: field("bloom_form"),
    bloom_features: field("bloom_features"),
    petal_overlap: field("petal_overlap"),
    veining: field("veining"),
    substance: field("substance"),
    bloom_duration: field("bloom_duration"),
    presentation: field("presentation"),
    eye_zone_size: field("eye_zone_size"),
    prop_seedling: field("prop_seedling"),
    prop_pollen: field("prop_pollen"),
    prop_rooting: field("prop_rooting"),
    prop_performance: field("prop_performance"),
    leaf_size: field("leaf_size"),
    leaf_look: field("leaf_look"),
    bush_development: field("bush_development"),
    bush_size: field("bush_size"),
    bush_width: field("bush_width"),
    bush_form: field("bush_form"),
    gallery: formData
      .getAll("gallery_urls")
      .map((u) => String(u).trim())
      .filter(Boolean),
  };
}

/** Колонки сорта (без id/breeder_id) в порядке записи. */
const VARIETY_COLUMNS = [
  "name", "species", "year_created", "description", "care_notes",
  "main_photo_url", "parent_a_id", "parent_b_id", "origin", "pod_parent",
  "pollen_parent", "bloom_type", "size_range", "hybridizer", "date_registered",
  "grower", "reg_mini", "color_group", "propagation", "bloom_colors",
  "photographer", "pod_parent_registered", "pollen_parent_registered",
  "grower_same", "vein_color", "spots_color", "eye_color", "num_colors",
  "color_rings", "pad_color", "bloom_form", "bloom_features", "petal_overlap",
  "veining", "substance", "bloom_duration", "presentation", "eye_zone_size",
  "prop_seedling", "prop_pollen", "prop_rooting", "prop_performance",
  "leaf_size", "leaf_look", "bush_development", "bush_size", "bush_width",
  "bush_form",
] as const;

function varietyValues(p: ReturnType<typeof parsePayload>): unknown[] {
  return VARIETY_COLUMNS.map((c) => (p as Record<string, unknown>)[c]);
}

export async function createVariety(formData: FormData) {
  const breederId = await getCurrentBreederId();
  requireBreeder(breederId);
  const p = parsePayload(formData);
  if (!p.name || !p.species) throw new Error("Название и вид обязательны");

  const id = randomUUID();
  await withTransaction(async (client) => {
    const cols = ["id", "breeder_id", ...VARIETY_COLUMNS];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    await client.query(
      `INSERT INTO plant_varieties (${cols.join(", ")}) VALUES (${placeholders})`,
      [id, breederId, ...varietyValues(p)]
    );
    for (const url of p.gallery) {
      await client.query(
        "INSERT INTO plant_photos (id, variety_id, photo_url, caption) VALUES ($1, $2, $3, $4)",
        [randomUUID(), id, url, null]
      );
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  redirect(`/variety/${id}`);
}

export async function updateVariety(varietyId: string, formData: FormData) {
  const breederId = await getCurrentBreederId();
  requireBreeder(breederId);
  const p = parsePayload(formData);

  const owner = await queryOwner(varietyId);
  if (!owner || owner !== breederId)
    throw new Error("Нет прав на редактирование");

  await withTransaction(async (client) => {
    const setClause = VARIETY_COLUMNS.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await client.query(
      `UPDATE plant_varieties SET ${setClause} WHERE id = $${VARIETY_COLUMNS.length + 1}`,
      [...varietyValues(p), varietyId]
    );
    for (const url of p.gallery) {
      await client.query(
        "INSERT INTO plant_photos (id, variety_id, photo_url, caption) VALUES ($1, $2, $3, $4)",
        [randomUUID(), varietyId, url, null]
      );
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/variety/${varietyId}`);
  redirect(`/variety/${varietyId}`);
}

async function queryOwner(varietyId: string): Promise<string | null> {
  const rows = await query<{ breeder_id: string }>(
    "SELECT breeder_id FROM plant_varieties WHERE id = $1",
    [varietyId]
  );
  return rows[0]?.breeder_id ?? null;
}

export async function deleteVariety(formData: FormData) {
  const breederId = await getCurrentBreederId();
  requireBreeder(breederId);
  const varietyId = String(formData.get("variety_id") || "");

  await query(
    "DELETE FROM plant_varieties WHERE id = $1 AND breeder_id = $2",
    [varietyId, breederId]
  );

  revalidatePath("/dashboard");
  revalidatePath("/catalog");
}
