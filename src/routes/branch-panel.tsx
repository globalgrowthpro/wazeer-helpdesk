import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Building2, CheckCircle2, Clock3, ListChecks, MapPin, MessageSquare, Phone, Star, Ticket, UsersRound } from "lucide-react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/auth";
import { branches, tickets } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/branch-panel")({
  head: () => ({ meta: [{ title: "لوحة الفرع | وزير الحلو" }, { name: "description", content: "ملخص الفرع وبلاغاته ومهامه وبيانات التواصل." }, { property: "og:title", content: "لوحة الفرع | وزير الحلو" }, { property: "og:description", content: "ملخص الفرع وبلاغاته ومهامه وبيانات التواصل." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="لوحة الفرع" role="branch"><Overview /></AppShell>,
});

function Overview() {
  const navigate = useNavigate();
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;
  const rows = tickets.filter((t) => t.branchId === branch.id);
  return <>
    <div><h1 className="text-2xl font-bold">{branch.name}</h1><p className="mt-1 text-sm text-muted-foreground">مدير الفرع: {branch.manager}</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="بلاغات مفتوحة" value={String(rows.length)} icon={Clock3} tone="amber" /><Stat label="بلاغات مغلقة" value={String(branch.closed)} icon={CheckCircle2} tone="forest" /><Stat label="رضا الفرع" value={`${branch.satisfaction}/5`} icon={Star} tone="navy" /><Stat label="الحالة" value="يعمل" icon={Building2} tone="sage" /></section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {([["/branch-tickets", "البلاغات", "إنشاء ومتابعة بلاغات الفرع", Ticket], ["/branch-tasks", "المهام", "مهام الفرع اليومية", ListChecks], ["/branch-staff", "طاقم العمل", "موظفو الفرع وفنيو الصيانة", UsersRound], ["/branch-chat", "المحادثة", "تواصل مع الإدارة والفنيين", MessageSquare]] as const).map(([to, label, text, Icon]) => <Link key={to} to={to} className="rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted"><Icon className="h-6 w-6 text-brand-ink" /><p className="mt-3 font-bold">{label}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></Link>)}
    </section>
    <Panel title="أحدث البلاغات" icon={Ticket} action={<Button asChild size="sm" variant="outline"><Link to="/branch-tickets">عرض الكل</Link></Button>}>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground text-center">لا توجد بلاغات مسجلة للفرع.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">رقم البلاغ</TableHead>
                <TableHead>عنوان المشكلة</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="w-24 text-center">تفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-surface/50 cursor-pointer transition-colors"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button") || target.closest("a")) return;
                    navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                  }}
                >
                  <TableCell className="font-display text-xs font-bold text-brand-ink">
                    <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="hover:underline">
                      {t.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="font-bold text-sm hover:underline block max-w-xs truncate">
                      {t.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                      <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
                        عرض
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
    <Panel title="بيانات التواصل"><div className="grid gap-4 p-5 sm:grid-cols-2"><div className="flex gap-3"><Phone className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">الهاتف</p><p className="mt-1 font-bold" dir="ltr">{branch.phone}</p></div></div><div className="flex gap-3"><MapPin className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">العنوان</p><p className="mt-1 font-bold">{branch.address}</p></div></div></div></Panel>
  </>;
}
