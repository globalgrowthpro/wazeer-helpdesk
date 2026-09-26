import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getStoredTasks,
  getStoredTickets,
  technicians,
  type Ticket,
} from "@/lib/helpdesk-data";

export const Route = createFileRoute("/technicians/$technicianId")({
  loader: ({ params }) => {
    const technician = technicians.find((t) => t.id === params.technicianId);
    if (!technician) throw notFound();
    return technician;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} | ملف الفني` : "الفني غير موجود" },
      { name: "description", content: "ملف الفني الكامل مع المهام والبلاغات المرتبطة." },
      { property: "og:title", content: loaderData ? `${loaderData.name} | ملف الفني` : "الفني غير موجود" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TechnicianProfile,
});

const statusColors: Record<string, string> = {
  "جديد": "bg-blue-500/10 text-blue-800 border-blue-300",
  "مسندة": "bg-blue-500/10 text-blue-800 border-blue-300",
  "قيد التنفيذ": "bg-amber-500/10 text-amber-800 border-amber-300",
  "العمل جارٍ": "bg-amber-500/10 text-amber-800 border-amber-300",
  "حرج": "bg-red-500/10 text-red-800 border-red-300",
  "بانتظار شراء": "bg-orange-500/10 text-orange-800 border-orange-300",
  "بانتظار قطعة": "bg-orange-500/10 text-orange-800 border-orange-300",
  "بانتظار مراجعة الإدارة": "bg-purple-500/10 text-purple-800 border-purple-300",
  "بانتظار تأكيد الفرع": "bg-purple-500/10 text-purple-800 border-purple-300",
  "مغلق": "bg-muted text-muted-foreground border-border",
};

const priorityColors: Record<string, string> = {
  "حرجة": "bg-red-500/10 text-red-800 border-red-300",
  "عالية": "bg-orange-500/10 text-orange-800 border-orange-300",
  "متوسطة": "bg-amber-500/10 text-amber-800 border-amber-300",
  "منخفضة": "bg-muted text-muted-foreground border-border",
};


function TechnicianProfile() {
  const technician = Route.useLoaderData();
  const isAvailable = technician.status === "متاح" || technician.status === "متاحة";

  const [relatedTickets, setRelatedTickets] = useState<Ticket[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Ticket[]>([]);

  useEffect(() => {
    const tickets = getStoredTickets().filter((t) => t.technicianId === technician.id);
    const tasks = getStoredTasks().filter((t) => t.technicianId === technician.id);
    setRelatedTickets(tickets);
    setRelatedTasks(tasks);
  }, [technician.id]);

  return (
    <AppShell title="ملف الفني">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link to="/technicians">
            <ArrowRight className="h-4 w-4" />
            العودة إلى قائمة الفنيين
          </Link>
        </Button>
      </div>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Top color bar */}
        <div className={`h-2 w-full ${isAvailable ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-amber-400 to-amber-600"}`} />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {technician.avatar ? (
              <img
                src={technician.avatar}
                alt={technician.name}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-border shadow-lg"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-brand-ink/10 text-3xl font-bold text-brand-ink">
                {technician.name.slice(0, 1)}
              </div>
            )}
            <span
              className={`absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-card shadow-sm ${
                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{technician.name}</h1>
                {technician.employeeId && (
                  <p className="mt-0.5 font-mono text-xs font-semibold text-brand-copper/80">{technician.employeeId}</p>
                )}
              </div>
              <Badge
                variant="outline"
                className={`mt-0.5 text-xs font-bold px-3 py-1 ${
                  isAvailable
                    ? "bg-emerald-500/10 text-emerald-800 border-emerald-300"
                    : "bg-amber-500/10 text-amber-800 border-amber-300"
                }`}
              >
                {technician.status}
              </Badge>
            </div>

            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-ink/80">
              <Award className="h-4 w-4 text-brand-copper shrink-0" />
              {technician.skill}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {technician.zone}
            </p>
            {technician.bio && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 max-w-2xl">{technician.bio}</p>
            )}

            {/* Contact row */}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${technician.phone}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-brand-copper" />
                {technician.phone}
              </a>
              {technician.email && (
                <a
                  href={`mailto:${technician.email}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-brand-copper" />
                  {technician.email}
                </a>
              )}
              {technician.shift && (
                <span className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-brand-copper" />
                  {technician.shift}
                </span>
              )}
              {technician.vehicle && (
                <span className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Truck className="h-3.5 w-3.5 text-brand-copper" />
                  {technician.vehicle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span className="text-xs font-semibold">المهام النشطة</span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-1">{technician.load}</p>
          <p className="text-xs text-muted-foreground">بلاغ ومهمة جارية</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold">المكتملة</span>
          </div>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{technician.completed}</p>
          <p className="text-xs text-muted-foreground">مهمة منجزة</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-xs font-semibold">التقييم</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-1">{technician.rating ?? "—"}<span className="text-base font-normal text-muted-foreground">/5</span></p>
          <p className="text-xs text-muted-foreground">{technician.reviewsCount ? `من ${technician.reviewsCount} تقييم` : "لا يوجد تقييم"}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span className="text-xs font-semibold">الالتزام بـ SLA</span>
          </div>
          <p className="text-3xl font-bold text-brand-ink mt-1">{technician.slaCompliance ?? "—"}</p>
          <p className="text-xs text-muted-foreground">متوسط استجابة {technician.avgResponseTime ?? "—"}</p>
        </div>
      </section>

      {/* Two-column: skills + certifications */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Skills */}
        {technician.skillsList && technician.skillsList.length > 0 && (
          <Panel title="مستوى المهارات" icon={Wrench}>
            <div className="space-y-4 p-5">
              {technician.skillsList.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-foreground">{skill.name}</span>
                    <span className="font-bold text-brand-ink">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-copper to-brand-ink transition-all duration-700"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Certifications + Supervisor */}
        <Panel title="الشهادات والمعلومات الإضافية" icon={Shield}>
          <div className="space-y-4 p-5">
            {technician.certifications && technician.certifications.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">الشهادات المهنية</p>
                <ul className="space-y-2">
                  {technician.certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span className="text-foreground/90">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {technician.supervisor && (
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-bold text-muted-foreground mb-1">المشرف المباشر</p>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserRound className="h-4 w-4 text-brand-copper" />
                  {technician.supervisor}
                </p>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Related Tickets */}
      <Panel
        title={`البلاغات المرتبطة (${relatedTickets.length})`}
        icon={FileText}
        action={
          relatedTickets.length > 0 ? (
            <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Link to="/tickets">عرض الكل</Link>
            </Button>
          ) : undefined
        }
      >
        {relatedTickets.length === 0 ? (
          <div className="grid min-h-32 place-items-center p-6 text-center">
            <div>
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">لا توجد بلاغات مسندة لهذا الفني</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="min-w-[130px]">رقم البلاغ</TableHead>
                  <TableHead className="min-w-[200px]">العنوان</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-16 text-center">عرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedTickets.map((t) => (
                  <TableRow key={t.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-brand-ink">{t.id}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-sm text-foreground group-hover:text-brand-copper transition-colors line-clamp-1 max-w-[220px]">
                        {t.title}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.branch}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${priorityColors[t.priority] ?? ""}`}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${statusColors[t.status] ?? ""}`}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      {/* Related Tasks */}
      <Panel
        title={`المهام الداخلية المرتبطة (${relatedTasks.length})`}
        icon={ListChecks}
        action={
          relatedTasks.length > 0 ? (
            <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Link to="/tasks">عرض الكل</Link>
            </Button>
          ) : undefined
        }
      >
        {relatedTasks.length === 0 ? (
          <div className="grid min-h-32 place-items-center p-6 text-center">
            <div>
              <ListChecks className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">لا توجد مهام داخلية مسندة لهذا الفني</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="min-w-[130px]">رقم المهمة</TableHead>
                  <TableHead className="min-w-[200px]">العنوان</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-16 text-center">عرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedTasks.map((t) => (
                  <TableRow key={t.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-brand-ink">{t.id}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-sm text-foreground group-hover:text-brand-copper transition-colors line-clamp-1 max-w-[220px]">
                        {t.title}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.branch}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${priorityColors[t.priority] ?? ""}`}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${statusColors[t.status] ?? ""}`}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Link to="/tasks">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}