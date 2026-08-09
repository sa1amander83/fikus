import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getCurrentBreederId } from "@/lib/auth";

/**
 * Простая загрузка изображений на диск (public/uploads).
 * Возвращает публичные URL. Для MVP достаточно; в проде заменить на S3/Supabase Storage.
 */
export async function POST(req: Request) {
  const breederId = await getCurrentBreederId();
  if (!breederId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Нет файлов" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ urls });
}
