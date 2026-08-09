import { Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="container flex max-w-md flex-col gap-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sprout className="size-9 text-primary" />
        <h1 className="text-2xl font-bold">Новый пароль</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Задайте новый пароль</CardTitle>
          <CardDescription>Ссылка действительна 30 минут.</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-destructive">Ссылка недействительна: отсутствует токен.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
