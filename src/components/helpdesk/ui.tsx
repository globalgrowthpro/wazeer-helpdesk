import { ChevronLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function Panel({ title, icon: Icon, action, children, className = "" }: { title: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-border bg-card shadow-xs ${className}`}>
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2.5 border-b border-border px-4 py-3 sm:min-h-16 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-brand-ink" />}
          <h2 className="truncate text-base font-bold sm:text-lg">{title}</h2>
        </div>
        {action && <div className="flex items-center gap-1.5 flex-wrap shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

export function SectionHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}

export type StatTone = "navy" | "amber" | "crimson" | "forest" | "apricot" | "sand" | "flame" | "sage";

const toneClass: Record<StatTone, string> = {
  navy: "tone-navy",
  amber: "tone-amber",
  crimson: "tone-crimson",
  forest: "tone-forest",
  apricot: "tone-apricot",
  sand: "tone-sand",
  flame: "tone-flame",
  sage: "tone-sage",
};

export function Stat({ label, value, note, icon: Icon, tone = "navy" }: { label: string; value: string; note?: string; icon: LucideIcon; tone?: StatTone }) {
  return (
    <article className={`overflow-hidden rounded-xl border p-3 sm:p-4 shadow-xs ${toneClass[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] sm:text-xs font-bold text-[var(--tone-ink)] opacity-80">{label}</p>
          <p className="mt-1 sm:mt-2 truncate font-display text-lg sm:text-2xl font-bold text-[var(--tone-ink)] leading-tight">{value}</p>
          {note && <p className="mt-1 truncate text-[10px] sm:text-xs font-semibold text-[var(--tone-ink)] opacity-75">{note}</p>}
        </div>
        <span className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg bg-[var(--tone-chip)] text-[var(--tone-ink)]">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
    </article>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-bold">{label}</span>{children}</label>;
}

export function EmptyAction({ children }: { children: ReactNode }) {
  return <Button variant="ghost" size="sm">{children}<ChevronLeft className="h-4 w-4" /></Button>;
}