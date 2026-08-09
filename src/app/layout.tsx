import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CookieBanner } from "@/components/cookie-banner";
import { ORG } from "@/lib/org-details";

export const metadata: Metadata = {
  title: "Реестр селекционеров и сортов гибискусов",
  description:
    "Единый реестр сортов гибискусов России с родословными и галереями.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      {/* suppressHydrationWarning: расширения браузера (ColorZilla, Kaspersky и
          т.п.) дописывают атрибуты в <body> до гидрации — это не баг приложения. */}
      <body
        className="min-h-dvh flex flex-col antialiased"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-sm text-muted-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/legal/privacy" className="hover:text-foreground">
                Политика конфиденциальности
              </Link>
              <Link href="/legal/terms" className="hover:text-foreground">
                Пользовательское соглашение
              </Link>
              <Link href="/legal/cookies" className="hover:text-foreground">
                Использование cookie
              </Link>
              <Link href="/legal/pd-consent" className="hover:text-foreground">
                Согласие на обработку ПД
              </Link>
            </div>
            <div className="text-xs leading-relaxed">
              {ORG.fullName} · ИНН {ORG.inn} · ОГРН {ORG.ogrn}
              <br />
              {ORG.address} · {ORG.contactEmail}
            </div>
            <div>Реестр сортов гибискусов · MVP</div>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
