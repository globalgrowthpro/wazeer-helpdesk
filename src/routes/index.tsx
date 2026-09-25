import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowLeftRight, BadgeCheck, Building2, CheckCircle2,
  CircleDollarSign, Clock3, FilePlus2, Gauge, LifeBuoy, MapPin, PackageCheck,
  ShoppingCart, Timer, Truck, UserPlus, Users, UsersRound, Wrench,
} from "lucide-react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { branches, technicians, ticketEvents, tickets } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وزير الحلو | لوحة العمليات" },
      { name: "description", content: "لوحة متابعة عربية لعمليات الدعم والصيانة." },
      { property: "og:title", content: "وزير الحلو | لوحة العمليات" },
      { property: "og:description", content: "متابعة البلاغات والفنيين ومستوى الخدمة." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ]
  }),
  component: Dashboard,
});

const stats = [
  { label: "إجمالي البلاغات", value: "452", note: "+12 هذا الأسبوع", icon: LifeBuoy, tone: "navy" },
  { label: "البلاغات المفتوحة", value: "46", note: "نشطة الآن", icon: Clock3, tone: "amber" },
  { label: "بلاغات حرجة", value: "3", note: "تحتاج تدخلاً", icon: AlertTriangle, tone: "crimson" },
  { label: "تم حلها اليوم", value: "295", note: "بلاغاً", icon: CheckCircle2, tone: "forest" },
  { label: "طلبات الشراء", value: "17", note: "5 بانتظار الاعتماد", icon: ShoppingCart, tone: "apricot" },
  { label: "إجمالي الفروع", value: "12", note: "فرعاً في الخدمة", icon: Building2, tone: "sand" },
  { label: "الفنيون النشطون", value: "23", note: "من أصل 28", icon: UsersRound, tone: "flame" },
  { label: "إجمالي الموظفين", value: "96", note: "عبر جميع الفروع", icon: Users, tone: "sage" },
  { label: "زيارات اليوم", value: "8", note: "3 قيد التنفيذ", icon: MapPin, tone: "sage" },
  { label: "تكلفة الشهر", value: "48.2K", note: "جنيه مصري", icon: CircleDollarSign, tone: "navy" },
] as const;

const weekTrend = [
  { day: "السبت", opened: 18, solved: 14 },
  { day: "الأحد", opened: 24, solved: 21 },
  { day: "الإثنين", opened: 31, solved: 26 },
  { day: "الثلاثاء", opened: 27, solved: 30 },
  { day: "الأربعاء", opened: 35, solved: 29 },
  { day: "الخميس", opened: 22, solved: 28 },
  { day: "الجمعة", opened: 12, solved: 16 },
];

const purchaseRequests = [
  { id: "PR-2026-0082", item: "بطاقة دخول بديل", branch: "فرع المعادي", cost: "770 ج.م", status: "بانتظار الاعتماد" },
  { id: "PR-2026-0081", item: "كابل شبكة CAT6", branch: "فرع مدينة نصر", cost: "340 ج.م", status: "بانتظار الاعتماد" },
  { id: "PR-2026-0080", item: "محول كهرباء 12V", branch: "فرع التجمع", cost: "185 ج.م", status: "قيد الصرف" },
];

const quickActions = [
  { label: "بلاغ جديد", icon: FilePlus2, to: "/branches" as const },
  { label: "إسناد فني", icon: UserPlus, to: "/tickets" as const },
  { label: "طلب شراء", icon: ShoppingCart, to: "/purchases" as const },
  { label: "جدولة زيارة", icon: Truck, to: "/field-service" as const },
  { label: "تقرير أسبوعي", icon: Gauge, to: "/reports" as const },
  { label: "سجل الأصول", icon: BadgeCheck, to: "/assets" as const },
];

const categoryBreakdown = [
  { label: "كاميرات مراقبة", count: 146, pct: 32 },
  { label: "شبكات", count: 118, pct: 26 },
  { label: "تحكم دخول", count: 94, pct: 21 },
  { label: "أجهزة نقاط بيع", count: 57, pct: 13 },
  { label: "أخرى", count: 37, pct: 8 },
];

function TrendChart() {
  const max = Math.max(...weekTrend.map((d) => Math.max(d.opened, d.solved)));
  return (
    <div className="p-5">
      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-kpi-navy" />بلاغات جديدة</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-kpi-forest" />تم حلها</span>
      </div>
      <div className="mt-4 flex h-44 items-end justify-between gap-2">
        {weekTrend.map((d) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-36 w-full items-end justify-center gap-1">
              <div className="w-3 rounded-t-md bg-kpi-navy transition-all sm:w-4" style={{ height: `${Math.round((d.opened / max) * 100)}%` }} title={`${d.opened}`} />
              <div className="w-3 rounded-t-md bg-kpi-forest transition-all sm:w-4" style={{ height: `${Math.round((d.solved / max) * 100)}%` }} title={`${d.solved}`} />
            </div>
            <span className="truncate text-[11px] font-semibold text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlaPanel() {
  const items = [
    { label: "الالتزام بمستوى الخدمة", value: 93, tone: "bg-kpi-forest", note: "93% من البلاغات ضمن المدة" },
    { label: "متوسط زمن الاستجابة", value: 82, tone: "bg-kpi-navy", note: "18 دقيقة حتى وصول الفني" },
    { label: "بلاغات قاربت التجاوز", value: 34, tone: "bg-kpi-flame", note: "4 بلاغات تحتاج متابعة" },
  ];
  return (
    <div className="space-y-4 p-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-sm"><span className="font-bold">{item.label}</span><span className="font-mono font-bold text-brand-ink">{item.value}%</span></div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-strong"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} /></div>
          <p className="mt-1.5 text-xs text-muted-foreground">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  return (
    <AppShell title="لوحة العمليات">
      <SectionHeading title="نظرة عامة" description="ملخص مباشر لأداء الدعم والصيانة اليوم" action={<Button asChild><Link to="/tickets">عرض جميع البلاغات</Link></Button>} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => <Stat key={stat.label} {...stat} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)]">
        <Panel title="اتجاهات البلاغات الأسبوعية" icon={Timer} action={<Button asChild size="sm" variant="ghost"><Link to="/reports">التقرير الكامل</Link></Button>}><TrendChart /></Panel>
        <Panel title="توزيع الحالات">
          <div className="flex flex-col items-center p-5">
            <div className="ticket-donut grid h-44 w-44 place-items-center rounded-full">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-card text-center">
                <div><p className="font-display text-3xl font-bold">452</p><p className="text-xs text-muted-foreground">إجمالي البلاغات</p></div>
              </div>
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-3 text-xs">
              <span>● مغلقة 61%</span><span className="text-brand-green">● محلولة 12%</span>
              <span className="text-brand-gold">● انتظار 8%</span><span className="text-brand-ink">● مفتوحة 19%</span>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)]">
        <Panel title="البلاغات النشطة" icon={LifeBuoy} action={<Button asChild size="sm" variant="ghost"><Link to="/tickets">عرض الكل</Link></Button>}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">رقم البلاغ</TableHead>
                  <TableHead>عنوان المشكلة</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>الفني</TableHead>
                  <TableHead>الـ SLA</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.slice(0, 5).map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-surface/50">
                    <TableCell className="font-display text-xs font-bold text-brand-ink">
                      <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }} className="hover:underline">
                        {ticket.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }} className="font-bold text-sm hover:underline block max-w-56 truncate">
                        {ticket.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{ticket.category}</span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{ticket.branch}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ticket.technician}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-brand-red flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {ticket.sla}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
        <Panel title="آخر الأحداث" icon={ArrowLeftRight} action={<Button asChild size="sm" variant="ghost"><Link to="/reports">السجل</Link></Button>}>
          <ol className="space-y-4 p-5">
            {ticketEvents.map((event) => (
              <li key={event.time} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-kpi-navy" />
                <div><p className="text-sm font-bold">{event.title} <span className="font-mono text-xs text-muted-foreground">{event.time}</span></p><p className="mt-0.5 text-xs text-muted-foreground">{event.text}</p></div>
              </li>
            ))}
          </ol>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Panel title="إشغال الفنيين" icon={Wrench} className="xl:col-span-1" action={<Button asChild size="sm" variant="ghost"><Link to="/technicians">الكل</Link></Button>}>
          <div className="space-y-4 p-5">
            {technicians.map((tech) => (
              <Link key={tech.id} to="/technicians/$technicianId" params={{ technicianId: tech.id }} className="block">
                <div className="flex items-center justify-between text-sm"><span className="font-bold">{tech.name}</span><span className="text-xs text-muted-foreground">{tech.load} مهام · {tech.completed} منجزة</span></div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-kpi-flame" style={{ width: `${Math.min(100, tech.load * 14)}%` }} /></div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="طلبات شراء للمراجعة" icon={ShoppingCart} className="xl:col-span-1" action={<Button asChild size="sm" variant="ghost"><Link to="/purchases">الكل</Link></Button>}>
          <div className="divide-y divide-border">
            {purchaseRequests.map((request) => (
              <div key={request.id} className="space-y-1 px-5 py-4">
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{request.item}</p><span className="font-mono text-xs font-bold text-brand-ink">{request.cost}</span></div>
                <p className="text-xs text-muted-foreground">{request.id} · {request.branch}</p>
                <div className="flex items-center gap-2 pt-1"><Badge variant="outline">{request.status}</Badge><Button size="sm" variant="outline">اعتماد</Button></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="أداء الفروع" icon={Building2} className="xl:col-span-1" action={<Button asChild size="sm" variant="ghost"><Link to="/branches">الكل</Link></Button>}>
          <div className="divide-y divide-border">
            {branches.map((branch) => (
              <Link key={branch.id} to="/branches/$branchId" params={{ branchId: branch.id }} className="block px-5 py-4 transition-colors hover:bg-surface">
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{branch.name}</p><span className="text-xs font-bold text-brand-green">★ {branch.satisfaction}</span></div>
                <p className="mt-1 text-xs text-muted-foreground">{branch.manager} · {branch.open} مفتوحة · {branch.closed} مغلقة</p>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="المهام العاجلة" icon={AlertTriangle} className="xl:col-span-1">
          <div className="space-y-3 p-5">
            <div className="rounded-md border border-border bg-surface p-3">
              <p className="text-sm font-bold">بلاغ حرج بلا فني</p>
              <p className="mt-1 text-xs text-muted-foreground">HD-2026-000448 · فرع الهرم · تحتاج إسناد فوراً</p>
              <Button asChild size="sm" className="mt-2 w-full"><Link to="/tickets">إسناد الآن</Link></Button>
            </div>
            <div className="rounded-md border border-border bg-surface p-3">
              <p className="text-sm font-bold">بلاغات قاربت التجاوز</p>
              <p className="mt-1 text-xs text-muted-foreground">4 بلاغات متبقية لها أقل من ساعة</p>
              <Button asChild size="sm" variant="outline" className="mt-2 w-full"><Link to="/tickets">متابعة</Link></Button>
            </div>
            <div className="rounded-md border border-border bg-surface p-3">
              <p className="text-sm font-bold">زيارة لم تُؤكد</p>
              <p className="mt-1 text-xs text-muted-foreground">زيارة صيانة دورية لفرع مدينة نصر غداً</p>
              <Button asChild size="sm" variant="outline" className="mt-2 w-full"><Link to="/field-service">تأكيد</Link></Button>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="إجراءات سريعة" icon={BadgeCheck}>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Button key={action.label} asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link to={action.to}><action.icon className="h-5 w-5" /><span className="text-xs font-bold">{action.label}</span></Link>
              </Button>
            ))}
          </div>
        </Panel>

        <Panel title="أعلى أعطال حسب التصنيف" icon={PackageCheck}>
          <div className="space-y-4 p-5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-sm"><span className="font-bold">{cat.label}</span><span className="font-mono text-xs font-bold text-brand-ink">{cat.count} بلاغ</span></div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-kpi-navy" style={{ width: `${cat.pct}%` }} /></div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">إجمالي 452 بلاغاً هذا الشهر عبر جميع الفروع.</p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4">
        <Panel title="مستوى الخدمة والالتزام" icon={Gauge}><SlaPanel /></Panel>
      </section>
    </AppShell>
  );
}
