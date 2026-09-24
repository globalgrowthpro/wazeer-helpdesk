import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Clock3, LifeBuoy, MapPin, ShoppingCart, Sparkles, UsersRound } from "lucide-react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tickets } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "وزير الحلو | لوحة العمليات" },
    { name: "description", content: "لوحة متابعة عربية لعمليات الدعم والصيانة." },
    { property: "og:title", content: "وزير الحلو | لوحة العمليات" },
    { property: "og:description", content: "متابعة البلاغات والفنيين ومستوى الخدمة." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});

const stats = [
  { label: "إجمالي البلاغات", value: "452", note: "+12 هذا الأسبوع", icon: LifeBuoy },
  { label: "البلاغات المفتوحة", value: "46", note: "نشطة الآن", icon: Clock3 },
  { label: "بلاغات حرجة", value: "3", note: "تحتاج تدخلاً", icon: AlertTriangle },
  { label: "تم حلها اليوم", value: "295", note: "بلاغاً", icon: CheckCircle2 },
  { label: "طلبات الشراء", value: "17", note: "5 بانتظار الاعتماد", icon: ShoppingCart },
  { label: "رضا الفروع", value: "4.8/5", note: "تقييم مرتفع", icon: Sparkles },
  { label: "الفنيون النشطون", value: "23", note: "من أصل 28", icon: UsersRound },
  { label: "زيارات اليوم", value: "8", note: "3 قيد التنفيذ", icon: MapPin },
  { label: "تكلفة الشهر", value: "48.2K", note: "جنيه مصري", icon: CircleDollarSign },
];

function Dashboard() {
  return <AppShell title="لوحة العمليات"><SectionHeading title="نظرة عامة" description="ملخص مباشر لأداء الدعم والصيانة اليوم" action={<Button asChild><Link to="/tickets">عرض جميع البلاغات</Link></Button>} />
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{stats.map((stat) => <Stat key={stat.label} {...stat} />)}</section>
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)]"><Panel title="البلاغات النشطة" action={<Button asChild size="sm" variant="ghost"><Link to="/tickets">عرض الكل</Link></Button>}><div className="divide-y divide-border">{tickets.map((ticket) => <Link key={ticket.id} to="/tickets/$ticketId" params={{ ticketId: ticket.id }} className="grid gap-2 px-5 py-4 transition-colors hover:bg-surface sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="text-xs font-bold text-brand-ink">{ticket.id}</p><p className="mt-1 text-sm font-bold">{ticket.title}</p><p className="mt-1 text-xs text-muted-foreground">{ticket.branch} · {ticket.category}</p></div><span className="font-mono text-sm font-bold text-brand-red">{ticket.sla}</span><Badge variant="outline">{ticket.status}</Badge></Link>)}</div></Panel>
      <Panel title="توزيع الحالات"><div className="flex flex-col items-center p-5"><div className="ticket-donut grid h-44 w-44 place-items-center rounded-full"><div className="grid h-28 w-28 place-items-center rounded-full bg-card text-center"><div><p className="font-display text-3xl font-bold">452</p><p className="text-xs text-muted-foreground">إجمالي البلاغات</p></div></div></div><div className="mt-6 grid w-full grid-cols-2 gap-3 text-xs"><span>● مغلقة 61%</span><span className="text-brand-green">● محلولة 12%</span><span className="text-brand-gold">● انتظار 8%</span><span className="text-brand-ink">● مفتوحة 19%</span></div></div></Panel></section>
  </AppShell>;
}