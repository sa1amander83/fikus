import Link from "next/link";
import Image from "next/image";
import { Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Variety } from "@/lib/types";

interface Props {
  variety: Variety & { breeder_name?: string };
}

export function VarietyCard({ variety }: Props) {
  return (
    <Link
      href={`/variety/${variety.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {variety.main_photo_url ? (
          <Image
            src={variety.main_photo_url}
            alt={variety.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Sprout className="size-10" />
          </div>
        )}
        <Badge variant="secondary" className="absolute left-3 top-3">
          {variety.species}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-tight group-hover:text-primary">
          {variety.name}
        </h3>
        {variety.breeder_name && (
          <p className="text-sm text-muted-foreground">{variety.breeder_name}</p>
        )}
        <div className="mt-auto pt-2 text-xs text-muted-foreground">
          {variety.year_created ? `${variety.year_created} г.` : "Год не указан"}
        </div>
      </div>
    </Link>
  );
}
