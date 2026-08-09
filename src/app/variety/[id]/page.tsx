import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Calendar, Leaf, Sprout, Pencil, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gallery } from "@/components/gallery";
import { PedigreeTree } from "@/components/pedigree-tree";
import { getVariety, getPedigree } from "@/lib/data";
import { getCurrentBreederId } from "@/lib/auth";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VarietyPage({ params }: Props) {
  const { id } = await params;
  const v = await getVariety(id);
  if (!v) notFound();

  // Редактировать сорт может только его владелец.
  const [breederId, pedigree] = await Promise.all([
    getCurrentBreederId(),
    getPedigree(v.id),
  ]);
  const canEdit = breederId === v.breeder_id;

  // Главное фото первым в галерее (без дублей).
  const photos: Photo[] = [];
  if (v.main_photo_url) {
    photos.push({
      id: "main",
      variety_id: v.id,
      photo_url: v.main_photo_url,
      caption: v.name,
    });
  }
  for (const p of v.photos) {
    if (p.photo_url !== v.main_photo_url) photos.push(p);
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Левая колонка: фото + галерея */}
        <div>
          <Gallery photos={photos} />
        </div>

        {/* Правая колонка: данные */}
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {v.species}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">{v.name}</h1>
            </div>
            {canEdit && (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={`/dashboard/${v.id}/edit`}>
                  <Pencil className="size-4" /> Редактировать
                </Link>
              </Button>
            )}
          </div>

          <dl className="grid gap-3 rounded-xl border bg-card p-4 text-sm">
            <Row icon={<Leaf className="size-4" />} label="Тип цветка">
              {v.species}
            </Row>
            <Row icon={<User className="size-4" />} label="Селекционер">
              {v.breeder ? (
                <Link
                  href={`/breeder/${v.breeder.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {v.breeder.name}
                </Link>
              ) : (
                "—"
              )}
            </Row>
            <Row icon={<Calendar className="size-4" />} label="Год создания">
              {v.year_created ?? "—"}
            </Row>
          </dl>

          {v.description && (
            <Section title="Описание">{v.description}</Section>
          )}
          {v.care_notes && (
            <Section title="Особенности выращивания">{v.care_notes}</Section>
          )}
        </div>
      </div>

      {/* Характеристики цветка — паспорт сорта */}
      {hasPassport(v as unknown as Record<string, unknown>) && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold">Характеристики цветка</h2>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            <Spec label="Название сорта" en="Cultivar Name">{v.name}</Spec>
            <Spec label="Происхождение" en="Origin">{v.origin}</Spec>
            <Spec label="Материнское растение" en="Pod Parent">
              {v.pod_parent}
            </Spec>
            <Spec label="Тип цветка" en="Bloom Type">
              {v.bloom_type ?? v.species}
            </Spec>
            <Spec label="Отцовское растение" en="Pollen Parent">
              {v.pollen_parent}
            </Spec>
            <Spec label="Диапазон размеров" en="Size Range">
              {v.size_range}
            </Spec>
            <Spec label="Селекционер" en="Hybridizer">{v.hybridizer}</Spec>
            <Spec label="Дата регистрации" en="Date Registered">
              {v.date_registered}
            </Spec>
            <Spec label="Вырастил" en="Grower">{v.grower}</Spec>
            <Spec label="Стандарт/Мини" en="Reg/Mini">{v.reg_mini}</Spec>
            <Spec label="Цветовая группа" en="Color Group">
              {v.color_group}
            </Spec>
            <Spec label="Автор фото" en="Photographer">{v.photographer}</Spec>
            <Spec label="Мать зарегистрирована" en="Pod Reg.">
              {v.pod_parent_registered}
            </Spec>
            <Spec label="Отец зарегистрирован" en="Pollen Reg.">
              {v.pollen_parent_registered}
            </Spec>
            <Spec label="Гровер = гибридизатор" en="Grower Same">
              {v.grower_same}
            </Spec>
            <Spec label="Цвет прожилок" en="Vein Color">{v.vein_color}</Spec>
            <Spec label="Пятна и брызги" en="Spots Color">{v.spots_color}</Spec>
            <Spec label="Цвет глазной зоны" en="Eye Color">{v.eye_color}</Spec>
            <Spec label="Цвет подушечек" en="Pad Color">{v.pad_color}</Spec>
            <Spec label="Количество цветов" en="No. of Colors">
              {v.num_colors}
            </Spec>
            <Spec label="Цветовые кольца" en="Rings">{v.color_rings}</Spec>
            <Spec label="Форма цветения" en="Bloom Form">{v.bloom_form}</Spec>
            <Spec label="Особенности" en="Features">{v.bloom_features}</Spec>
            <Spec label="Перекрытие лепестков" en="Petal Overlap">
              {v.petal_overlap}
            </Spec>
            <Spec label="Прожилкование" en="Veining">{v.veining}</Spec>
            <Spec label="Субстанция" en="Substance">{v.substance}</Spec>
            <Spec label="Продолжительность" en="Duration">
              {v.bloom_duration}
            </Spec>
            <Spec label="Презентация" en="Presentation">
              {v.presentation}
            </Spec>
            <Spec label="Размер глазной зоны" en="Eye Zone">
              {v.eye_zone_size}
            </Spec>
            <Spec label="Сеянец" en="Seedling">{v.prop_seedling}</Spec>
            <Spec label="Пыльца" en="Pollen">{v.prop_pollen}</Spec>
            <Spec label="Укоренение" en="Rooting">{v.prop_rooting}</Spec>
            <Spec label="Выращивание" en="Performance">
              {v.prop_performance}
            </Spec>
            <Spec label="Размножение" en="Propagation">{v.propagation}</Spec>
            <Spec label="Размер листа" en="Leaf Size">{v.leaf_size}</Spec>
            <Spec label="Вид листа" en="Leaf Look">{v.leaf_look}</Spec>
            <Spec label="Развитие куста" en="Bush Dev.">
              {v.bush_development}
            </Spec>
            <Spec label="Размер куста" en="Bush Size">{v.bush_size}</Spec>
            <Spec label="Ширина куста" en="Bush Width">{v.bush_width}</Spec>
            <Spec label="Форма куста" en="Bush Form">{v.bush_form}</Spec>
            <Spec label="Расцветка цветка" en="Bloom Colors" full>
              {v.bloom_colors}
            </Spec>
          </dl>
        </section>
      )}

      {/* Родословная */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Sprout className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">Родословная</h2>
          <span className="text-sm text-muted-foreground">
            все поколения · можно двигать и масштабировать · клик по предку
            открывает его страницу
          </span>
        </div>
        {pedigree && <PedigreeTree root={pedigree} />}
      </section>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

/** Поля паспорта — заполнено ли хоть одно (название есть всегда отдельно). */
const PASSPORT_KEYS = [
  "origin", "pod_parent", "pollen_parent", "bloom_type", "size_range",
  "hybridizer", "date_registered", "grower", "reg_mini", "color_group",
  "propagation", "bloom_colors", "photographer", "pod_parent_registered",
  "pollen_parent_registered", "grower_same", "vein_color", "spots_color",
  "eye_color", "num_colors", "color_rings", "pad_color", "bloom_form",
  "bloom_features", "petal_overlap", "veining", "substance", "bloom_duration",
  "presentation", "eye_zone_size", "prop_seedling", "prop_pollen",
  "prop_rooting", "prop_performance", "leaf_size", "leaf_look",
  "bush_development", "bush_size", "bush_width", "bush_form",
] as const;

function hasPassport(v: Record<string, unknown>): boolean {
  return PASSPORT_KEYS.some((k) => Boolean(v[k]));
}

/** Ячейка паспорта: русская подпись + английский термин и значение. */
function Spec({
  label,
  en,
  children,
  full = false,
}: {
  label: string;
  en: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  const empty =
    children == null || children === "" || children === false;
  return (
    <div className={`bg-card px-4 py-3 ${full ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}{" "}
        <span className="normal-case opacity-70">({en})</span>
      </dt>
      <dd className="mt-1 text-sm leading-relaxed">
        {empty ? <span className="text-muted-foreground">—</span> : children}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-1 font-semibold">{title}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
