import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3, MapPin, UsersRound } from "lucide-react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { technicians } from "@/lib/helpdesk-data";
export const Route = createFileRoute("/technicians/")({ head: () => ({ meta: [{ title: "الفنيون | وزير الحلو" }, { name: "description", content: "متابعة الفنيين وأحمال العمل والمهام الحالية." }, { property: "og:title", content: "الفنيون | وزير الحلو" }, { property: "og:description", content: "متابعة الفنيين وأحمال العمل والمهام الحالية." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: TechniciansPage });
function TechniciansPage() {
  return (
    <AppShell title="الفنيون">
      <SectionHeading
        title="فريق الصيانة"
        description="تابع التوفر والتخصص والمهام المسندة لكل فني"
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="إجمالي الفنيين" value="28" icon={UsersRound} />
        <Stat label="المتاحون الآن" value="11" icon={CheckCircle2} />
        <Stat label="في مهمة" value="14" icon={Clock3} />
        <Stat label="زيارات اليوم" value="8" icon={MapPin} />
      </section>
      <Panel title="قائمة الفنيين">
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {technicians.map((tech) => (
            <Link
              key={tech.id}
              to="/technicians/$technicianId"
              params={{ technicianId: tech.id }}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-copper/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  {tech.avatar ? (
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-brand-copper/40 shadow-md transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-ink/10 font-bold text-lg text-brand-ink">
                      {tech.name.slice(0, 1)}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card ${
                      tech.status === "متاح" || tech.status === "متاحة"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                </div>
                <Badge
                  className={`text-xs px-2.5 py-0.5 font-bold ${
                    tech.status === "متاح" || tech.status === "متاحة"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                  }`}
                  variant="outline"
                >
                  {tech.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h2 className="font-bold text-base text-foreground group-hover:text-brand-ink transition-colors">
                  {tech.name}
                </h2>
                {tech.rating && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    ★ {tech.rating}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold text-brand-ink/80">
                {tech.skill}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {tech.zone}
              </p>
              <div className="mt-3.5 flex items-center justify-between border-t border-border pt-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{tech.load} مهام نشطة</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{tech.completed} مهمة منجزة</span>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}