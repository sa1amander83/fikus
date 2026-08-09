import { Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <div className="container flex max-w-md flex-col gap-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sprout className="size-9 text-primary" />
        <h1 className="text-2xl font-bold">Восстановление пароля</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Забыли пароль?</CardTitle>
          <CardDescription>Укажите email — мы отправим ссылку для сброса.</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
