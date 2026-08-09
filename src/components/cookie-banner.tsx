"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex flex-col items-center gap-3 py-4 text-sm sm:flex-row sm:justify-between">
        <p className="text-muted-foreground">
          Мы используем файлы cookie для корректной работы сайта и анализа
          посещаемости. Продолжая пользоваться сайтом, вы соглашаетесь с{" "}
          <Link href="/legal/cookies" className="text-primary underline">
            использованием cookie
          </Link>{" "}
          и{" "}
          <Link href="/legal/privacy" className="text-primary underline">
            Политикой конфиденциальности
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Принять
        </Button>
      </div>
    </div>
  );
}
