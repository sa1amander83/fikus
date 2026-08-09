import Link from "next/link";
import { Sprout, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentBreeder } from "@/lib/auth";
import { logout } from "@/lib/actions";

export async function Navbar() {
  const breeder = await getCurrentBreeder();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sprout className="size-6 text-primary" />
          <span className="hidden sm:inline">Реестр гибискусов</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/catalog">Каталог</Link>
          </Button>

          {breeder ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  <span className="hidden sm:inline">Кабинет</span>
                </Link>
              </Button>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
