"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/types";

export function Gallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Фотографий пока нет.
      </p>
    );
  }

  const go = (dir: number) =>
    setActive((i) => (i + dir + photos.length) % photos.length);

  return (
    <div className="space-y-3">
      {/* Слайдер */}
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
        <Image
          src={photos[active].photo_url}
          alt={photos[active].caption ?? "Фото сорта"}
          fill
          sizes="(max-width: 1024px) 100vw, 700px"
          className="cursor-zoom-in object-cover"
          onClick={() => setLightbox(true)}
        />
        {photos.length > 1 && (
          <>
            <SliderBtn side="left" onClick={() => go(-1)} />
            <SliderBtn side="right" onClick={() => go(1)} />
          </>
        )}
        {photos[active].caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white">
            {photos[active].caption}
          </div>
        )}
      </div>

      {/* Сетка миниатюр */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActive(i)}
            className={`relative aspect-square overflow-hidden rounded-md border-2 transition ${
              i === active ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            <Image
              src={p.photo_url}
              alt={p.caption ?? ""}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Лайтбокс */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute right-4 top-4 text-white" aria-label="Закрыть">
            <X className="size-8" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={photos[active].photo_url}
              alt={photos[active].caption ?? ""}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SliderBtn({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-2" : "right-2"
      } grid size-9 place-items-center rounded-full bg-white/85 text-foreground shadow hover:bg-white`}
    >
      <Icon className="size-5" />
    </button>
  );
}
