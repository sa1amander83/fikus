import "server-only";
import { query, queryOne } from "./db";
import type {
  Profile,
  Variety,
  Photo,
  VarietyWithRelations,
  VarietyFilters,
} from "./types";

type VarietyRow = Variety;

/** Сорт + имя селекционера — для карточек каталога. */
export interface VarietyListItem extends Variety {
  breeder_name: string;
}

export async function getProfile(id: string): Promise<Profile | null> {
  return queryOne<Profile>("SELECT * FROM profiles WHERE id = $1", [id]);
}

export async function getBreeders(): Promise<Profile[]> {
  return query<Profile>("SELECT * FROM profiles ORDER BY name");
}

export async function getSpeciesList(): Promise<string[]> {
  const rows = await query<{ species: string }>(
    "SELECT DISTINCT species FROM plant_varieties ORDER BY species"
  );
  return rows.map((r) => r.species);
}

export async function getYears(): Promise<number[]> {
  const rows = await query<{ y: number }>(
    "SELECT DISTINCT year_created AS y FROM plant_varieties WHERE year_created IS NOT NULL ORDER BY y DESC"
  );
  return rows.map((r) => r.y);
}

export async function searchVarieties(
  filters: VarietyFilters = {}
): Promise<VarietyListItem[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.search) {
    // Поиск только по названию сорта; ILIKE даёт регистронезависимость,
    // в т.ч. для кириллицы (БД в UTF-8).
    where.push(`v.name ILIKE ${add(`%${filters.search}%`)}`);
  }
  if (filters.species) {
    where.push(`v.species = ${add(filters.species)}`);
  }
  if (filters.breederId) {
    where.push(`v.breeder_id = ${add(filters.breederId)}`);
  }
  if (filters.year) {
    where.push(`v.year_created = ${add(filters.year)}`);
  }

  const sql = `
    SELECT v.*, COALESCE(p.name, 'Неизвестно') AS breeder_name
    FROM plant_varieties v
    LEFT JOIN profiles p ON p.id = v.breeder_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY v.created_at DESC, v.name
  `;
  return query<VarietyListItem>(sql, params);
}

async function getVarietyRow(id: string): Promise<VarietyRow | null> {
  return queryOne<VarietyRow>(
    "SELECT * FROM plant_varieties WHERE id = $1",
    [id]
  );
}

export async function getVariety(
  id: string
): Promise<VarietyWithRelations | null> {
  const v = await getVarietyRow(id);
  if (!v) return null;

  const [breeder, parent_a, parent_b, photos] = await Promise.all([
    v.breeder_id ? getProfile(v.breeder_id) : Promise.resolve(null),
    v.parent_a_id ? getVarietyRow(v.parent_a_id) : Promise.resolve(null),
    v.parent_b_id ? getVarietyRow(v.parent_b_id) : Promise.resolve(null),
    query<Photo>(
      "SELECT * FROM plant_photos WHERE variety_id = $1 ORDER BY created_at",
      [id]
    ),
  ]);

  return { ...v, breeder, parent_a, parent_b, photos };
}

/** Узел родословной: сорт и его родители (рекурсивно). */
export interface PedigreeNode {
  variety: Variety;
  parentA: PedigreeNode | null;
  parentB: PedigreeNode | null;
}

/**
 * Строит дерево предков на `maxDepth` поколений вверх.
 * Все достижимые предки выбираются одним рекурсивным CTE, после чего
 * дерево собирается в памяти. `ancestors` обрывает циклы (сорт не может
 * быть собственным предком).
 */
export async function getPedigree(
  id: string,
  maxDepth = Infinity
): Promise<PedigreeNode | null> {
  const rows = await query<VarietyRow>(
    `WITH RECURSIVE anc AS (
       SELECT * FROM plant_varieties WHERE id = $1
       UNION
       SELECT v.* FROM plant_varieties v
       JOIN anc a ON v.id = a.parent_a_id OR v.id = a.parent_b_id
     )
     SELECT * FROM anc`,
    [id]
  );

  const byId = new Map(rows.map((v) => [v.id, v]));
  const root = byId.get(id);
  if (!root) return null;

  const build = (
    v: VarietyRow,
    depth: number,
    ancestors: Set<string>
  ): PedigreeNode => {
    if (depth >= maxDepth) return { variety: v, parentA: null, parentB: null };
    const next = new Set(ancestors).add(v.id);
    const resolve = (pid: string | null) =>
      pid && !next.has(pid) ? byId.get(pid) ?? null : null;
    const a = resolve(v.parent_a_id);
    const b = resolve(v.parent_b_id);
    return {
      variety: v,
      parentA: a ? build(a, depth + 1, next) : null,
      parentB: b ? build(b, depth + 1, next) : null,
    };
  };

  return build(root, 0, new Set());
}

export async function getVarietiesByBreeder(
  breederId: string
): Promise<Variety[]> {
  return query<Variety>(
    "SELECT * FROM plant_varieties WHERE breeder_id = $1 ORDER BY year_created DESC NULLS LAST, name",
    [breederId]
  );
}

export async function getPhotosByBreeder(breederId: string): Promise<Photo[]> {
  return query<Photo>(
    `SELECT ph.* FROM plant_photos ph
     JOIN plant_varieties v ON v.id = ph.variety_id
     WHERE v.breeder_id = $1
     ORDER BY ph.created_at DESC`,
    [breederId]
  );
}

export async function countVarieties(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM plant_varieties"
  );
  return row?.n ?? 0;
}
