import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VarietyForm } from "@/components/variety-form";
import { getCurrentBreederId } from "@/lib/auth";
import { getVariety, searchVarieties } from "@/lib/data";
import { updateVariety } from "@/lib/actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVarietyPage({ params }: Props) {
  const breederId = await getCurrentBreederId();
  if (!breederId) redirect("/login");

  const { id } = await params;
  const variety = await getVariety(id);
  if (!variety) notFound();
  if (variety.breeder_id !== breederId) redirect("/dashboard");

  // Родителем не может быть сам сорт.
  const parents = (await searchVarieties())
    .filter((v) => v.id !== id)
    .map((v) => ({
      id: v.id,
      name: v.name,
      species: v.species,
      year_created: v.year_created,
      main_photo_url: v.main_photo_url,
    }));

  const action = updateVariety.bind(null, id);

  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Назад в кабинет
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Редактировать сорт</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Новые фото галереи добавляются к существующим.
      </p>
      <VarietyForm
        action={action}
        parents={parents}
        initial={variety}
        submitLabel="Сохранить изменения"
      />
    </div>
  );
}
