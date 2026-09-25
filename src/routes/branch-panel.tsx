import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock3, ListChecks, MapPin, MessageSquare, Phone, Star, Ticket } from "lucide-react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { branches, tickets } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/branch-panel")({
  head: () => ({ meta: [{ title: "لوحة الفرع | وزير الحلو" }, { name: "description", content: "ملخص الفرع وبلاغاته ومهامه وبيانات التواصل." }, { property: "og:title", content: "لوحة الفرع | وزير الحلو" }, { property: "og:description", content: "ملخص الفرع وبلاغاته ومهامه وبيانات التواصل." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="لوحة الفرع" role="branch"><Overview /></AppShell>,
});

function Overview() {
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;
  const rows = tickets.filter((t) => t.branchId === branch.id);
  return <>
    <div><h1 className="text-2xl font-bold">{branch.name}</h1><p className="mt-1 text-sm text-muted-foreground">مدير الفرع: {branch.manager}</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="بلاغات مفتوحة" value={String(rows.length)} icon={Clock3} tone="amber" /><Stat label="بلاغات مغلقة" value={String(branch.closed)} icon={CheckCircle2} tone="forest" /><Stat label="رضا الفرع" value={`${branch.satisfaction}/5`} icon={Star} tone="navy" /><Stat label="الحالة" value="يعمل" icon={Building2} tone="sage" /></section>
    <section className="grid gap-3 sm:grid-cols-3">
      {([["/branch-tickets", "البلاغات", "إنشاء ومتابعة بلاغات الفرع", Ticket], ["/branch-tasks", "المهام", "مهام الفرع اليومية", ListChecks], ["/branch-chat", "المحادثة", "تواصل مع الإدارة والفنيين", MessageSquare]] as const).map(([to, label, text, Icon]) => <Link key={to} to={to} className="rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted"><Icon className="h-6 w-6 text-brand-ink" /><p className="mt-3 font-bold">{label}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></Link>)}
    </section>
    <Panel title="أحدث البلاغات" icon={Ticket} action={<Button asChild size="sm" variant="outline"><Link to="/branch-tickets">عرض الكل</Link></Button>}><div className="divide-y divide-border">{rows.map((t) => <div key={t.id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-display text-xs font-bold text-brand-ink">{t.id}</p><p className="mt-1 font-bold">{t.title}</p></div><Badge variant="outline">{t.status}</Badge></div>)}{rows.length === 0 && <p className="p-4 text-sm text-muted-foreground">لا توجد بلاغات.</p>}</div></Panel>
    <Panel title="بيانات التواصل"><div className="grid gap-4 p-5 sm:grid-cols-2"><div className="flex gap-3"><Phone className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">الهاتف</p><p className="mt-1 font-bold" dir="ltr">{branch.phone}</p></div></div><div className="flex gap-3"><MapPin className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">العنوان</p><p className="mt-1 font-bold">{branch.address}</p></div></div></div></Panel>
  </>;
}
