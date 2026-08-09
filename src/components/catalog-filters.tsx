"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

interface Props {
  species: string[];
  breeders: Profile[];
  years: number[];
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CatalogFilters({ species, breeders, years }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/catalog${next.toString() ? `?${next}` : ""}`);
    },
    [params, router]
  );

  const hasFilters = ["search", "species", "breeder", "year"].some((k) =>
    params.get(k)
  );

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={params.get("search") ?? ""}
          placeholder="Поиск…"
          className="pl-9"
          onChange={(e) => update("search", e.target.value)}
        />
      </div>

      <select
        className={selectClass}
        value={params.get("species") ?? ""}
        onChange={(e) => update("species", e.target.value)}
      >
        <option value="">Все типы</option>
        {species.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get("breeder") ?? ""}
        onChange={(e) => update("breeder", e.target.value)}
      >
        <option value="">Все селекционеры</option>
        {breeders.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <select
          className={selectClass}
          value={params.get("year") ?? ""}
          onChange={(e) => update("year", e.target.value)}
        >
          <option value="">Любой год</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            title="Сбросить"
            onClick={() => router.push("/catalog")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
