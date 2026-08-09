"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Loader2,
  Search,
  GitFork,
  Sprout,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Variety } from "@/lib/types";
import * as OPT from "@/lib/registration-options";

const REG_MINI = ["Обычный (стандарт)", "Миниатюрный"] as const;

interface ParentOption {
  id: string;
  name: string;
  species: string;
  year_created: number | null;
  main_photo_url: string | null;
}

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  parents: ParentOption[];
  initial?: Variety;
  submitLabel?: string;
}

async function uploadFiles(files: File[]): Promise<string[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Не удалось загрузить файлы");
  const data = (await res.json()) as { urls: string[] };
  return data.urls;
}

export function VarietyForm({
  action,
  parents,
  initial,
  submitLabel = "Сохранить сорт",
}: Props) {
  const [mainPhoto, setMainPhoto] = useState<string | null>(
    initial?.main_photo_url ?? null
  );
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);

  // Родословная
  const [nameValue, setNameValue] = useState(initial?.name ?? "");
  const [parentA, setParentA] = useState(initial?.parent_a_id ?? "");
  const [parentB, setParentB] = useState(initial?.parent_b_id ?? "");
  const findParent = (id: string) => parents.find((p) => p.id === id) ?? null;

  async function handleGalleryFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(Array.from(fileList));
      setGallery((g) => [...g, ...urls]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleMainFile(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const [url] = await uploadFiles([fileList[0]]);
      setMainPhoto(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название сорта *" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={initial?.name}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Field>
        <Field label="Тип цветка *" htmlFor="species">
          <Input
            id="species"
            name="species"
            required
            placeholder="Простой, Полумахровый, Махровый…"
            defaultValue={initial?.species}
          />
        </Field>
        <Field label="Год создания" htmlFor="year_created">
          <Input
            id="year_created"
            name="year_created"
            type="number"
            min={1900}
            max={2100}
            defaultValue={initial?.year_created ?? ""}
          />
        </Field>
      </div>

      <Field label="Описание" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
        />
      </Field>

      <Field label="Особенности выращивания" htmlFor="care_notes">
        <Textarea
          id="care_notes"
          name="care_notes"
          rows={3}
          defaultValue={initial?.care_notes ?? ""}
        />
      </Field>

      {/* Паспорт сорта — характеристики цветка (по образцу IHS) */}
      <div className="grid gap-6 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <Label className="text-base">Характеристики цветка (паспорт IHS)</Label>
        </div>

        {/* Регистрация и авторство */}
        <Group title="Регистрация и авторство">
          <SelectField label="Происхождение / страна (Origin)" name="origin" options={OPT.COUNTRIES} initial={initial?.origin} />
          <Field label="Дата регистрации (Date Registered)" htmlFor="date_registered">
            <Input id="date_registered" name="date_registered" placeholder="2002-12-31" defaultValue={initial?.date_registered ?? ""} />
          </Field>
          <Field label="Гибридизатор (Hybridizer)" htmlFor="hybridizer">
            <Input id="hybridizer" name="hybridizer" defaultValue={initial?.hybridizer ?? ""} />
          </Field>
          <SelectField label="Гровер = гибридизатор?" name="grower_same" options={OPT.YESNO} initial={initial?.grower_same} />
          <Field label="Вырастил (Grower)" htmlFor="grower">
            <Input id="grower" name="grower" defaultValue={initial?.grower ?? ""} />
          </Field>
          <Field label="Автор фотографии" htmlFor="photographer">
            <Input id="photographer" name="photographer" defaultValue={initial?.photographer ?? ""} />
          </Field>
        </Group>

        {/* Родительство */}
        <Group title="Родительство">
          <SelectField label="Материнское растение зарегистрировано?" name="pod_parent_registered" options={OPT.YESNO_UNKNOWN} initial={initial?.pod_parent_registered} />
          <Field label="Материнское растение (Pod Parent)" htmlFor="pod_parent">
            <Input id="pod_parent" name="pod_parent" defaultValue={initial?.pod_parent ?? ""} />
          </Field>
          <SelectField label="Отцовское растение зарегистрировано?" name="pollen_parent_registered" options={OPT.YESNO_UNKNOWN} initial={initial?.pollen_parent_registered} />
          <Field label="Отцовское растение (Pollen Parent)" htmlFor="pollen_parent">
            <Input id="pollen_parent" name="pollen_parent" defaultValue={initial?.pollen_parent ?? ""} />
          </Field>
        </Group>

        {/* Цвет и размер */}
        <Group title="Цвет и размер">
          <SelectField label="Цветовая группа (Color Group)" name="color_group" options={OPT.COLOR_GROUP} initial={initial?.color_group} />
          <SelectField label="Тип цветения (Bloom Type)" name="bloom_type" options={OPT.BLOOM_TYPE} initial={initial?.bloom_type} />
          <SelectField label="Стандарт / Мини (Reg/Mini)" name="reg_mini" options={REG_MINI} initial={initial?.reg_mini} />
          <SelectField label="Диапазон размеров (Size Range)" name="size_range" options={OPT.SIZE_RANGE} initial={initial?.size_range} />
        </Group>

        {/* Окраска */}
        <Group title="Окраска">
          <SelectField label="Цвет прожилок (Vein Color)" name="vein_color" options={OPT.COLOR_FULL} initial={initial?.vein_color} />
          <SelectField label="Пятна и брызги — основной цвет" name="spots_color" options={OPT.COLOR_FULL} initial={initial?.spots_color} />
          <SelectField label="Цвет глазной зоны (Eye Color)" name="eye_color" options={OPT.COLOR_FULL} initial={initial?.eye_color} />
          <SelectField label="Цвет тычиночных подушечек" name="pad_color" options={OPT.PAD_COLOR} initial={initial?.pad_color} />
          <SelectField label="Количество цветов" name="num_colors" options={OPT.COUNT} initial={initial?.num_colors} />
          <SelectField label="Концентрические цветовые кольца" name="color_rings" options={OPT.RINGS} initial={initial?.color_rings} />
        </Group>

        <Field label="Расцветка цветка — описание (Bloom Colors)" htmlFor="bloom_colors">
          <Textarea
            id="bloom_colors"
            name="bloom_colors"
            rows={3}
            placeholder="Опишите окраску: глазок, прожилки, основной цвет, переходы, кайму…"
            defaultValue={initial?.bloom_colors ?? ""}
          />
        </Field>

        {/* Характеристики цветения */}
        <Group title="Характеристики цветения">
          <SelectField label="Форма цветения (Bloom Form)" name="bloom_form" options={OPT.BLOOM_FORM} initial={initial?.bloom_form} />
          <SelectField label="Особенности (Bloom Features)" name="bloom_features" options={OPT.BLOOM_FEATURES} initial={initial?.bloom_features} />
          <SelectField label="Перекрытие лепестков (Petal Overlap)" name="petal_overlap" options={OPT.PETAL_OVERLAP} initial={initial?.petal_overlap} />
          <SelectField label="Прожилкование (Veining)" name="veining" options={OPT.VEINING} initial={initial?.veining} />
          <SelectField label="Субстанция (Substance)" name="substance" options={OPT.SUBSTANCE} initial={initial?.substance} />
          <SelectField label="Продолжительность (Duration)" name="bloom_duration" options={OPT.DURATION} initial={initial?.bloom_duration} />
          <SelectField label="Презентация (Presentation)" name="presentation" options={OPT.PRESENTATION} initial={initial?.presentation} />
          <SelectField label="Размер глазной зоны (Eye Zone)" name="eye_zone_size" options={OPT.ZONE_SIZE} initial={initial?.eye_zone_size} />
        </Group>

        {/* Размножение */}
        <Group title="Размножение">
          <SelectField label="Сеянец (Seedling)" name="prop_seedling" options={OPT.PROP_SEEDLING} initial={initial?.prop_seedling} />
          <SelectField label="Пыльца (Pollen)" name="prop_pollen" options={OPT.PROP_POLLEN} initial={initial?.prop_pollen} />
          <SelectField label="Укоренение (Rooting)" name="prop_rooting" options={OPT.PROP_ROOTING} initial={initial?.prop_rooting} />
          <SelectField label="Выращивание (Performance)" name="prop_performance" options={OPT.PROP_PERFORMANCE} initial={initial?.prop_performance} />
          <Field label="Размножение — заметка (Propagation)" htmlFor="propagation">
            <Input id="propagation" name="propagation" defaultValue={initial?.propagation ?? ""} />
          </Field>
        </Group>

        {/* Лист и куст */}
        <Group title="Лист и куст">
          <SelectField label="Размер листа (Leaf Size)" name="leaf_size" options={OPT.LEAF_SIZE} initial={initial?.leaf_size} />
          <SelectField label="Вид листа (Leaf Look)" name="leaf_look" options={OPT.LEAF_LOOK} initial={initial?.leaf_look} />
          <SelectField label="Развитие куста (Bush Development)" name="bush_development" options={OPT.BUSH_DEV} initial={initial?.bush_development} />
          <SelectField label="Размер куста (Bush Size)" name="bush_size" options={OPT.BUSH_SIZE} initial={initial?.bush_size} />
          <SelectField label="Ширина куста (Bush Width)" name="bush_width" options={OPT.BUSH_WIDTH} initial={initial?.bush_width} />
          <SelectField label="Форма куста (Bush Form)" name="bush_form" options={OPT.BUSH_FORM} initial={initial?.bush_form} />
        </Group>
      </div>

      {/* Родословная */}
      <div className="grid gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <GitFork className="size-4 text-primary" />
          <Label className="text-base">Родословная</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Укажите родительские сорта — они появятся в интерактивном дереве на
          странице сорта. Если сорт исходный, оставьте поля пустыми.
        </p>

        {/* Живой предпросмотр дерева */}
        <PedigreePreview
          current={{ name: nameValue, photo: mainPhoto }}
          parentA={findParent(parentA)}
          parentB={findParent(parentB)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <ParentPicker
            label="Родитель A"
            name="parent_a_id"
            options={parents.filter((p) => p.id !== parentB)}
            value={parentA}
            onChange={setParentA}
          />
          <ParentPicker
            label="Родитель B"
            name="parent_b_id"
            options={parents.filter((p) => p.id !== parentA)}
            value={parentB}
            onChange={setParentB}
          />
        </div>
      </div>

      {/* Главное фото */}
      <div className="grid gap-2">
        <Label>Главное фото</Label>
        <input type="hidden" name="main_photo_url" value={mainPhoto ?? ""} />
        <div className="flex items-center gap-4">
          <div className="relative size-28 overflow-hidden rounded-lg border bg-muted">
            {mainPhoto ? (
              <Image src={mainPhoto} alt="Главное фото" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                нет фото
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleMainFile(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => mainInputRef.current?.click()}
            >
              Загрузить
            </Button>
            {mainPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMainPhoto(null)}
              >
                Убрать
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Галерея — drag & drop */}
      <div className="grid gap-2">
        <Label>Галерея (несколько фото)</Label>
        {gallery.map((url) => (
          <input key={url} type="hidden" name="gallery_urls" value={url} />
        ))}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleGalleryFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm transition ${
            dragOver ? "border-primary bg-accent" : "border-input"
          }`}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="size-6 text-muted-foreground" />
          )}
          <p className="text-muted-foreground">
            Перетащите фото сюда или{" "}
            <label className="cursor-pointer font-medium text-primary underline">
              выберите файлы
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleGalleryFiles(e.target.files)}
              />
            </label>
          </p>
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {gallery.map((url, i) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-md border"
              >
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setGallery((g) => g.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={uploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/** Подраздел паспорта: заголовок + сетка полей по 2 в ряд. */
function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Выпадающий список (native select) для справочных полей паспорта. */
function SelectField({
  label,
  name,
  options,
  initial,
}: {
  label: string;
  name: string;
  options: readonly string[];
  initial?: string | null;
}) {
  return (
    <Field label={label} htmlFor={name}>
      <select
        id={name}
        name={name}
        defaultValue={initial ?? ""}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Поиск родителя по каталогу с выпадающим списком и выбранной карточкой. */
function ParentPicker({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: ParentOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = query.trim()
    ? options.filter((o) =>
        `${o.name} ${o.species} ${o.year_created ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : options;

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {/* Значение для отправки формы */}
      <input type="hidden" name={name} value={value} />

      {selected ? (
        <div className="flex items-center gap-3 rounded-md border bg-background p-2">
          <Thumb url={selected.main_photo_url} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selected.species}
              {selected.year_created ? ` · ${selected.year_created}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onChange("")}
            title="Убрать родителя"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Поиск по каталогу…"
            className="pl-9"
          />
          {open && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-card shadow-lg">
              {filtered.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  Ничего не найдено
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      onChange(o.id);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                  >
                    <Thumb url={o.main_photo_url} className="size-9" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {o.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.species}
                        {o.year_created ? ` · ${o.year_created}` : ""}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Мини-предпросмотр дерева: Родитель A + Родитель B → текущий сорт. */
function PedigreePreview({
  current,
  parentA,
  parentB,
}: {
  current: { name: string; photo: string | null };
  parentA: ParentOption | null;
  parentB: ParentOption | null;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="grid grid-cols-2 gap-3">
        <MiniCard
          label="Родитель A"
          name={parentA?.name}
          photo={parentA?.main_photo_url ?? null}
        />
        <MiniCard
          label="Родитель B"
          name={parentB?.name}
          photo={parentB?.main_photo_url ?? null}
        />
      </div>
      <div className="my-2 flex justify-center text-muted-foreground">↓</div>
      <div className="mx-auto max-w-[220px]">
        <MiniCard
          label="Новый сорт"
          name={current.name || "Без названия"}
          photo={current.photo}
          highlight
        />
      </div>
    </div>
  );
}

function MiniCard({
  label,
  name,
  photo,
  highlight = false,
}: {
  label: string;
  name?: string;
  photo: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border p-2 ${
        highlight ? "border-primary bg-accent/50" : "bg-card"
      }`}
    >
      <Thumb url={photo} className="size-9" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">
          {name || <span className="text-muted-foreground">не указан</span>}
        </p>
      </div>
    </div>
  );
}

function Thumb({ url, className }: { url: string | null; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-md border bg-muted ${className}`}>
      {url ? (
        <Image src={url} alt="" fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Sprout className="size-4" />
        </div>
      )}
    </div>
  );
}
