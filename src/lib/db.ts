import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { mockProfiles, mockVarieties, mockPhotos } from "./mock-data";

/**
 * Пул соединений PostgreSQL (один на процесс).
 * Подключение берётся из DATABASE_URL, иначе — из стандартных переменных
 * PG* (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT).
 *
 * Схема и демо-данные создаются автоматически при первом обращении
 * (см. ready()), поэтому на чистом сервере достаточно создать пустую БД.
 */

declare global {
  // eslint-disable-next-line no-var
  var __ff_pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __ff_ready: Promise<void> | undefined;
}

function createPool(): Pool {
  if (process.env.DATABASE_URL) {
    return new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  }
  // Без DATABASE_URL pg берёт переменные PG*. Если пароль не задан строкой,
  // драйвер падает с невнятным «SASL: client password must be a string» —
  // заменяем на понятное сообщение.
  if (typeof process.env.PGPASSWORD !== "string") {
    throw new Error(
      "Не настроено подключение к PostgreSQL. Создайте файл .env.local со строкой " +
        "DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/fineflower " +
        "(или задайте переменные PGUSER/PGPASSWORD/PGHOST/PGDATABASE)."
    );
  }
  return new Pool({ max: 10 });
}

function getPool(): Pool {
  if (!global.__ff_pool) global.__ff_pool = createPool();
  return global.__ff_pool;
}

/** Гарантирует, что схема создана и (при пустой БД) залиты демо-данные. */
export function ready(): Promise<void> {
  if (!global.__ff_ready) global.__ff_ready = init();
  return global.__ff_ready;
}

async function init(): Promise<void> {
  const pool = getPool();
  await migrate(pool);
  await seedIfEmpty(pool);
  await backfillPassport(pool);
}

// ---------------------------------------------------------------------
// Хелперы запросов
// ---------------------------------------------------------------------
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ready();
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Выполняет колбэк в транзакции (BEGIN/COMMIT/ROLLBACK). */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  await ready();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------
// Схема
// ---------------------------------------------------------------------
async function migrate(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL DEFAULT 'Селекционер',
      city           TEXT,
      bio            TEXT,
      avatar_url     TEXT,
      email          TEXT,
      password_hash  TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS plant_varieties (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      species         TEXT NOT NULL,
      breeder_id      TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      year_created    INTEGER,
      description     TEXT,
      care_notes      TEXT,
      main_photo_url  TEXT,
      parent_a_id     TEXT REFERENCES plant_varieties(id) ON DELETE SET NULL,
      parent_b_id     TEXT REFERENCES plant_varieties(id) ON DELETE SET NULL,
      origin          TEXT,
      pod_parent      TEXT,
      pollen_parent   TEXT,
      bloom_type      TEXT,
      size_range      TEXT,
      hybridizer      TEXT,
      date_registered TEXT,
      grower          TEXT,
      reg_mini        TEXT,
      color_group     TEXT,
      propagation     TEXT,
      bloom_colors    TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_varieties_breeder ON plant_varieties(breeder_id);
    CREATE INDEX IF NOT EXISTS idx_varieties_species ON plant_varieties(species);
    CREATE INDEX IF NOT EXISTS idx_varieties_year    ON plant_varieties(year_created);

    CREATE TABLE IF NOT EXISTS plant_photos (
      id          TEXT PRIMARY KEY,
      variety_id  TEXT NOT NULL REFERENCES plant_varieties(id) ON DELETE CASCADE,
      photo_url   TEXT NOT NULL,
      caption     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_photos_variety ON plant_photos(variety_id);

    CREATE TABLE IF NOT EXISTS password_resets (
      token       TEXT PRIMARY KEY,
      profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      expires_at  TIMESTAMPTZ NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_password_resets_profile ON password_resets(profile_id);

    CREATE TABLE IF NOT EXISTS login_attempts (
      email        TEXT PRIMARY KEY,
      attempts     INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ
    );
  `);

  // На случай баз, созданных до появления колонок паспорта.
  const passportColumns = [
    "origin",
    "pod_parent",
    "pollen_parent",
    "bloom_type",
    "size_range",
    "hybridizer",
    "date_registered",
    "grower",
    "reg_mini",
    "color_group",
    "propagation",
    "bloom_colors",
    "photographer",
    "pod_parent_registered",
    "pollen_parent_registered",
    "grower_same",
    "vein_color",
    "spots_color",
    "eye_color",
    "num_colors",
    "color_rings",
    "pad_color",
    "bloom_form",
    "bloom_features",
    "petal_overlap",
    "veining",
    "substance",
    "bloom_duration",
    "presentation",
    "eye_zone_size",
    "prop_seedling",
    "prop_pollen",
    "prop_rooting",
    "prop_performance",
    "leaf_size",
    "leaf_look",
    "bush_development",
    "bush_size",
    "bush_width",
    "bush_form",
  ];
  for (const col of passportColumns) {
    await pool.query(
      `ALTER TABLE plant_varieties ADD COLUMN IF NOT EXISTS ${col} TEXT`
    );
  }

  // На случай баз, созданных до появления email/пароля.
  await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT`);
  await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles (lower(email)) WHERE email IS NOT NULL`
  );
}

// ---------------------------------------------------------------------
// Демо-данные
// ---------------------------------------------------------------------
async function seedIfEmpty(pool: Pool): Promise<void> {
  const { rows } = await pool.query<{ n: string }>(
    "SELECT COUNT(*)::int AS n FROM profiles"
  );
  if (Number(rows[0]?.n ?? 0) > 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const p of mockProfiles) {
      await client.query(
        `INSERT INTO profiles (id, name, city, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.name, p.city, p.bio, p.avatar_url]
      );
    }
    for (const v of mockVarieties) {
      await client.query(
        `INSERT INTO plant_varieties
           (id, name, species, breeder_id, year_created, description, care_notes,
            main_photo_url, parent_a_id, parent_b_id,
            origin, pod_parent, pollen_parent, bloom_type, size_range, hybridizer,
            date_registered, grower, reg_mini, color_group, propagation, bloom_colors)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [
          v.id, v.name, v.species, v.breeder_id, v.year_created, v.description,
          v.care_notes, v.main_photo_url, v.parent_a_id, v.parent_b_id,
          v.origin, v.pod_parent, v.pollen_parent, v.bloom_type, v.size_range,
          v.hybridizer, v.date_registered, v.grower, v.reg_mini, v.color_group,
          v.propagation, v.bloom_colors,
        ]
      );
    }
    for (const ph of mockPhotos) {
      await client.query(
        `INSERT INTO plant_photos (id, variety_id, photo_url, caption)
         VALUES ($1, $2, $3, $4)`,
        [ph.id, ph.variety_id, ph.photo_url, ph.caption]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Заполняет паспортные поля у демо-сортов, если они ещё пустые.
 * Трогает только строки из mock-данных и только когда `origin` не заполнен.
 */
async function backfillPassport(pool: Pool): Promise<void> {
  for (const v of mockVarieties) {
    await pool.query(
      `UPDATE plant_varieties SET
         origin = $2, pod_parent = $3, pollen_parent = $4, bloom_type = $5,
         size_range = $6, hybridizer = $7, date_registered = $8, grower = $9,
         reg_mini = $10, color_group = $11, propagation = $12, bloom_colors = $13
       WHERE id = $1 AND origin IS NULL`,
      [
        v.id, v.origin, v.pod_parent, v.pollen_parent, v.bloom_type,
        v.size_range, v.hybridizer, v.date_registered, v.grower, v.reg_mini,
        v.color_group, v.propagation, v.bloom_colors,
      ]
    );
  }
}
