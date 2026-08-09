"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import {
  registerWithPassword,
  loginWithPassword,
  requestPasswordReset,
  resetPassword,
} from "@/lib/actions";

type FormState = { error?: string };

export function AuthForms() {
  const [mode, setMode] = useState<"register" | "login">("register");

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`text-sm font-medium ${
              mode === "register" ? "text-primary underline" : "text-muted-foreground"
            }`}
          >
            Регистрация
          </button>
          <span className="text-muted-foreground">/</span>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`text-sm font-medium ${
              mode === "login" ? "text-primary underline" : "text-muted-foreground"
            }`}
          >
            Вход
          </button>
        </div>
        <CardTitle>{mode === "register" ? "Создать профиль" : "Войти"}</CardTitle>
        <CardDescription>
          {mode === "register"
            ? "Укажите email и пароль, чтобы вести свои сорта."
            : "Введите email и пароль от вашего профиля."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "register" ? <RegisterForm /> : <LoginForm />}
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    registerWithPassword,
    {}
  );

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" required placeholder="Иван Селекционер" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="city">Город</Label>
        <Input id="city" name="city" placeholder="Москва" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="pd_consent"
          required
          className="mt-0.5 size-3.5 shrink-0"
        />
        <span>
          Я даю{" "}
          <a href="/legal/pd-consent" target="_blank" className="text-primary underline">
            согласие на обработку персональных данных
          </a>{" "}
          и принимаю{" "}
          <a href="/legal/terms" target="_blank" className="text-primary underline">
            Пользовательское соглашение
          </a>
          .
        </span>
      </label>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать профиль"}
      </Button>
    </form>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    loginWithPassword,
    {}
  );

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Пароль</Label>
        <Input id="login-password" name="password" type="password" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </Button>
      <Link
        href="/forgot-password"
        className="text-center text-xs text-muted-foreground hover:text-foreground"
      >
        Забыли пароль?
      </Link>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<{ message?: string }, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input id="reset-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Отправляем…" : "Отправить ссылку"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    resetPassword,
    {}
  );

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-2">
        <Label htmlFor="new-password">Новый пароль</Label>
        <Input id="new-password" name="password" type="password" required minLength={8} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить пароль"}
      </Button>
    </form>
  );
}
