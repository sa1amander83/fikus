import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, User } from "lucide-react";
import { VarietyCard } from "@/components/variety-card";
import {
  getProfile,
  getVarietiesByBreeder,
  getPhotosByBreeder,
} from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BreederPage({ params }: Props) {
  const { id } = await params;
  const breeder = await getProfile(id);
  if (!breeder) notFound();

  const [varieties, photos] = await Promise.all([
    getVarietiesByBreeder(id),
    getPhotosByBreeder(id),
  ]);

  return (
    <div className="container py-8">
      {/* Профиль */}
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center sm:flex-row sm:text-left">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border bg-muted">
          {breeder.avatar_url ? (
            <Image src={breeder.avatar_url} alt={breeder.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <User className="size-10" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{breeder.name}</h1>
          {breeder.city && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
              <MapPin className="size-4" /> {breeder.city}
            </p>
          )}
          {breeder.bio && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{breeder.bio}</p>
          )}
          <p className="mt-2 text-sm font-medium">Сортов в реестре: {varieties.length}</p>
        </div>
      </div>

      {/* Сорта */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Сорта селекционера</h2>
        {varieties.length === 0 ? (
          <p className="text-muted-foreground">Сортов пока нет.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {varieties.map((v) => (
              <VarietyCard key={v.id} variety={v} />
            ))}
          </div>
        )}
      </section>

      {/* Общая фотогалерея */}
      {photos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Фотогалерея</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((p) => (
              <Link
                key={p.id}
                href={`/variety/${p.variety_id}`}
                className="relative aspect-square overflow-hidden rounded-lg border"
              >
                <Image
                  src={p.photo_url}
                  alt={p.caption ?? ""}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
