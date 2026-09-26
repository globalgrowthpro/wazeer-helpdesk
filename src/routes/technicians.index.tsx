import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileDown,
  MapPin,
  Search,
  Star,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportToExcel } from "@/lib/export-excel";
import { technicians } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/technicians/")({
  head: () => ({
    meta: [
      { title: "الفنيون | وزير الحلو" },
      { name: "description", content: "متابعة الفنيين وأحمال العمل والمهام الحالية." },
      { property: "og:title", content: "الفنيون | وزير الحلو" },
      { property: "og:description", content: "متابعة الفنيين وأحمال العمل والمهام الحالية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TechniciansPage,
});

function TechniciansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "busy">("all");

  const filtered = useMemo(() => {
    return technicians.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.skill.toLowerCase().includes(q) ||
        t.zone.toLowerCase().includes(q);
      const isAvailable = t.status === "متاح" || t.status === "متاحة";
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && isAvailable) ||
        (statusFilter === "busy" && !isAvailable);
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const availableCount = technicians.filter((t) => t.status === "متاح" || t.status === "متاحة").length;
  const busyCount = technicians.length - availableCount;

  const handleExport = () => {
    exportToExcel({
      rows: filtered.map((t) => ({
        id: t.employeeId ?? t.id,
        name: t.name,
        skill: t.skill,
        zone: t.zone,
        status: t.status,
        phone: t.phone,
        email: t.email ?? "",
        load: t.load,
        completed: t.completed,
        rating: t.rating ?? "",
        slaCompliance: t.slaCompliance ?? "",
      })),
      headers: {
        id: "رقم الموظف",
        name: "الاسم",
        skill: "التخصص",
        zone: "المنطقة",
        status: "الحالة",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        load: "مهام نشطة",
        completed: "مهام منجزة",
        rating: "التقييم",
        slaCompliance: "الالتزام بـ SLA",
      },
      sheetName: "الفنيون",
      fileName: `وزير-الفنيون-${new Date().toISOString().slice(0, 10)}`,
    });
  };

  return (
    <AppShell title="الفنيون">
      <SectionHeading
        title="فريق الصيانة الميداني"
        description="تابع التوفر والتخصص والمهام المسندة لكل فني — اضغط على بطاقة الفني لعرض ملفه الكامل"
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <FileDown className="h-4 w-4" />
            تصدير Excel
          </Button>
        }
      />

      {/* KPI Stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="إجمالي الفنيين" value={String(technicians.length)} icon={UsersRound} tone="navy" note="في الفريق الميداني" />
        <Stat label="متاحون الآن" value={String(availableCount)} icon={CheckCircle2} tone="forest" note="جاهزون للاستجابة" />
        <Stat label="في مهمة" value={String(busyCount)} icon={Wrench} tone="amber" note="يعملون حالياً" />
        <Stat label="متوسط الإنجاز" value={String(Math.round(technicians.reduce((s, t) => s + t.completed, 0) / technicians.length))} icon={Star} tone="sand" note="مهمة لكل فني" />
      </section>

      <Panel
        title={`قائمة الفنيين (${filtered.length})`}
        icon={UsersRound}
        action={
          <div className="flex items-center gap-2">
            {(["all", "available", "busy"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setStatusFilter(v)}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                  statusFilter === v
                    ? "bg-brand-ink text-primary-foreground border-brand-ink"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "all" ? "الكل" : v === "available" ? "متاح" : "في مهمة"}
              </button>
            ))}
          </div>
        }
      >
        {/* Search bar */}
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو التخصص أو المنطقة..."
              className="h-9 pr-9 text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-8 text-center">
            <div>
              <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 font-bold">لا يوجد فنيون مطابقون</p>
              <p className="mt-1 text-sm text-muted-foreground">جرّب تغيير البحث أو الفلتر.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((tech) => {
              const isAvailable = tech.status === "متاح" || tech.status === "متاحة";
              return (
                <Link
                  key={tech.id}
                  to="/technicians/$technicianId"
                  params={{ technicianId: tech.id }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-copper/50 hover:shadow-lg"
                >
                  {/* Top gradient stripe */}
                  <div className={`h-1.5 w-full ${isAvailable ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-amber-400 to-amber-600"}`} />

                  <div className="flex flex-col gap-4 p-5">
                    {/* Header: avatar + badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        {tech.avatar ? (
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="h-16 w-16 rounded-2xl object-cover border-2 border-border shadow-md transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-ink/10 text-xl font-bold text-brand-ink">
                            {tech.name.slice(0, 1)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
                            isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold px-2.5 py-0.5 ${
                            isAvailable
                              ? "bg-emerald-500/10 text-emerald-800 border-emerald-300"
                              : "bg-amber-500/10 text-amber-800 border-amber-300"
                          }`}
                        >
                          {tech.status}
                        </Badge>
                        {tech.rating && (
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {tech.rating}
                            {tech.reviewsCount && (
                              <span className="font-normal text-muted-foreground">({tech.reviewsCount})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name + skill */}
                    <div>
                      <h2 className="text-base font-bold text-foreground group-hover:text-brand-ink transition-colors">
                        {tech.name}
                      </h2>
                      {tech.employeeId && (
                        <p className="text-[11px] font-mono font-semibold text-brand-copper/80 mt-0.5">{tech.employeeId}</p>
                      )}
                      <p className="mt-1.5 text-xs font-semibold text-brand-ink/80 flex items-center gap-1">
                        <Award className="h-3 w-3 shrink-0 text-brand-copper" />
                        {tech.skill}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {tech.zone}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{tech.load}</p>
                        <p className="text-[10px] text-muted-foreground">نشطة</p>
                      </div>
                      <div className="text-center border-x border-border">
                        <p className="text-lg font-bold text-emerald-700">{tech.completed}</p>
                        <p className="text-[10px] text-muted-foreground">منجزة</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-brand-ink">{tech.slaCompliance ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground">SLA</p>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {tech.avgResponseTime ?? "—"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-brand-copper group-hover:gap-2 transition-all">
                        عرض الملف
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}