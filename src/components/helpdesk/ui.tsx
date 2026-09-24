import { ChevronLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function Panel({ title, icon: Icon, action, children, className = "" }: { title: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}><header className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-5"><div className="flex min-w-0 items-center gap-2">{Icon && <Icon className="h-5 w-5 shrink-0 text-brand-ink" />}<h2 className="truncate text-lg font-bold">{title}</h2></div>{action}</header>{children}</section>;
}

export function SectionHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}

export function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note?: string; icon: LucideIcon }) {
  return <article className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p>{note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}</div><span className="grid h-10 w-10 place-items-center rounded-md bg-flow text-brand-ink"><Icon className="h-5 w-5" /></span></div></article>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-bold">{label}</span>{children}</label>;
}

export function EmptyAction({ children }: { children: ReactNode }) {
  return <Button variant="ghost" size="sm">{children}<ChevronLeft className="h-4 w-4" /></Button>;
}