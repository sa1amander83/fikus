import "server-only";
import { cookies } from "next/headers";
import { getProfile } from "./data";
import { DEMO_BREEDER_ID } from "./mock-data";
import type { Profile } from "./types";

/**
 * Лёгкая «авторизация» для MVP: id текущего селекционера хранится в cookie.
 * Этого достаточно, чтобы вести свои сорта и показывать продукт.
 * При переезде на Supabase заменяется на полноценную auth-сессию.
 */

const COOKIE = "ff_breeder";

export async function getCurrentBreederId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function getCurrentBreeder(): Promise<Profile | null> {
  const id = await getCurrentBreederId();
  if (!id) return null;
  return getProfile(id);
}

export async function setCurrentBreeder(id: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCurrentBreeder(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export { DEMO_BREEDER_ID };
