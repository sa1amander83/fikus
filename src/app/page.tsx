import Link from "next/link";
import {
  ArrowRight,
  GitFork,
  Images,
  BookOpen,
  FlaskConical,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { VarietyCard } from "@/components/variety-card";
import { searchVarieties, countVarieties } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [varieties, total] = await Promise.all([
    searchVarieties(),
    countVarieties(),
  ]);
  const popular = varieties.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {total} сортов в реестре
          </span>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Реестр сортов гибискусов
          </h1>
          <p className="max-w-2xl text-muted-foreground sm:text-lg">
            Ведите свои сорта гибискусов в едином реестре —
            с родословными и галереями фотографий.
          </p>
          <SearchBar />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Войти / Зарегистрироваться <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/catalog">Смотреть каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-6 py-12 sm:grid-cols-3">
        <Feature
          icon={<BookOpen className="size-5" />}
          title="Каталог сортов"
          text="Поиск и фильтры по типу цветка, селекционеру и году создания."
        />
        <Feature
          icon={<GitFork className="size-5" />}
          title="Родословная"
          text="Интерактивное дерево с родителями каждого гибрида."
        />
        <Feature
          icon={<Images className="size-5" />}
          title="Галереи"
          text="Слайдер и сетка фотографий для каждого сорта."
        />
      </section>

      {/* Кто такие гибридизеры и гроверы */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-semibold">
              Гибридизеры и гроверы — в чём разница
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              В паспорте каждого сорта указаны два человека. Это разные роли,
              и важно их не путать.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Role
              icon={<FlaskConical className="size-5" />}
              title="Гибридизер (Hybridizer)"
              subtitle="Селекционер — автор сорта"
              text="Тот, кто вывел сорт: подобрал родительскую пару, опылил материнское растение пыльцой отцовского, вырастил сеянцы и отобрал лучший. Именно гибридизер даёт сорту название и регистрирует его. По сути — автор."
              points={[
                "Создаёт скрещивание (pod parent × pollen parent)",
                "Отбирает и именует новый сорт",
                "Регистрирует сорт под своим именем",
              ]}
            />
            <Role
              icon={<Sprout className="size-5" />}
              title="Гровер (Grower)"
              subtitle="Тот, кто вырастил растение"
              text="Тот, кто выращивает уже существующий сорт: размножает его, ухаживает и доводит до цветения. Часто гровер и гибридизер — один человек, но сорт может растить и другой коллекционер, сохраняя авторство за гибридизером."
              points={[
                "Размножает и выращивает сорт",
                "Обеспечивает уход и цветение",
                "Может отличаться от автора-гибридизера",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="container pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Популярные сорта</h2>
          <Link
            href="/catalog"
            className="text-sm font-medium text-primary hover:underline"
          >
            Весь каталог →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((v) => (
            <VarietyCard key={v.id} variety={v} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Role({
  icon,
  title,
  subtitle,
  text,
  points,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  text: string;
  points: string[];
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
      <ul className="mt-4 space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
