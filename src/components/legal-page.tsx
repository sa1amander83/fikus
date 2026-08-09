import Link from "next/link";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-10">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← На главную
      </Link>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Редакция от {updatedAt}
      </p>
      <div className="mt-8 grid gap-4 text-sm leading-relaxed text-foreground/90 sm:text-base [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:grid [&_ol]:gap-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:grid [&_ul]:gap-1">
        {children}
      </div>
    </div>
  );
}

export function Field({ children }: { children: string }) {
  return (
    <span className="rounded bg-accent px-1 py-0.5 font-medium text-foreground">
      {children}
    </span>
  );
}
