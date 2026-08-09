import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentBreeder } from "@/lib/auth";
import { getVarietiesByBreeder } from "@/lib/data";
import { updateProfile, deleteVariety } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const breeder = await getCurrentBreeder();
  if (!breeder) redirect("/login");

  const varieties = await getVarietiesByBreeder(breeder.id);

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[320px_1fr]">
      {/* Профиль */}
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm breeder={breeder} action={updateProfile} />
            <Button asChild variant="link" className="mt-2 px-0">
              <Link href={`/breeder/${breeder.id}`}>Открыть публичную страницу →</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>

      {/* Мои сорта */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Мои сорта</h1>
            <p className="text-sm text-muted-foreground">Всего: {varieties.length}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="size-4" /> Добавить сорт
            </Link>
          </Button>
        </div>

        {varieties.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">Вы ещё не добавили ни одного сорта.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/new">Добавить первый сорт</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Фото</th>
                  <th className="p-3 font-medium">Название</th>
                  <th className="hidden p-3 font-medium sm:table-cell">Вид</th>
                  <th className="hidden p-3 font-medium sm:table-cell">Год</th>
                  <th className="p-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {varieties.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="p-3">
                      <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                        {v.main_photo_url ? (
                          <Image src={v.main_photo_url} alt={v.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Sprout className="size-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link href={`/variety/${v.id}`} className="font-medium hover:text-primary">
                        {v.name}
                      </Link>
                    </td>
                    <td className="hidden p-3 text-muted-foreground sm:table-cell">{v.species}</td>
                    <td className="hidden p-3 text-muted-foreground sm:table-cell">{v.year_created ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/${v.id}/edit`}>
                            <Pencil className="size-3.5" /> Изменить
                          </Link>
                        </Button>
                        <form action={deleteVariety}>
                          <input type="hidden" name="variety_id" value={v.id} />
                          <Button variant="ghost" size="icon" type="submit" title="Удалить">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
