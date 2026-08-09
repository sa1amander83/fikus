import { redirect } from "next/navigation";
import { Sprout } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBreeders } from "@/lib/data";
import { getCurrentBreederId } from "@/lib/auth";
import { loginAs } from "@/lib/actions";
import { AuthForms } from "@/components/auth-forms";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentBreederId()) redirect("/dashboard");
  const breeders = await getBreeders();

  return (
    <div className="container flex max-w-md flex-col gap-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sprout className="size-9 text-primary" />
        <h1 className="text-2xl font-bold">Вход селекционера</h1>
        <p className="text-sm text-muted-foreground">
          Зарегистрируйтесь по email и паролю или войдите в уже созданный профиль.
        </p>
      </div>

      <AuthForms />

      {breeders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Демо-вход</CardTitle>
            <CardDescription>Быстрый вход для демонстрации, без пароля.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {breeders.map((b) => (
              <form key={b.id} action={loginAs.bind(null, b.id)}>
                <Button type="submit" variant="outline" className="w-full justify-between">
                  <span>{b.name}</span>
                  <span className="text-xs text-muted-foreground">{b.city}</span>
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
