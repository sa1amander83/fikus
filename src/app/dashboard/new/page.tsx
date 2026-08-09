import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VarietyForm } from "@/components/variety-form";
import { getCurrentBreederId } from "@/lib/auth";
import { searchVarieties } from "@/lib/data";
import { createVariety } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NewVarietyPage() {
  if (!(await getCurrentBreederId())) redirect("/login");

  const parents = (await searchVarieties()).map((v) => ({
    id: v.id,
    name: v.name,
    species: v.species,
    year_created: v.year_created,
    main_photo_url: v.main_photo_url,
  }));

  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Назад в кабинет
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Добавить сорт</h1>
      <VarietyForm action={createVariety} parents={parents} submitLabel="Создать сорт" />
    </div>
  );
}
