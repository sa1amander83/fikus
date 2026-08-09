import { CatalogFilters } from "@/components/catalog-filters";
import { VarietyCard } from "@/components/variety-card";
import {
  searchVarieties,
  getSpeciesList,
  getBreeders,
  getYears,
} from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    search?: string;
    species?: string;
    breeder?: string;
    year?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [varieties, species, breeders, years] = await Promise.all([
    searchVarieties({
      search: sp.search,
      species: sp.species,
      breederId: sp.breeder,
      year: sp.year ? Number(sp.year) : undefined,
    }),
    getSpeciesList(),
    getBreeders(),
    getYears(),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Каталог сортов</h1>
        <p className="mt-1 text-muted-foreground">
          Найдено сортов: {varieties.length}
        </p>
      </div>

      <CatalogFilters species={species} breeders={breeders} years={years} />

      {varieties.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          Ничего не найдено. Попробуйте изменить фильтры.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {varieties.map((v) => (
            <VarietyCard key={v.id} variety={v} />
          ))}
        </div>
      )}
    </div>
  );
}
